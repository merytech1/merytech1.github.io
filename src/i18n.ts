export type Lang = "es" | "en";

export const ui = {
  es: {
    meta: {
      title: "Meriyei Manosalva · Full Stack Developer",
      description:
        "Portfolio de Meriyei Manosalva, Full Stack Developer: React, TypeScript, Python, FastAPI y Kotlin.",
    },
    nav: { about: "Sobre mí", stack: "Stack", projects: "Proyectos", dashboard: "Dashboard", contact: "Contacto" },
    hero: {
      typing:
        "%C2%A1Hola!+Soy+Meriyei+%F0%9F%91%8B;Full+Stack+Developer+%F0%9F%92%BB;React+%C2%B7+TypeScript+%C2%B7+Python+%C2%B7+FastAPI;Kotlin+%C2%B7+Android+TV+%F0%9F%93%BA",
    },
    about: {
      title: "Sobre mí",
      items: [
        ["💼", "Full Stack Developer: construyo aplicaciones web de punta a punta, desde la interfaz hasta la API y la base de datos."],
        ["🔭", "Actualmente trabajo en tvshields, un navegador ligero para Android TV con bloqueo de anuncios al estilo Brave."],
        ["🌱", "Sigo aprendiendo sobre machine learning y desarrollo Android con Kotlin."],
        ["🤝", "Me interesa colaborar en proyectos open source y productos con enfoque en la privacidad."],
      ],
    },
    stack: { title: "Tech Stack", frontend: "Frontend", backend: "Backend", tools: "DevOps y herramientas" },
    projects: {
      title: "Proyectos destacados",
      repo: "Código",
      demo: "Demo",
      tvshields:
        "Navegador open source y ligero para Android TV con protección al estilo Brave Shields: bloqueo de anuncios a nivel de red con listas de filtros, filtrado cosmético y reemplazo de scripts anti-adblock. Pensado para el control remoto.",
      eva:
        "PWA de salud menstrual privacy-first: datos locales primero, predicciones personalizadas con machine learning por usuaria, funcionamiento offline y exportación libre de datos en PDF/CSV.",
    },
    dashboard: {
      title: "Dashboard de GitHub",
      subtitle: "Datos reales de mi actividad, actualizados automáticamente cada 5 horas.",
      updated: "Actualizado",
      live: "Repos en vivo",
      cached: "Repos del último corte",
      kpiContrib: "Contribuciones (último año)",
      kpiCurrent: "Racha actual",
      kpiLongest: "Racha más larga",
      kpiRepos: "Repos públicos",
      kpiCommits: "Commits (último año)",
      showAll: "Ver todos",
      showLess: "Ver menos",
      days: "días",
      calendar: "Calendario de contribuciones",
      monthly: "Contribuciones por mes",
      weekday: "Actividad por día de la semana",
      languages: "Lenguajes (por código)",
      languagesHint: "Haz clic en un lenguaje para filtrar los repos.",
      commitsByRepo: "Commits por repositorio (último año)",
      repos: "Repositorios",
      search: "Buscar repo…",
      allLanguages: "Todos los lenguajes",
      clear: "Quitar filtro",
      colName: "Repo",
      colLang: "Lenguaje",
      colStars: "★",
      colPushed: "Último push",
      contributions: "contribuciones",
      commits: "commits",
      noData: "No se pudieron cargar las estadísticas.",
      noRepos: "Ningún repo coincide con el filtro.",
      weekdays: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
      locale: "es-CO",
    },
    contact: {
      title: "Contacto",
      text: "¿Tienes un proyecto o una oportunidad? Escríbeme.",
    },
    footer: "Hecho con Astro, React y ECharts · Desplegado en GitHub Pages",
  },
  en: {
    meta: {
      title: "Meriyei Manosalva · Full Stack Developer",
      description:
        "Portfolio of Meriyei Manosalva, Full Stack Developer: React, TypeScript, Python, FastAPI and Kotlin.",
    },
    nav: { about: "About", stack: "Stack", projects: "Projects", dashboard: "Dashboard", contact: "Contact" },
    hero: {
      typing:
        "Hi!+I'm+Meriyei+%F0%9F%91%8B;Full+Stack+Developer+%F0%9F%92%BB;React+%C2%B7+TypeScript+%C2%B7+Python+%C2%B7+FastAPI;Kotlin+%C2%B7+Android+TV+%F0%9F%93%BA",
    },
    about: {
      title: "About me",
      items: [
        ["💼", "Full Stack Developer: I build web applications end to end, from the UI to the API and the database."],
        ["🔭", "Currently working on tvshields, a lightweight Android TV browser with Brave-style ad blocking."],
        ["🌱", "Learning more about machine learning and Android development with Kotlin."],
        ["🤝", "Open to collaborating on open source and privacy-first products."],
      ],
    },
    stack: { title: "Tech Stack", frontend: "Frontend", backend: "Backend", tools: "DevOps & tools" },
    projects: {
      title: "Featured projects",
      repo: "Code",
      demo: "Demo",
      tvshields:
        "Lightweight open-source Android TV browser with Brave-style Shields: network ad blocking with filter lists, cosmetic filtering and anti-adblock script replacement. Built for the TV remote.",
      eva:
        "Privacy-first menstrual health PWA: local-first data, per-user machine learning predictions, offline support and free data export to PDF/CSV.",
    },
    dashboard: {
      title: "GitHub Dashboard",
      subtitle: "Real data from my activity, refreshed automatically every 5 hours.",
      updated: "Updated",
      live: "Live repos",
      cached: "Repos from last snapshot",
      kpiContrib: "Contributions (last year)",
      kpiCurrent: "Current streak",
      kpiLongest: "Longest streak",
      kpiRepos: "Public repos",
      kpiCommits: "Commits (last year)",
      showAll: "Show all",
      showLess: "Show less",
      days: "days",
      calendar: "Contribution calendar",
      monthly: "Contributions per month",
      weekday: "Activity by weekday",
      languages: "Languages (by code)",
      languagesHint: "Click a language to filter the repos.",
      commitsByRepo: "Commits per repository (last year)",
      repos: "Repositories",
      search: "Search repo…",
      allLanguages: "All languages",
      clear: "Clear filter",
      colName: "Repo",
      colLang: "Language",
      colStars: "★",
      colPushed: "Last push",
      contributions: "contributions",
      commits: "commits",
      noData: "Stats could not be loaded.",
      noRepos: "No repo matches the filter.",
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      locale: "en-US",
    },
    contact: {
      title: "Contact",
      text: "Have a project or an opportunity? Get in touch.",
    },
    footer: "Built with Astro, React and ECharts · Deployed on GitHub Pages",
  },
} as const;

