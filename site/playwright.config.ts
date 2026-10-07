import { defineConfig, devices } from '@playwright/test';

const port = 4321;
const base = (process.env.SITE_BASE || '/portifolio').replace(/\/$/, '');

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}${base}/`,
    // CI installs its own browser; set PW_CHROMIUM to use a preinstalled one.
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npx astro preview --port ${port} --ignore-lock`,
    url: `http://localhost:${port}${base}/`,
    reuseExistingServer: !process.env.CI,
  },
});
