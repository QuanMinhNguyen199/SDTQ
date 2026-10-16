import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
const errors = [];
fs.mkdirSync('.local/qa',{recursive:true});
try {
  for (const scenario of [
    {name:'palette-light',width:1440,height:1000},
    {name:'palette-dark',width:1440,height:1000,dark:true},
    {name:'palette-mobile',width:360,height:800},
  ]) {
    const page = await browser.newPage({viewport:{width:scenario.width,height:scenario.height},reducedMotion:'reduce'});
    page.setDefaultTimeout(15000);
    page.on('pageerror',error=>errors.push(error.message));
    const remoteFonts = [];
    page.on('request',request=>{if(request.resourceType()==='font'&&!request.url().startsWith(base))remoteFonts.push(request.url());});
    await page.goto(base,{waitUntil:'networkidle'});
    if(scenario.dark) await page.getByRole('button',{name:'Bật theme tối'}).click();
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(400);
    await page.screenshot({path:`.local/qa/${scenario.name}.png`});
    // On mobile the display font loads only when a visible heading needs it.
    if(scenario.width<768) {
      await page.locator('.unit-table button').first().click();
      await expect(page.locator('.inspector-title h2')).toBeVisible();
      await page.evaluate(()=>document.fonts.ready);
      await page.waitForTimeout(200);
      await page.screenshot({path:'.local/qa/palette-mobile-detail.png'});
    }
    const result=await page.evaluate(()=>({
      bodyFont:getComputedStyle(document.body).fontFamily,
      headingFont:getComputedStyle(document.querySelector('h2')||document.querySelector('h1')).fontFamily,
      bodyLoaded:document.fonts.check('400 13px "Be Vietnam Pro"','Tổ chức, nhiệm vụ, quyền hạn'),
      headingLoaded:document.fonts.check('700 24px "Manrope Variable"','Tổ chức, nhiệm vụ, quyền hạn'),
      overflow:document.documentElement.scrollWidth>innerWidth,
      fontRequests:performance.getEntriesByType('resource').filter(r=>r.name.includes('.woff')).length,
    }));
    if(!result.bodyFont.includes('Be Vietnam Pro')||!result.headingFont.includes('Manrope')||!result.bodyLoaded||!result.headingLoaded||result.overflow||!result.fontRequests||remoteFonts.length) throw new Error(JSON.stringify({result,remoteFonts}));
    await expect(page.locator('.lucide')).toHaveCount(0);
    console.log(`PASS ${scenario.name}: local fonts with Vietnamese glyphs, intended type roles, no horizontal overflow or icons.`);
    await page.close();
  }
  if(errors.length) throw new Error(errors.join('\n'));
} finally { await browser.close(); }
