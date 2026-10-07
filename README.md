# Rafael Viotti — Portfolio

Personal site of Rafael Viotti, AI engineer (infrastructure, RAG, LLMOps).

**Live:** https://viiotti.github.io/portifolio/

## What is here

| Path | What it is |
|---|---|
| `index.html`, `assets/`, `resume/`, `404.html` | The current site: hand-written HTML, CSS and JavaScript, no build step |
| `sw.js` | Retired service worker. It only removes the caches of an older cache-first version and unregisters itself. Keep it at this path (see the comment inside) |
| `site/` | The next version of the site (Astro). Not published until GitHub Pages is switched to deploy from GitHub Actions |
| `docs/` | Design spec and implementation plans. Not published |

## Run locally

The site is served from `/portifolio/`, so serve the repository from a parent folder:

```bash
mkdir -p /tmp/serve && ln -s "$PWD" /tmp/serve/portifolio
python3 -m http.server 8000 --directory /tmp/serve
# open http://localhost:8000/portifolio/
```

## Deploy

GitHub Pages publishes the `main` branch. `_config.yml` keeps `docs/`, `site/` and internal files out of the published site.

## Quality bar

- Lighthouse 95+ for performance and accessibility on every page
- WCAG AA text contrast in both themes
- Respects `prefers-reduced-motion`
- No claim on the site without evidence behind it
