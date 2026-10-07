import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const pages = ['', 'hire/', 'now/', 'stack/', 'privacy/', 'work/self-hosted-rag/'];

async function audit(page: Page): Promise<string[]> {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    // @ts-expect-error injected global
    const res = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] });
    return res.violations.map(
      (v: { id: string; nodes: { target: string[] }[] }) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
    );
  });
}

for (const path of pages) {
  test.describe(`/${path}`, () => {
    test('loads cleanly: one h1, no overflow, no errors, no third-party requests', async ({ page, baseURL }) => {
      const errors: string[] = [];
      const foreign: string[] = [];
      const origin = new URL(baseURL!).origin;
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) foreign.push(r.url()); });
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await page.waitForLoadState('networkidle');
      expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
      expect(errors).toEqual([]);
      expect(foreign).toEqual([]);
    });

    for (const scheme of ['dark', 'light'] as const) {
      test(`no WCAG A/AA violations (${scheme})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
        await page.goto(path);
        expect(await audit(page)).toEqual([]);
      });
    }
  });
}

test('every internal link resolves', async ({ page, request, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const seen = new Set<string>();
  const queue = [baseURL!];
  while (queue.length) {
    const url = queue.shift()!;
    if (seen.has(url)) continue;
    seen.add(url);
    const res = await request.get(url);
    expect(res.status(), url).toBe(200);
    if (!(res.headers()['content-type'] ?? '').includes('text/html') || url.includes('/resume/')) continue;
    await page.goto(url);
    const links = await page.$$eval('a[href]', (as) => as.map((a) => (a as HTMLAnchorElement).href));
    for (const link of links) {
      const u = new URL(link);
      if (u.origin !== origin) continue;
      u.hash = '';
      u.search = '';
      if (!seen.has(u.href)) queue.push(u.href);
    }
  }
  expect(seen.size).toBeGreaterThanOrEqual(7);
});

test('unknown pages return the 404 page', async ({ page }) => {
  const res = await page.goto('does-not-exist/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('does not exist');
});

test('the retired service worker is still served, scoped to this site', async ({ request }) => {
  const res = await request.get('sw.js');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain("startsWith('rv-portfolio-')");
  expect(body).not.toContain("addEventListener('fetch'");
});

test.describe('contact page', () => {
  test('shows one form at a time and switches with the tabs', async ({ page }) => {
    await page.goto('hire/');
    await expect(page.locator('form:visible')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeVisible();
    await page.getByRole('tab', { name: 'I have a project' }).click();
    await expect(page.locator('form:visible')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Send project brief' })).toBeVisible();
    await page.getByRole('tab', { name: 'I have a project' }).press('ArrowLeft');
    await expect(page.getByRole('tab', { name: 'I’m hiring for a role' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: 'I’m hiring for a role' })).toBeFocused();
  });

  test('opens on the project form from ?type=project', async ({ page }) => {
    await page.goto('hire/?type=project');
    await expect(page.getByRole('button', { name: 'Send project brief' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeHidden();
  });

  test('rejects an empty or invalid submission', async ({ page }) => {
    await page.goto('hire/');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.locator('[data-status]')).toContainText('valid email');
    await expect(page.locator('#h-name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#h-name')).toBeFocused();
    await page.locator('#h-name').fill('Ada');
    await page.locator('#h-email').fill('not-an-email');
    await page.locator('#h-msg').fill('Platform team');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.locator('#h-email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#h-name')).toHaveAttribute('aria-invalid', 'false');
  });

  test('without a form key, a valid message goes to the email app', async ({ page }) => {
    await page.goto('hire/');
    await page.waitForTimeout(3100); // the anti-bot timer ignores sends in the first 3 s
    await page.locator('#h-name').fill('Ada Lovelace');
    await page.locator('#h-email').fill('ada@example.com');
    await page.locator('#h-msg').fill('Retrieval platform');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.locator('[data-status]')).toContainText('email app');
  });

  test('a filled honeypot is silently dropped', async ({ page }) => {
    await page.goto('hire/');
    await page.waitForTimeout(3100);
    await page.locator('#h-name').fill('Bot');
    await page.locator('#h-email').fill('bot@example.com');
    await page.locator('#h-msg').fill('spam');
    // Bots fill every field; people never see this one.
    await page.locator('#panel-hire input[name="botcheck"]').evaluate((el) => { (el as HTMLInputElement).checked = true; });
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.locator('[data-status]')).toContainText('on its way');
    await expect(page.locator('#h-name')).toHaveValue('');
  });
});

test.describe('time zones: New York', () => {
  test.use({ timezoneId: 'America/New_York' });
  test('shares 8 working hours with Belo Horizonte', async ({ page }) => {
    await page.goto('hire/');
    await expect(page.locator('[data-tz-overlap]')).toHaveText('8 h of our working days overlap.');
    await expect(page.locator('[data-tz-you]')).toContainText(/1 h behind me|2 h behind me/);
  });
});

test.describe('time zones: Tokyo', () => {
  test.use({ timezoneId: 'Asia/Tokyo' });
  test('has no shared working hours', async ({ page }) => {
    await page.goto('hire/');
    await expect(page.locator('[data-tz-overlap]')).toContainText('do not overlap');
    await expect(page.locator('[data-tz-you]')).toContainText('12 h ahead of me');
  });
});

test('command menu opens with Ctrl+K and navigates', async ({ page }) => {
  await page.goto('');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: 'Command menu' })).toBeVisible();
  await page.keyboard.type('stack');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/stack\/$/);
});

test('command menu opens from its button and closes with Escape', async ({ page }) => {
  await page.goto('');
  await page.getByRole('button', { name: 'Open the command menu' }).click();
  const dialog = page.getByRole('dialog', { name: 'Command menu' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('theme toggle switches and remembers the choice', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('footer shows real measurements', async ({ page }) => {
  await page.goto('');
  await page.waitForLoadState('load');
  await expect(page.locator('[data-tel-cookies]')).toHaveText('0');
  await expect(page.locator('[data-tel-kb]')).toHaveText(/^\d+ KB$/);
  await expect(page.locator('[data-clock]')).toHaveText(/^\d{2}:\d{2}$/);
});
