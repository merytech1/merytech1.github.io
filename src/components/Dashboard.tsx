import { useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts/core";
import { BarChart, HeatmapChart, PieChart } from "echarts/charts";
import {
  CalendarComponent,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { EChartsCoreOption } from "echarts/core";
import type { DashboardStrings } from "../i18n";
import "./Dashboard.css";

echarts.use([
  BarChart,
  HeatmapChart,
  PieChart,
  CalendarComponent,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  SVGRenderer,
]);

const LOGIN = "merytech1";
const REPO_PREVIEW = 8;

const C = {
  text: "#ecebf5",
  muted: "#a7a3c4",
  border: "#2f2c4a",
  surface: "#1b1a2d",
  empty: "#232139",
  pink: "#fe428e",
  cyan: "#a9fef7",
  violet: "#ae81ff",
};

interface Repo {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  forks: number;
  pushedAt: string;
  language: string | null;
  languageColor: string | null;
  languages: string[];
}

interface Stats {
  generatedAt: string;
  user: { login: string; publicRepos: number };
  totals: { contributions: number; commits: number; stars: number };
  streaks: { current: number; longest: number };
  days: { date: string; count: number }[];
  commitsByRepo: { repo: string; commits: number }[];
  languages: { name: string; color: string | null; bytes: number; repos: number }[];
  repos: Repo[];
}

interface LiveRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  language: string | null;
  fork: boolean;
}

const tooltipBase = {
  backgroundColor: C.surface,
  borderColor: C.border,
  textStyle: { color: C.text, fontFamily: "Space Grotesk, sans-serif" },
  extraCssText: "border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.4);",
};

function Chart({
  option,
  height,
  onClick,
  minWidth,
}: {
  option: EChartsCoreOption;
  height: number;
  onClick?: (params: any) => void;
  minWidth?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const clickRef = useRef(onClick);
  clickRef.current = onClick;

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current, undefined, { renderer: "svg" });
    chartRef.current = chart;
    chart.on("click", (p) => clickRef.current?.(p));
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      chart.dispose();
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true });
  }, [option]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Wide charts (calendar) open on the most recent data on small screens
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, []);

  const chart = <div ref={ref} style={{ height, width: "100%", minWidth }} />;
  return minWidth ? (
    <div className="dash-scroll" ref={scrollRef}>
      {chart}
    </div>
  ) : (
    chart
  );
}

function mergeLive(snapshot: Repo[], live: LiveRepo[]): Repo[] {
  const byName = new Map(snapshot.map((r) => [r.name, r]));
  return live
    .filter((r) => !r.fork)
    .map((r) => {
      const snap = byName.get(r.name);
      return {
        name: r.name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage || null,
        stars: r.stargazers_count,
        forks: r.forks_count,
        pushedAt: r.pushed_at,
        language: r.language,
        languageColor: snap?.languageColor ?? null,
        languages: snap?.languages ?? (r.language ? [r.language] : []),
      };
    });
}

