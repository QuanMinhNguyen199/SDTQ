import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';

const browser = await chromium.launch({ channel:'msedge', headless:true, args:['--enable-unsafe-swiftshader'] });
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
const errors = [];
fs.mkdirSync('.local/qa', { recursive:true });
try {
  const page = await browser.newPage({ viewport:{ width:1440, height:1000 }, reducedMotion:'reduce' });
  page.setDefaultTimeout(15000);
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base, { waitUntil:'networkidle' });
  await expect(page.locator('.node-label')).toHaveCount(13);
  for (let i=0; i<4; i++) {
    await page.getByRole('button', { name:'2D', exact:true }).click();
    await expect(page.locator('.graph-2d svg')).toBeVisible();
    await page.waitForTimeout(600); // R3F disposes the previous renderer asynchronously.
    await expect(page.getByRole('button', { name:'3D', exact:true })).toBeEnabled();
    await page.getByRole('button', { name:'3D', exact:true }).click();
    await expect(page.locator('.node-label')).toHaveCount(13);
    await page.waitForTimeout(700);
    await expect(page.getByRole('button', { name:'3D', exact:true })).toHaveAttribute('aria-pressed','true');
  }
  await page.getByRole('button', { name:'Danh sách', exact:true }).click();
  await expect(page.locator('.unit-table')).toBeVisible();
  await page.getByRole('button', { name:'3D', exact:true }).click();
  await expect(page.locator('.node-label')).toHaveCount(13);
  // Genuine context loss still falls back; the user can retry rather than being permanently locked out.
  await page.locator('canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await expect(page.getByRole('button', { name:'2D', exact:true })).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button', { name:'3D', exact:true }).click();
  await expect(page.locator('.node-label')).toHaveCount(13);
  await expect(page.getByRole('button', { name:'3D', exact:true })).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.lucide')).toHaveCount(0);
  await page.waitForTimeout(400);
  await page.screenshot({ path:'.local/qa/no-icons-desktop.png' });
  await page.close();

  const mobile = await browser.newPage({ viewport:{ width:360,height:800 }, reducedMotion:'reduce' });
  await mobile.goto(base, { waitUntil:'networkidle' });
  await expect(mobile.locator('.lucide')).toHaveCount(0);
  if (await mobile.evaluate(() => document.documentElement.scrollWidth>innerWidth)) throw new Error('Mobile header overflows');
  await mobile.getByRole('button', {name:'2D',exact:true}).click();
  await expect(mobile.getByRole('button',{name:'Toàn cảnh',exact:true})).toBeVisible();
  await mobile.screenshot({path:'.local/qa/no-icons-mobile.png'});
  await mobile.close();
  const fallback = await browser.newPage();
  await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args);};});
  await fallback.goto(base, {waitUntil:'networkidle'});
  await expect(fallback.getByRole('button',{name:'2D',exact:true})).toHaveAttribute('aria-pressed','true');
  await fallback.getByRole('button',{name:'3D',exact:true}).click();
  await expect(fallback.getByRole('button',{name:'2D',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(fallback.getByRole('button',{name:'3D',exact:true})).toBeEnabled();
  await fallback.close();
  if(errors.length) throw new Error(errors.join('\n'));
  console.log('PASS: repeated 3D/2D/list switching, context-loss fallback and retry, no icon library elements, mobile text controls, unsupported WebGL fallback.');
} finally { await browser.close(); }
