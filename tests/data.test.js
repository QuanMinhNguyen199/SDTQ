import test from 'node:test';
import assert from 'node:assert/strict';
import { initialUnits, referenceInfo, unmappedRelations, visibleUnits, descendants, ancestors, validateUnits, normalize, layoutTree, itemCount, itemsToText, textToItems } from '../src/data.js';

const ROOT = 'ban-to-chuc-trung-uong';
const unit = id => initialUnits.find(u => u.id === id);

test('reference data mirrors graph_toan_canh.html', () => {
  validateUnits(initialUnits);
  assert.equal(referenceInfo.sha256, '208F999F85A42956755FE1ACE9C16B8057A0911A1A4D07F043D3521515483389');
  assert.equal(initialUnits.length, 19);
  assert.equal(initialUnits.filter(u => u.parentId === ROOT).length, 12);
  assert.equal(initialUnits.filter(u => u.parentId === 'van-phong-ban').length, 6);
  assert.equal(initialUnits.reduce((n, u) => n + u.duties.length, 0), 135);
  assert.equal(initialUnits.reduce((n, u) => n + u.authorities.length, 0), 57);
  assert.equal(initialUnits.reduce((n, u) => n + itemCount(u.duties) - u.duties.length, 0), 47);
  assert.equal(unmappedRelations.length, 12);
});

test('content stays with its own unit and gaps are not filled', () => {
  assert.equal(unit(ROOT).duties.length, 0, 'nguồn không có nhiệm vụ riêng cho Ban');
  assert.equal(unit('phong-tai-vu').authorities.length, 0);
  assert.equal(unit('vu-to-chuc-dieu-le').duties[0].code, '1.1');
  assert.ok(unit('cuc-bao-ve-chinh-tri-noi-bo').duties.some(d => d.items?.length));
  assert.equal(ancestors(initialUnits, 'phong-tong-hop').length, 3);
});

test('collapsing a parent hides descendants without deleting data', () => {
  assert.equal(visibleUnits(initialUnits, new Set([ROOT])).length, 13);
  assert.equal(visibleUnits(initialUnits, new Set([ROOT, 'van-phong-ban'])).length, 19);
  assert.ok(descendants(initialUnits, ROOT).has('phong-tai-vu'));
});

test('cycles, orphan parents and duplicates cannot be imported', () => {
  assert.throws(() => validateUnits(initialUnits.map(u => u.id === ROOT ? { ...u, parentId: 'phong-tai-vu' } : u)), /vòng lặp/);
  assert.throws(() => validateUnits(initialUnits.map(u => u.id === 'vu-can-bo' ? { ...u, parentId: 'missing' } : u)), /đơn vị cha/);
  assert.throws(() => validateUnits([...initialUnits, initialUnits[0]]), /trùng/);
});

test('legacy string items are normalized without mutating input', () => {
  const legacy = [{ id: 'a', parentId: null, name: 'A', code: '', type: 'Ban', description: '', duties: ['Một'], authorities: [] }];
  const [result] = validateUnits(legacy);
  assert.deepEqual(result.duties, [{ code: '', text: 'Một' }]);
  assert.equal(legacy[0].duties[0], 'Một');
});

test('editor text round-trips codes and sub-items', () => {
  const duties = unit('cuc-dao-tao-boi-duong-can-bo').duties;
  assert.deepEqual(textToItems(itemsToText(duties)), duties);
  assert.deepEqual(textToItems('[2] Hai\n    [a] ý a\n- ý b\nBa'), [{ code: '2', text: 'Hai', items: [{ code: 'a', text: 'ý a' }, { code: '', text: 'ý b' }] }, { code: '', text: 'Ba' }]);
});

test('layout supports a focused branch without phantom parents', () => {
  const branch = visibleUnits(initialUnits, new Set(['van-phong-ban']), 'van-phong-ban');
  const positions = layoutTree(branch);
  assert.equal(positions.size, 7);
  assert.ok(!positions.has(ROOT));
  positions.forEach(p => assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y)));
});

test('Vietnamese search tolerates missing diacritics', () => {
  assert.ok(normalize('Phòng Tài vụ').includes('phong tai vu'));
  assert.ok(normalize('Cục Bảo vệ chính trị nội bộ').includes('bao ve chinh tri'));
});