export type DashboardStrings = (typeof ui)[Lang]["dashboard"];

export const stack = {
  frontend: [
    ["html", "HTML", "https://developer.mozilla.org/docs/Web/HTML"],
    ["css", "CSS", "https://developer.mozilla.org/docs/Web/CSS"],
    ["js", "JavaScript", "https://developer.mozilla.org/docs/Web/JavaScript"],
    ["ts", "TypeScript", "https://www.typescriptlang.org/"],
    ["react", "React", "https://react.dev/"],
    ["tailwind", "Tailwind CSS", "https://tailwindcss.com/"],
  ],
  backend: [
    ["python", "Python", "https://www.python.org/"],
    ["fastapi", "FastAPI", "https://fastapi.tiangolo.com/"],
    ["nodejs", "Node.js", "https://nodejs.org/"],
    ["express", "Express", "https://expressjs.com/"],
    ["php", "PHP", "https://www.php.net/"],
    ["kotlin", "Kotlin", "https://kotlinlang.org/"],
    ["postgres", "PostgreSQL", "https://www.postgresql.org/"],
    ["mysql", "MySQL", "https://www.mysql.com/"],
  ],
  tools: [
    ["git", "Git", "https://git-scm.com/"],
    ["github", "GitHub", "https://github.com/"],
    ["docker", "Docker", "https://www.docker.com/"],
    ["linux", "Linux", "https://www.kernel.org/"],
    ["vscode", "VS Code", "https://code.visualstudio.com/"],
    ["postman", "Postman", "https://www.postman.com/"],
    ["androidstudio", "Android Studio", "https://developer.android.com/studio"],
  ],
} as const;
