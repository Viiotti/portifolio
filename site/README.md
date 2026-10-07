# Site (next version)

Astro, static output. Not published until GitHub Pages is switched to GitHub Actions (see `../.github/workflows/site.yml`).

```bash
npm ci
npm run build            # dist/, served under /portifolio/ by default
npx astro preview        # http://localhost:4321/portifolio/
npx playwright test      # 64 checks: WCAG A/AA in both themes, links, forms, time zones, ⌘K, theme, footer
```

| Variable | Default | Purpose |
|---|---|---|
| `SITE_URL` | `https://viiotti.github.io` | Origin used for canonical URLs, OG and sitemap |
| `SITE_BASE` | `/portifolio` | Path prefix; `/` for a custom domain |
| `PUBLIC_WEB3FORMS_KEY` | empty | Contact form delivery. Empty: the form opens the visitor's email app instead |
| `PUBLIC_CAL_URL` | empty | Shows a "book 20 minutes" button when set |

Content rules: every fact lives in `src/lib/site.ts` or a page, and must come from the canonical CV or a measured source. `public/sw.js` is the retired service worker and must stay at that path.
