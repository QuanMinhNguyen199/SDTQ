import { chromium, expect } from '@playwright/test';

const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:5173';
const errors=[];
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Explore mode',exact:true}).click();
  const close=page.getByRole('button',{name:'Đóng hồ sơ Explore',exact:true});
  await expect(close).toBeVisible();await close.click();
  const region=page.getByRole('region',{name:/^Explore:/});
  await region.focus();
  await page.keyboard.down('ArrowDown');
  try {await expect(page.getByRole('region',{name:'Vị trí Explore'})).toContainText('Hành lang');}
  finally {await page.keyboard.up('ArrowDown');}
  await page.waitForTimeout(180);
  await region.focus();await page.keyboard.down('ArrowUp');
  try {await expect(close).toBeVisible();}
  finally {await page.keyboard.up('ArrowUp');}
  await expect(page.getByRole('region',{name:'Vị trí Explore'})).toContainText('Trong phòng');
  await region.focus();await page.keyboard.down('ArrowDown');
  try {await expect(page.getByRole('region',{name:'Vị trí Explore'})).toContainText('Hành lang');}
  finally {await page.keyboard.up('ArrowDown');}
  await expect(page.getByRole('complementary',{name:'Hồ sơ đơn vị'})).toHaveCount(0);
  await region.focus();await page.keyboard.down('ArrowUp');
  try {await expect(close).toBeVisible();}
  finally {await page.keyboard.up('ArrowUp');}
  await close.click();await expect(page.getByRole('complementary',{name:'Hồ sơ đơn vị'})).toHaveCount(0);
  const canvas=page.locator('.explore-canvas canvas');
  await canvas.click({position:{x:340,y:480}});
  await expect.poll(()=>page.evaluate(()=>document.pointerLockElement?.tagName)).toBe('CANVAS');
  const plate=page.getByRole('button',{name:/Ban Tổ chức Trung ương.*Xem hồ sơ/});
  const before=await plate.boundingBox();
  await page.mouse.move(400,480);await page.waitForTimeout(220);
  const after=await plate.boundingBox();
  if(!before||!after||Math.abs(before.x-after.x)<1)throw new Error('Free look did not respond without dragging');
  await canvas.click({position:{x:340,y:480}});
  await expect.poll(()=>page.evaluate(()=>document.pointerLockElement===null)).toBe(true);
  await expect(page.getByText('Bấm vào cảnh để nhìn tự do · Giữ WASD / mũi tên để đi',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Chọn cửa',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Ra hành lang',exact:true})).toHaveCount(0);
  await canvas.click({position:{x:340,y:480}});
  await expect.poll(()=>page.evaluate(()=>document.pointerLockElement?.tagName)).toBe('CANVAS');
  await page.keyboard.press('Escape');
  await expect.poll(()=>page.evaluate(()=>document.pointerLockElement===null)).toBe(true);
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('PASS: continuous arrow movement, walking out/in through doorway without a section, automatic profile, click-to-look, mouse look without dragging, click-to-release, Esc fallback, quick access hidden.');
} finally {await browser.close();}
