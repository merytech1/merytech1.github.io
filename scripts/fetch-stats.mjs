// Fetches GitHub stats and writes public/data/stats.json for the dashboard.
// Runs in CI every 5 hours (GITHUB_TOKEN) or locally (falls back to `gh auth token`).
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const LOGIN = "merytech1";
const OUT_DIR = "public/data";

function getToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync("gh auth token", { encoding: "utf8" }).trim();
  } catch {
    throw new Error("No token: set GITHUB_TOKEN or log in with `gh auth login`.");
  }
}

const QUERY = `
query ($login: String!) {
  user(login: $login) {
    login
    name
    avatarUrl
    createdAt
    followers { totalCount }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalRepositoryContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
      commitContributionsByRepository(maxRepositories: 25) {
        repository { name }
        contributions { totalCount }
      }
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC,
                 orderBy: { field: PUSHED_AT, direction: DESC }) {
      totalCount
      nodes {
        name
        description
        url
        homepageUrl
        stargazerCount
        forkCount
        pushedAt
        primaryLanguage { name color }
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
  }
}`;

async function fetchUser(token) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data.user;
}

function computeStreaks(days) {
  // days sorted ascending; today may still have 0 contributions without breaking the streak
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let current = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  for (; i >= 0 && days[i].count > 0; i--) current++;
  return { current, longest };
}

function aggregateLanguages(repos) {
  const totals = new Map();
  for (const repo of repos) {
    for (const { size, node } of repo.languages.edges) {
      const prev = totals.get(node.name) ?? { name: node.name, color: node.color, bytes: 0, repos: 0 };
      prev.bytes += size;
      prev.repos += 1;
      totals.set(node.name, prev);
    }
  }
  return [...totals.values()].sort((a, b) => b.bytes - a.bytes);
}

const user = await fetchUser(getToken());
const cc = user.contributionsCollection;

const days = cc.contributionCalendar.weeks
  .flatMap((w) => w.contributionDays)
  .map((d) => ({ date: d.date, count: d.contributionCount }));

const repos = user.repositories.nodes.map((r) => ({
  name: r.name,
  description: r.description,
  url: r.url,
  homepage: r.homepageUrl || null,
  stars: r.stargazerCount,
  forks: r.forkCount,
  pushedAt: r.pushedAt,
  language: r.primaryLanguage?.name ?? null,
  languageColor: r.primaryLanguage?.color ?? null,
  languages: r.languages.edges.map((e) => e.node.name),
}));

const stats = {
  generatedAt: new Date().toISOString(),
  user: {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    followers: user.followers.totalCount,
    publicRepos: user.repositories.totalCount,
  },
  totals: {
    contributions: cc.contributionCalendar.totalContributions,
    commits: cc.totalCommitContributions,
    pullRequests: cc.totalPullRequestContributions,
    issues: cc.totalIssueContributions,
    reposCreated: cc.totalRepositoryContributions,
    stars: repos.reduce((sum, r) => sum + r.stars, 0),
  },
  streaks: computeStreaks(days),
  days,
  commitsByRepo: cc.commitContributionsByRepository.map((c) => ({
    repo: c.repository.name,
    commits: c.contributions.totalCount,
  })),
  languages: aggregateLanguages(user.repositories.nodes),
  repos,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(`${OUT_DIR}/stats.json`, JSON.stringify(stats));
console.log(
  `stats.json: ${stats.totals.contributions} contributions, ${repos.length} repos, ` +
    `${stats.languages.length} languages, streak ${stats.streaks.current}/${stats.streaks.longest}`,
);
