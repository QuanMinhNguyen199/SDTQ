import { chromium, expect } from '@playwright/test';
import fs from 'node:fs';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] });
fs.mkdirSync('.local/qa', { recursive: true });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
page.setDefaultTimeout(10000);
page.on('pageerror', e => errors.push(e.message));
try {
  await page.goto(base, { waitUntil: 'networkidle' });
  console.log('Loaded');
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('.node-label')).toHaveCount(13);
  await expect(page.locator('.inspector-title h2')).toHaveText('Ban Tổ chức Trung ương');
  await page.getByRole('tab', { name: /^Nhiệm vụ/ }).click();
  await expect(page.locator('.responsibility-list > li')).toHaveCount(0);
  await expect(page.getByText('Nguồn dữ liệu chưa có nhiệm vụ riêng')).toBeVisible();
  await page.getByRole('button', { name: 'Xem Vụ Tổ chức - Điều lệ', exact: true }).click();
  await expect(page.locator('.responsibility-list > li')).toHaveCount(14);
  await expect(page.locator('.responsibility-list > li').first()).toContainText('1.1');
  await page.getByRole('button', { name: 'Xem Cục Bảo vệ chính trị nội bộ', exact: true }).click();
  await expect(page.locator('.responsibility-list > li ol li').first()).toBeVisible();
  console.log('Profile tabs, numbering and sub-items verified');
  await page.getByRole('button', { name: 'Xem Vụ Cán bộ', exact: true }).hover();
  await expect(page.getByRole('tooltip')).toContainText('Vụ Cán bộ');
  console.log('Hover popup verified');
  const tree = page.getByRole('navigation', { name: 'Danh sách đơn vị' });
  await tree.getByRole('button', { name: 'Mở rộng Văn phòng Ban', exact: true }).click();
  await expect(page.locator('.node-label')).toHaveCount(19);
  await tree.getByRole('button', { name: 'Thu gọn Văn phòng Ban', exact: true }).click();
  await expect(page.locator('.node-label')).toHaveCount(13);
  console.log('Collapse verified');
  await page.getByRole('textbox', { name: 'Tìm đơn vị' }).fill('tai vu');
  await page.locator('.search-results').getByRole('button').click();
  await expect(page.locator('.inspector-title h2')).toHaveText('Phòng Tài vụ');
  await expect(page.locator('.node-label')).toHaveCount(19);
  await page.getByRole('tab', { name: /^Quyền hạn/ }).click();
  await expect(page.getByText('Nguồn dữ liệu chưa có quyền hạn riêng')).toBeVisible();
  await page.getByRole('button', { name: 'Xóa tìm kiếm' }).click();
  await page.getByRole('button', { name: 'Cục', exact: true }).click();
  await expect(page.locator('.search-results li')).toHaveCount(2);
  await page.getByRole('button', { name: 'Xóa bộ lọc' }).click();
  await page.getByRole('button', { name: '2D', exact: true }).click();
  await expect(page.locator('.graph-2d svg')).toBeVisible();
  await page.getByRole('button', { name: 'Danh sách', exact: true }).click();
  await expect(page.locator('.unit-table tbody tr')).toHaveCount(19);
  console.log('Search, filter and alternate views verified');
  await page.getByRole('button', { name: 'Thêm đơn vị con', exact: true }).click();
  await page.getByLabel('Tên đơn vị').fill('Tổ Kiểm thử');
  await page.getByLabel('Mã đơn vị', { exact: true }).fill('KT-01');
  await page.getByLabel('Nhiệm vụ riêng').fill('[1] Kiểm tra cấu trúc dữ liệu.\n    [a] Đối chiếu nguồn.\n[2] Báo cáo kết quả kiểm thử.');
  await page.getByLabel('Quyền hạn riêng').fill('Đề xuất sửa lỗi.');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.locator('.inspector-title h2')).toHaveText('Tổ Kiểm thử');
  await page.getByRole('tab', { name: /^Nhiệm vụ/ }).click();
  await expect(page.locator('.responsibility-list > li')).toHaveCount(2);
  await expect(page.locator('.responsibility-list')).toContainText('Đối chiếu nguồn.');
  console.log('Add verified');
  await page.getByRole('button', { name: 'Chỉnh sửa', exact: true }).click();
  await page.locator('select[name=parentId]').selectOption('vu-can-bo');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.locator('.unit-path')).toContainText('Vụ Cán bộ');
  await page.getByRole('tab', { name: /^Quyền hạn/ }).click();
  await expect(page.locator('.responsibility-list')).toContainText('Đề xuất sửa lỗi.');
  const downloadEvent = page.waitForEvent('download');
  console.log('Reparent verified');
  await page.getByRole('button', { name: 'Xuất JSON', exact: true }).click();
  const download = await downloadEvent;
  await download.saveAs('.local/qa/export.json');
  const exported = JSON.parse(fs.readFileSync('.local/qa/export.json', 'utf8'));
  const added = exported.units.find(u => u.name === 'Tổ Kiểm thử');
  if (exported.units.length !== 20 || added.parentId !== 'vu-can-bo' || added.duties[0].items[0].code !== 'a' || exported.source !== 'edited') throw new Error('Export không bảo toàn dữ liệu.');
  await page.locator('input[type=file]').setInputFiles('.local/qa/export.json');
  await expect(page.locator('.tree-meta')).toContainText('20 đơn vị');
  const invalid = structuredClone(exported); invalid.units[0].parentId = 'van-phong-ban';
  await page.locator('input[type=file]').setInputFiles({ name:'invalid.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify(invalid)) });
  await expect(page.getByRole('alert').filter({hasText:'vòng lặp'})).toContainText('vòng lặp');
  await expect(page.locator('.tree-meta')).toContainText('20 đơn vị');
  await page.close();

  for (const scenario of [
    { name:'desktop', width:1440, height:1000 },
    { name:'dark', width:1440, height:1000, dark:true },
    { name:'tablet', width:1024, height:900 },
    { name:'mobile', width:390, height:844, mobile:true },
  ]) {
    const capture = await browser.newPage({ viewport:{ width:scenario.width,height:scenario.height }, isMobile:!!scenario.mobile, hasTouch:!!scenario.mobile, reducedMotion:'reduce' });
    capture.on('pageerror',e=>errors.push(e.message));
    await capture.goto(base,{waitUntil:'networkidle'});
    if (scenario.dark) await capture.getByRole('button',{name:'Bật theme tối'}).click();
    await capture.waitForTimeout(400);
    const overflow = await capture.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    if (overflow) throw new Error(`Horizontal overflow: ${scenario.name}`);
    await capture.screenshot({path:`.local/qa/${scenario.name}.png`,fullPage:true});
    if (scenario.mobile) {
      await capture.locator('.unit-table button').filter({hasText:'Vụ Cán bộ'}).click();
      await capture.getByRole('tab',{name:/^Nhiệm vụ/}).click();
      await expect(capture.locator('.responsibility-list > li')).toHaveCount(9);
      await capture.waitForTimeout(300);
      await capture.screenshot({path:'.local/qa/mobile-detail.png',fullPage:true});
      await capture.getByRole('button',{name:'Đóng hồ sơ'}).click();
      await capture.getByRole('button',{name:'Mở cây tổ chức'}).click();
      await capture.getByRole('textbox',{name:'Tìm đơn vị'}).fill('tai vu');
      await capture.locator('.search-results button').click();
      await expect(capture.locator('.inspector-title h2')).toHaveText('Phòng Tài vụ');
    }
    await capture.close();
  }
  const fallback = await browser.newPage();
  await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args);};});
  await fallback.goto(base,{waitUntil:'networkidle'});
  await expect(fallback.getByRole('button',{name:'2D',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(fallback.getByRole('button',{name:'3D',exact:true})).toBeEnabled();
  await fallback.getByRole('button',{name:'3D',exact:true}).click();
  await expect(fallback.getByRole('button',{name:'2D',exact:true})).toHaveAttribute('aria-pressed','true');
  await fallback.close();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('PASS: reference data (19 units), numbering/sub-items, empty-source states, 3D (R3F), hover popup, type filter, independent content, collapse/search, 2D/list, add/reparent, JSON roundtrip, invalid import, themes, responsive, mobile navigation, WebGL fallback. No page errors.');
} finally { await browser.close(); }
