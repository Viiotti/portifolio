// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { writeFile } from 'node:fs/promises';

// Where the site is published. Defaults match the current GitHub Pages URL;
// a custom domain build sets SITE_URL=https://<domain> and SITE_BASE=/.
// Empty values (unset CI variables) fall back to the defaults too.
const site = process.env.SITE_URL || 'https://viiotti.github.io';
const base = process.env.SITE_BASE || '/portifolio';

// Crawlers read robots.txt only at the host root, so it is written only when
// the site is served from the root (custom domain).
/** @type {import('astro').AstroIntegration} */
const robots = {
  name: 'robots-at-root',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      if (base.replace(/\/$/, '') !== '') return;
      const sitemapUrl = new URL('/sitemap-index.xml', site).href;
      await writeFile(new URL('robots.txt', dir), `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`);
    },
  },
};

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [
    robots,
    sitemap({
      filter: (page) => !page.includes('/404'),
      // The résumé is a hand-written page in public/, so the sitemap would miss it.
      customPages: [new URL(`${base.replace(/\/$/, '')}/resume/`, site).href],
    }),
  ],
  build: { format: 'directory' },
});
