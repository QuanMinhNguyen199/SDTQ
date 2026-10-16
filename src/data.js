import reference from './data/ban-to-chuc-trung-uong.json' with { type: 'json' };

// Dữ liệu mặc định: trích từ graph_toan_canh.html bằng scripts/extract-reference.mjs.
export const referenceInfo = reference.sourceInfo;
export const unmappedRelations = reference.unmappedRelations;
export const initialUnits = reference.units;

// Một mục nhiệm vụ/quyền hạn: { code, text, items?: [{ code, text }] }. Chấp nhận chuỗi từ JSON phiên bản cũ.
export function normalizeItem(item) {
  if (typeof item === 'string') return { code: '', text: item };
  if (!item || typeof item.text !== 'string' || item.text.length > 10000 || (item.code != null && typeof item.code !== 'string')) throw new Error('Nhiệm vụ hoặc quyền hạn không hợp lệ.');
  const result = { code: item.code || '', text: item.text };
  if (item.items != null) {
    if (!Array.isArray(item.items)) throw new Error('Ý con của nhiệm vụ không hợp lệ.');
    result.items = item.items.map(sub => { const { items, ...rest } = normalizeItem(sub); return rest; });
  }
  return result;
}
export const itemCount = list => list.reduce((sum, item) => sum + 1 + (item.items?.length || 0), 0);

export const sourceNote = {
  reference: 'Trích từ sơ đồ tham khảo graph_toan_canh.html. Chưa đối chiếu văn bản quy định chức năng, nhiệm vụ hiện hành; không dùng làm căn cứ chính thức.',
  edited: 'Đã chỉnh sửa trong phiên từ dữ liệu tham khảo. Nội dung sửa chưa được thẩm định.',
  import: 'Dữ liệu từ file JSON người dùng nhập. Chưa xác minh căn cứ và hiệu lực.',
};

// Biểu mẫu sửa: mỗi dòng một mục, "[số hiệu]" ở đầu là tùy chọn, dòng thụt đầu là ý con của mục phía trên.
export function itemsToText(list) {
  const line = item => `${item.code ? `[${item.code}] ` : ''}${item.text}`;
  return list.map(item => [line(item), ...(item.items || []).map(sub => `    ${line(sub)}`)].join('\n')).join('\n');
}
export function textToItems(text) {
  const result = [];
  for (const raw of text.split('\n')) {
    if (!raw.trim()) continue;
    const nested = /^(\s+|-\s)/.test(raw) && result.length;
    const match = raw.trim().replace(/^-\s*/, '').match(/^\[([^\]]{1,20})\]\s*(.*)$/);
    const item = match ? { code: match[1].trim(), text: match[2].trim() } : { code: '', text: raw.trim().replace(/^-\s*/, '') };
    if (!item.text) continue;
    if (nested) (result.at(-1).items ??= []).push(item); else result.push(item);
  }
  return result;
}

export function normalize(value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
export function ancestors(units, id) {
  const result = []; const seen = new Set(); let item = units.find(u => u.id === id);
  while (item && !seen.has(item.id)) { seen.add(item.id); result.unshift(item); item = units.find(u => u.id === item.parentId); }
  return result;
}
export function descendants(units, id) {
  const found = new Set([id]); let changed = true;
  while (changed) { changed = false; units.forEach(u => { if (found.has(u.parentId) && !found.has(u.id)) { found.add(u.id); changed = true; } }); }
  found.delete(id); return found;
}
export function visibleUnits(units, expanded, focus = null) {
  const result = [];
  const visit = (unit, depth) => { result.push({ ...unit, depth }); if (expanded.has(unit.id)) units.filter(u => u.parentId === unit.id).forEach(u => visit(u, depth + 1)); };
  units.filter(u => focus ? u.id === focus : !u.parentId).forEach(u => visit(u, 0)); return result;
}
export function layoutTree(visible) {
  const placed = new Map(); let next = 0;
  const visit = unit => {
    const children = visible.filter(u => u.parentId === unit.id);
    const x = children.length ? children.map(visit).reduce((a, b) => a + b, 0) / children.length : next++ * 230;
    placed.set(unit.id, { x, y: -unit.depth * 170, z: 0 }); return x;
  };
  visible.filter(u => !visible.some(p => p.id === u.parentId)).forEach(visit);
  const center = ((next - 1) * 230) / 2;
  placed.forEach(p => { p.x -= center; }); return placed;
}
export function validateUnits(units) {
  if (!Array.isArray(units) || !units.length || units.length > 2000) throw new Error('Dữ liệu cần có từ 1 đến 2.000 đơn vị.');
  const ids = new Set();
  for (const u of units) {
    if (!u || typeof u.id !== 'string' || !u.id || ids.has(u.id)) throw new Error('Mã định danh bị thiếu hoặc trùng.');
    ids.add(u.id);
    for (const key of ['name','code','type','description']) if (typeof u[key] !== 'string' || (key === 'name' && !u[key].trim()) || u[key].length > 5000) throw new Error('Thông tin đơn vị không hợp lệ.');
    if (u.parentId !== null && typeof u.parentId !== 'string') throw new Error('Đơn vị cha không hợp lệ.');
    for (const key of ['duties','authorities']) { if (!Array.isArray(u[key])) throw new Error('Nhiệm vụ hoặc quyền hạn không hợp lệ.'); u[key].forEach(normalizeItem); }
  }
  for (const u of units) {
    if (u.parentId && !ids.has(u.parentId)) throw new Error('Không tìm thấy đơn vị cha.');
    const seen = new Set([u.id]); let p = u.parentId;
    while (p) { if (seen.has(p)) throw new Error('Quan hệ trực thuộc tạo thành vòng lặp.'); seen.add(p); p = units.find(v => v.id === p).parentId; }
  }
  return units.map(u => ({ ...u, duties: u.duties.map(normalizeItem), authorities: u.authorities.map(normalizeItem) }));
}
