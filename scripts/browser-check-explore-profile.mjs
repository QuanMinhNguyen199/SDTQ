import { chromium, expect } from '@playwright/test';

const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:5173';
const errors=[];
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Explore mode',exact:true}).click();
  const close=page.getByRole('button',{name:'Đóng hồ sơ Explore',exact:true});
  await expect(close).toBeVisible();
  const profile=await page.getByRole('complementary',{name:'Hồ sơ đơn vị'}).elementHandle();
  const canvas=await page.locator('.explore-canvas canvas').elementHandle();
  const plate=page.getByRole('button',{name:/Ban Tổ chức Trung ương.*Xem hồ sơ/});
  await expect(plate).toBeVisible();
  const before=await plate.boundingBox();
  let largestShift=0;
  for(let index=0;index<3;index++){
    await close.click();
    await expect(page.getByRole('complementary',{name:'Hồ sơ đơn vị'})).toHaveCount(0);
    await expect.poll(()=>profile.evaluate(element=>element.isConnected)).toBe(true);
    const hidden=await plate.boundingBox();
    largestShift=Math.max(largestShift,Math.abs(hidden.x-before.x),Math.abs(hidden.y-before.y));
    await plate.click();
    await expect(close).toBeVisible();
    const visible=await plate.boundingBox();
    largestShift=Math.max(largestShift,Math.abs(visible.x-before.x),Math.abs(visible.y-before.y));
    await expect.poll(()=>canvas.evaluate(element=>element.isConnected)).toBe(true);
  }
  if(largestShift>.5)throw new Error(`Profile shifted the first-person view ${largestShift}px`);
  await close.click();
  const region=page.getByRole('region',{name:/^Explore:/});
  await region.focus();await page.keyboard.down('ArrowDown');
  try {await expect(page.getByRole('region',{name:'Vị trí Explore'})).toContainText('Hành lang');}
  finally {await page.keyboard.up('ArrowDown');}
  await region.focus();await page.keyboard.down('ArrowUp');
  try {await expect(close).toBeVisible();}
  finally {await page.keyboard.up('ArrowUp');}
  await expect.poll(()=>profile.evaluate(element=>element.isConnected)).toBe(true);
  if(errors.length)throw new Error(errors.join('\n'));
  console.log(`PASS: ${largestShift}px view shift on profile toggles; profile and canvas stay mounted; walking into a room still opens its profile.`);
} finally {await browser.close();}