export default function Dashboard({ strings: t }: { strings: DashboardStrings }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [live, setLive] = useState(false);
  const [lang, setLang] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/data/stats.json", { cache: "no-cache" });
        if (!res.ok) throw new Error(String(res.status));
        const data: Stats = await res.json();
        if (cancelled) return;
        setStats(data);
        setRepos(data.repos);
        // Live layer: public REST API, no token (60 req/h per visitor is plenty)
        try {
          const liveRes = await fetch(
            `https://api.github.com/users/${LOGIN}/repos?per_page=100&sort=pushed`,
          );
          if (!liveRes.ok) return;
          const liveData: LiveRepo[] = await liveRes.json();
          if (!cancelled) {
            setRepos(mergeLive(data.repos, liveData));
            setLive(true);
          }
        } catch {
          /* keep snapshot repos */
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const nf = useMemo(() => new Intl.NumberFormat(t.locale), [t.locale]);
  const df = useMemo(
    () => new Intl.DateTimeFormat(t.locale, { day: "numeric", month: "short", year: "numeric" }),
    [t.locale],
  );
  const mf = useMemo(
    () => new Intl.DateTimeFormat(t.locale, { month: "short", year: "2-digit", timeZone: "UTC" }),
    [t.locale],
  );

  const langColor = useMemo(() => {
    const map = new Map<string, string>();
    stats?.languages.forEach((l) => map.set(l.name, l.color ?? C.violet));
    return map;
  }, [stats]);

  const filteredRepos = useMemo(() => {
    const q = query.trim().toLowerCase();
    return repos.filter(
      (r) =>
        (!lang || r.languages.includes(lang) || r.language === lang) &&
        (!q || r.name.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q)),
    );
  }, [repos, lang, query]);

  const calendarOption = useMemo<EChartsCoreOption>(() => {
    if (!stats) return {};
    const days = stats.days;
    const max = Math.max(1, ...days.map((d) => d.count));
    return {
      tooltip: {
        ...tooltipBase,
        formatter: (p: any) =>
          `<b>${nf.format(p.value[1])}</b> ${t.contributions}<br/>${df.format(new Date(p.value[0] + "T12:00:00"))}`,
      },
      visualMap: {
        show: false,
        type: "piecewise",
        pieces: [
          { value: 0, color: C.empty },
          { min: 1, max: Math.max(1, Math.round(max * 0.25)), color: "#7a2d7c" },
          { min: Math.round(max * 0.25) + 1, max: Math.round(max * 0.5), color: "#b5368a" },
          { min: Math.round(max * 0.5) + 1, max: Math.round(max * 0.75), color: "#e23d8b" },
          { min: Math.round(max * 0.75) + 1, color: "#ff7ab0" },
        ],
      },
      calendar: {
        range: [days[0].date, days[days.length - 1].date],
        top: 28,
        left: 36,
        right: 8,
        cellSize: ["auto", 14],
        splitLine: { show: false },
        itemStyle: { color: C.empty, borderColor: C.surface, borderWidth: 3 },
        yearLabel: { show: false },
        dayLabel: { color: C.muted, nameMap: [...t.weekdays], firstDay: 0, fontSize: 10 },
        monthLabel: {
          color: C.muted,
          fontSize: 11,
          nameMap: Array.from({ length: 12 }, (_, m) =>
            new Intl.DateTimeFormat(t.locale, { month: "short", timeZone: "UTC" }).format(
              new Date(Date.UTC(2024, m, 1)),
            ),
          ),
        },
      },
      series: {
        type: "heatmap",
        coordinateSystem: "calendar",
        data: days.map((d) => [d.date, d.count]),
      },
    };
  }, [stats, nf, df, t]);

  const monthlyOption = useMemo<EChartsCoreOption>(() => {
    if (!stats) return {};
    const byMonth = new Map<string, number>();
    stats.days.forEach((d) => {
      const key = d.date.slice(0, 7);
      byMonth.set(key, (byMonth.get(key) ?? 0) + d.count);
    });
    const keys = [...byMonth.keys()];
    return {
      grid: { top: 16, left: 40, right: 12, bottom: 28 },
      tooltip: { ...tooltipBase, trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: {
        type: "category",
        data: keys.map((k) => mf.format(new Date(k + "-01T00:00:00Z"))),
        axisLine: { lineStyle: { color: C.border } },
        axisLabel: { color: C.muted, fontSize: 11 },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: C.border, type: "dashed" } },
        axisLabel: { color: C.muted },
      },
      series: {
        type: "bar",
        name: t.contributions,
        data: keys.map((k) => byMonth.get(k)),
        barMaxWidth: 28,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: C.pink },
            { offset: 1, color: "#7f00ff" },
          ]),
        },
        emphasis: { itemStyle: { color: C.cyan } },
      },
    };
  }, [stats, mf, t]);

  const weekdayOption = useMemo<EChartsCoreOption>(() => {
    if (!stats) return {};
    const totals = Array(7).fill(0);
    stats.days.forEach((d) => {
      totals[new Date(d.date + "T12:00:00").getDay()] += d.count;
    });
    return {
      grid: { top: 16, left: 40, right: 12, bottom: 28 },
      tooltip: { ...tooltipBase, trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: {
        type: "category",
        data: [...t.weekdays],
        axisLine: { lineStyle: { color: C.border } },
        axisLabel: { color: C.muted },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: C.border, type: "dashed" } },
        axisLabel: { color: C.muted },
      },
      series: {
        type: "bar",
        name: t.contributions,
        data: totals,
        barMaxWidth: 32,
        itemStyle: { borderRadius: [6, 6, 0, 0], color: C.cyan },
        emphasis: { itemStyle: { color: C.pink } },
      },
    };
  }, [stats, t]);

  const languagesOption = useMemo<EChartsCoreOption>(() => {
    if (!stats) return {};
    const top = stats.languages.slice(0, 8);
    const total = stats.languages.reduce((s, l) => s + l.bytes, 0);
    return {
      tooltip: {
        ...tooltipBase,
        formatter: (p: any) =>
          `<b>${p.name}</b><br/>${((p.value / total) * 100).toFixed(1)}% · ${p.data.repos} repos`,
      },
      series: {
        type: "pie",
        radius: ["45%", "70%"],
        center: ["50%", "50%"],
        selectedMode: "single",
        selectedOffset: 8,
        padAngle: 2,
        itemStyle: { borderRadius: 6 },
        label: { color: C.text, formatter: "{b}", fontSize: 12, overflow: "none" },
        labelLayout: { hideOverlap: true },
        labelLine: { lineStyle: { color: C.border } },
        data: top.map((l) => ({
          name: l.name,
          value: l.bytes,
          repos: l.repos,
          selected: l.name === lang,
          itemStyle: {
            color: l.color ?? C.violet,
            opacity: !lang || l.name === lang ? 1 : 0.3,
          },
        })),
      },
    };
  }, [stats, lang]);

  const commitsOption = useMemo<EChartsCoreOption>(() => {
    if (!stats) return {};
    const repoLang = new Map(repos.map((r) => [r.name, r]));
    const rows = stats.commitsByRepo
      .filter((c) => {
        const r = repoLang.get(c.repo);
        return !lang || (r && (r.languages.includes(lang) || r.language === lang));
      })
      .slice(0, 10)
      .reverse();
    return {
      grid: { top: 8, left: 8, right: 36, bottom: 8, containLabel: true },
      tooltip: { ...tooltipBase, trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: { type: "value", show: false },
      yAxis: {
        type: "category",
        data: rows.map((r) => r.repo),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: C.text, fontFamily: "Fira Code, monospace", fontSize: 11 },
      },
      series: {
        type: "bar",
        name: t.commits,
        data: rows.map((r) => ({
          value: r.commits,
          itemStyle: { color: langColor.get(repoLang.get(r.repo)?.language ?? "") ?? C.pink },
        })),
        barMaxWidth: 18,
        itemStyle: { borderRadius: [0, 6, 6, 0] },
        label: { show: true, position: "right", color: C.muted, fontSize: 11 },
        cursor: "pointer",
      },
    };
  }, [stats, repos, lang, langColor, t]);

  if (error) return <p className="dash-empty">{t.noData}</p>;
  if (!stats) return <div className="dash-skeleton" aria-busy="true" />;

  const kpis = [
    { label: t.kpiContrib, value: nf.format(stats.totals.contributions) },
    { label: t.kpiCurrent, value: `${stats.streaks.current} ${t.days}` },
    { label: t.kpiLongest, value: `${stats.streaks.longest} ${t.days}` },
    { label: t.kpiRepos, value: nf.format(repos.length || stats.user.publicRepos) },
    { label: t.kpiCommits, value: nf.format(stats.totals.commits) },
  ];

  return (
    <div className="dash">
      <div className="dash-meta">
        <span>
          {t.updated}: {new Date(stats.generatedAt).toLocaleString(t.locale)}
        </span>
        <span className={`dash-pill ${live ? "is-live" : ""}`}>{live ? t.live : t.cached}</span>
      </div>

      <div className="dash-kpis">
        {kpis.map((k) => (
          <div key={k.label} className="dash-kpi">
            <span className="dash-kpi-value">{k.value}</span>
            <span className="dash-kpi-label">{k.label}</span>
          </div>
        ))}
      </div>

      <div className="dash-panel dash-wide">
        <h3>{t.calendar}</h3>
        <Chart option={calendarOption} height={160} minWidth={760} />
      </div>

      <div className="dash-grid">
        <div className="dash-panel">
          <h3>{t.monthly}</h3>
          <Chart option={monthlyOption} height={240} />
        </div>
        <div className="dash-panel">
          <h3>{t.weekday}</h3>
          <Chart option={weekdayOption} height={240} />
        </div>
        <div className="dash-panel">
          <h3>{t.languages}</h3>
          <p className="dash-hint">{t.languagesHint}</p>
          <Chart
            option={languagesOption}
            height={280}
            onClick={(p) => setLang((cur) => (cur === p.name ? null : p.name))}
          />
        </div>
        <div className="dash-panel">
          <h3>{t.commitsByRepo}</h3>
          <Chart
            option={commitsOption}
            height={300}
            onClick={(p) => setQuery((cur) => (cur === p.name ? "" : p.name))}
          />
        </div>
      </div>

      <div className="dash-panel dash-wide">
        <div className="dash-table-head">
          <h3>
            {t.repos} <span className="dash-count">{filteredRepos.length}</span>
          </h3>
          <div className="dash-filters">
            <input
              type="search"
              placeholder={t.search}
              aria-label={t.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              aria-label={t.colLang}
              value={lang ?? ""}
              onChange={(e) => setLang(e.target.value || null)}
            >
              <option value="">{t.allLanguages}</option>
              {stats.languages.map((l) => (
                <option key={l.name} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
            {(lang || query) && (
              <button
                type="button"
                onClick={() => {
                  setLang(null);
                  setQuery("");
                }}
              >
                {t.clear}
              </button>
            )}
          </div>
        </div>
        {filteredRepos.length === 0 ? (
          <p className="dash-empty">{t.noRepos}</p>
        ) : (
          <div className="dash-scroll">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t.colName}</th>
                  <th>{t.colLang}</th>
                  <th className="num">{t.colStars}</th>
                  <th>{t.colPushed}</th>
                </tr>
              </thead>
              <tbody>
                {(showAll ? filteredRepos : filteredRepos.slice(0, REPO_PREVIEW)).map((r) => (
                  <tr key={r.name}>
                    <td>
                      <a href={r.url} target="_blank" rel="noopener">
                        {r.name}
                      </a>
                      {r.description && <span className="dash-desc">{r.description}</span>}
                    </td>
                    <td>
                      {r.language && (
                        <span className="dash-lang">
                          <i style={{ background: langColor.get(r.language) ?? r.languageColor ?? C.violet }} />
                          {r.language}
                        </span>
                      )}
                    </td>
                    <td className="num">{r.stars}</td>
                    <td className="nowrap">{df.format(new Date(r.pushedAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRepos.length > REPO_PREVIEW && (
              <button type="button" className="dash-more" onClick={() => setShowAll((v) => !v)}>
                {showAll ? t.showLess : `${t.showAll} (${filteredRepos.length})`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
