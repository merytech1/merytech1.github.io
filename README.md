# merytech1.github.io

Portfolio de **Meriyei Manosalva** · Full Stack Developer → https://merytech1.github.io

Hecho con [Astro](https://astro.build) + React + [ECharts](https://echarts.apache.org), desplegado en GitHub Pages.

## Desarrollo

```bash
nvm use            # Node 22.23.5 (.nvmrc)
npm install
npm run stats      # genera public/data/stats.json (usa GITHUB_TOKEN o `gh auth token`)
npm run dev        # http://localhost:4321
```

## Cómo se actualiza el dashboard

El workflow [`deploy.yml`](.github/workflows/deploy.yml) corre en cada push a `main` y **cada 5 horas**:
consulta la API GraphQL de GitHub, genera `stats.json`, compila el sitio y lo publica en Pages.
Además, la tabla de repos consulta la API pública en vivo desde el navegador del visitante.
