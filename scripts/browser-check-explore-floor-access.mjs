import { chromium, expect } from '@playwright/test';

const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:5173';
const errors=[];
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Explore mode',exact:true}).click();
  await expect(page.getByRole('button',{name:'Đóng hồ sơ Explore',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Chọn cửa',exact:true})).toHaveCount(0);
  await page.getByText('Tìm đơn vị',{exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Tìm đơn vị trong Explore'})).toBeVisible();
  await page.locator('.explore-canvas canvas').click({position:{x:340,y:440}});
  await expect.poll(()=>page.evaluate(()=>document.pointerLockElement?.tagName)).toBe('CANVAS');
  await expect(page.getByRole('region',{name:'Cửa trên tầng'})).toHaveCount(0);
  await expect(page.getByRole('complementary',{name:'Hồ sơ đơn vị'})).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Thang máy',exact:true,includeHidden:true}).evaluate(button=>button.click());
  const floor=page.getByRole('button',{name:'Đi đến Tầng 1 · Cấp 3',exact:true});
  await expect(floor).toBeEnabled();await expect(floor).toContainText('Văn phòng Ban');
  await floor.click();
  await expect(page.getByRole('region',{name:'Vị trí Explore'})).toContainText('Tầng 1 · Cấp 3');
  await expect(page.getByRole('region',{name:'Vị trí Explore'})).toContainText('Hành lang');
  await expect(page.locator('.explore-door-label')).toHaveCount(6);
  await expect(page.locator('.explore-door-label').getByText('Thuộc Văn phòng Ban',{exact:true})).toHaveCount(6);
  await page.screenshot({path:'.local/qa/explore-floor-one-parents.png'});
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('PASS: quick access hidden, focus closes profile and search; floor 1 reachable directly; all six doors identify Văn phòng Ban as parent.');
} finally {await browser.close();}
