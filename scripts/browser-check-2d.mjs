import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';

const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] });
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
const errors = [];
fs.mkdirSync('.local/qa', { recursive: true });
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    page.setDefaultTimeout(10000);
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: '2D', exact: true }).click();
    const svg = page.locator('.graph-2d svg');
    const box = () => svg.evaluate(el => { const v = el.viewBox.baseVal; return { x: v.x, y: v.y, width: v.width, height: v.height }; });
    await expect(svg).toBeVisible();
    await page.getByRole('button', { name: 'Toàn cảnh', exact: true }).click();
    const fit = await box();
    await page.getByRole('button', { name: 'Phóng to', exact: true }).click();
    await expect.poll(async () => (await box()).width).toBeLessThan(fit.width);
    await page.getByRole('button', { name: 'Thu nhỏ', exact: true }).click();
    await expect.poll(async () => Math.abs((await box()).width - fit.width)).toBeLessThan(.01);
    const rect = await svg.boundingBox();
    await page.mouse.move(rect.x + rect.width * .3, rect.y + rect.height * .3);
    await page.mouse.wheel(0, -300);
    await expect.poll(async () => (await box()).width).toBeLessThan(fit.width);
    const zoomed = await box();
    const panY = rect.y + rect.height * .75;
    await page.mouse.move(rect.x + 15, panY);
    await page.mouse.down();
    await page.mouse.move(rect.x + 70, panY + 40, { steps: 6 });
    await page.mouse.up();
    await expect.poll(async () => Math.abs((await box()).x - zoomed.x)).toBeGreaterThan(1);
    await svg.focus();
    await svg.press('Home');
    await expect.poll(async () => Math.abs((await box()).x - fit.x)).toBeLessThan(.01);
    await svg.press('Equal');
    await expect.poll(async () => (await box()).width).toBeLessThan(fit.width);
    await svg.press('ArrowRight');
    await page.getByRole('button', { name: 'Toàn cảnh', exact: true }).click();
    await expect.poll(async () => Math.abs((await box()).x - fit.x)).toBeLessThan(.01);
    await page.getByRole('button', { name: 'Định vị đơn vị đang chọn', exact: true }).click();
    await expect.poll(async () => (await box()).width).toBeLessThan(fit.width);
    // Selecting a node still opens its profile instead of starting a pan.
    await svg.getByRole('button', { name: 'Xem Ban Tổ chức Trung ương', exact: true }).click();
    await expect(page.locator('.inspector-title h2')).toHaveText('Ban Tổ chức Trung ương');
    await page.getByRole('button', { name: 'Đóng hồ sơ', exact: true }).click();
    await page.getByRole('button', { name: 'Toàn cảnh', exact: true }).click();
    await page.waitForTimeout(300); // Settle the closing panel and the viewport resize before capturing.
    await page.screenshot({ path: `.local/qa/2d-${viewport.width}.png`, fullPage: true });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Horizontal overflow');
    await page.close();
    console.log(`PASS ${viewport.width}px: buttons, wheel, pan, keyboard, fit, locate, node selection.`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
} finally { await browser.close(); }
