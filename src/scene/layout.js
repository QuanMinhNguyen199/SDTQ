import { BLOCK } from '../theme.js';

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  }
  catch { return false; }
}

const GAP_X = 80;      // khoảng cách giữa hai khối cùng hàng, đủ chỗ cho nhãn lớn
const GAP_ROW = 110;   // khoảng cách giữa các hàng con (chừa chỗ cho đường trục)
const columnsFor = count => (count <= 3 ? count : count <= 6 ? 3 : 4);

// Bố cục trên mặt sàn: X trải ngang, Z theo chiều sâu. Đơn vị có nhiều con (ví dụ 12 vụ, cục)
// xếp con thành lưới nhiều hàng thay vì một hàng dài, để sơ đồ vẫn đọc được ở mức zoom vừa phải.
// Trả về id → { x, z, busZ, trunkX }: busZ là đường ngang nối vào hàng của khối, trunkX là trục dọc
// bên trái nhóm con (null khi khối ở hàng đầu, nối thẳng từ cha).
export function layoutScene(visible) {
  const ids = new Set(visible.map(u => u.id));
  const childrenOf = new Map();
  visible.forEach(u => { if (ids.has(u.parentId)) { if (!childrenOf.has(u.parentId)) childrenOf.set(u.parentId, []); childrenOf.get(u.parentId).push(u); } });
  const { width: W, depth: D, levelGap } = BLOCK;

  const measure = unit => {
    const kids = (childrenOf.get(unit.id) || []).map(k => ({ unit: k, ...measure(k) }));
    if (!kids.length) return { width: W, depth: D, rows: [] };
    const columns = columnsFor(kids.length), rows = [];
    for (let i = 0; i < kids.length; i += columns) {
      const items = kids.slice(i, i + columns);
      rows.push({ items, width: items.reduce((s, k) => s + k.width, 0) + GAP_X * (items.length - 1), depth: Math.max(...items.map(k => k.depth)) });
    }
    return {
      rows,
      width: Math.max(W, ...rows.map(r => r.width)),
      depth: D + levelGap + rows.reduce((s, r) => s + r.depth, 0) + GAP_ROW * (rows.length - 1),
    };
  };

  const placed = new Map();
  const place = (unit, info, left, top, link) => {
    placed.set(unit.id, { x: left + info.width / 2, z: top + D / 2, ...link });
    if (!info.rows.length) return;
    const trunkX = left + Math.min(...info.rows.map(r => (info.width - r.width) / 2)) - GAP_X / 2;
    let z = top + D + levelGap;
    info.rows.forEach((row, index) => {
      let x = left + (info.width - row.width) / 2;
      const busZ = z - (index ? GAP_ROW : levelGap) / 2;
      row.items.forEach(k => { place(k.unit, k, x, z, { busZ, trunkX: index ? trunkX : null }); x += k.width + GAP_X; });
      z += row.depth + GAP_ROW;
    });
  };

  let left = 0;
  visible.filter(u => !ids.has(u.parentId)).forEach(root => {
    const info = measure(root);
    place(root, info, left, 0, { busZ: null, trunkX: null });
    left += info.width + GAP_X * 3;
  });
  const xs = [...placed.values()].map(p => p.x), zs = [...placed.values()].map(p => p.z);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  placed.forEach(p => { p.x -= cx; p.z -= cz; if (p.busZ != null) p.busZ -= cz; if (p.trunkX != null) p.trunkX -= cx; });
  return placed;
}

export const SLAB = 9;        // độ dày mỗi lớp mặt bằng
const CAMPUS_PAD = 22;        // phải nhỏ hơn GAP_X / 2 để mặt bằng không lấn dưới khối bên cạnh

// Mặt bằng lồng nhau: đơn vị có nhánh đang mở có một nền chứa chính nó và toàn bộ hậu duệ đang hiển thị.
// Nền của cấp sâu hơn nằm chồng lên nền cấp trên, thể hiện quan hệ "thuộc về" bằng hình khối.
// baseY: cao độ đáy khối; lineY: cao độ đường nối từ đơn vị tới các con.
export function campusLayout(visible, positions) {
  const { width: W, depth: D } = BLOCK;
  const childrenOf = new Map();
  visible.forEach(u => { if (positions.has(u.parentId)) { if (!childrenOf.has(u.parentId)) childrenOf.set(u.parentId, []); childrenOf.get(u.parentId).push(u); } });
  const campuses = [], baseY = new Map();
  const rect = u => { const p = positions.get(u.id); return { minX: p.x - W / 2, maxX: p.x + W / 2, minZ: p.z - D / 2, maxZ: p.z + D / 2 }; };
  const merge = (a, b) => ({ minX: Math.min(a.minX, b.minX), maxX: Math.max(a.maxX, b.maxX), minZ: Math.min(a.minZ, b.minZ), maxZ: Math.max(a.maxZ, b.maxZ) });
  const visit = (u, level) => {
    const kids = childrenOf.get(u.id) || [];
    if (!kids.length) { baseY.set(u.id, level * SLAB); return rect(u); }
    let box = rect(u);
    kids.forEach(k => {
      box = merge(box, visit(k, level + 1));
      const t = positions.get(k.id).trunkX;
      if (t != null) box = merge(box, { minX: t - 10, maxX: t, minZ: box.minZ, maxZ: box.maxZ });
    });
    box = { minX: box.minX - CAMPUS_PAD, maxX: box.maxX + CAMPUS_PAD, minZ: box.minZ - CAMPUS_PAD, maxZ: box.maxZ + CAMPUS_PAD };
    const top = (level + 1) * SLAB;
    campuses.push({ id: u.id, level, top, ...box });
    baseY.set(u.id, top);
    return box;
  };
  visible.filter(u => !positions.has(u.parentId)).forEach(root => visit(root, 0));
  return { campuses, baseY };
}
