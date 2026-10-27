# Rafael Viotti — Portfolio

Personal site of Rafael Viotti, Senior AI Engineer (Infrastructure, RAG & LLMOps).

**Live:** https://viiotti.github.io/portifolio/  
**Custom Domain:** https://rafaelviotti.dev (in setup)

## Architecture & Technology Stack

The site is built with modern **Astro** (`site/`) and published automatically via GitHub Actions (`.github/workflows/site.yml`).

| Path | What it is |
|---|---|
| `site/` | Modern Astro source application (Geist Variable fonts, Telemetry theme, Command Palette `Ctrl+K`, interactive hire flows) |
| `site/dist/` | Production build artifact compiled by Astro and deployed to GitHub Pages |
| `site/src/pages/` | All application routes: `/` (Home), `/about/` (4-Act Evolution), `/resume/` (Print-ready CV), `/hire/` (Contracting intake), `/now/` (Focus), `/stack/` (Tools & Infrastructure), `/privacy/` (Zero-tracking policy), `/work/self-hosted-rag/` (Mother / Hermes case study) |
| `sw.js` | Retired service worker kill switch. Cleans legacy browser cache-first storage on visitor entry |
| `docs/` | Architectural specifications and design records |

## Deployment Pipeline (GitOps)

* **GitHub Actions:** Triggered on every push to `main`. Runs `astro check`, compiles static output to `site/dist/`, executes 64 Playwright tests, and deploys directly to GitHub Pages.
* **Cloudflare Pages:** GitOps target for `https://rafaelviotti.dev` edge deployment.

## Quality Standards

- 100/100 Lighthouse performance and accessibility
- WCAG AA text contrast in dark and light modes
- Respects `prefers-reduced-motion`
- 100% compliant with F-CV-001..030 factual governance rules
