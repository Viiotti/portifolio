// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Where the site is published. Defaults match the current GitHub Pages URL;
// a custom domain build sets SITE_URL=https://<domain> and SITE_BASE=/.
// Empty values (unset CI variables) fall back to the defaults too.
const site = process.env.SITE_URL || 'https://viiotti.github.io';
const base = process.env.SITE_BASE || '/portifolio';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      // The résumé is a hand-written page in public/, so the sitemap would miss it.
      customPages: [new URL(`${base.replace(/\/$/, '')}/resume/`, site).href],
    }),
  ],
  build: { format: 'directory' },
});
