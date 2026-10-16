// Trích cơ cấu, nhiệm vụ, quyền hạn từ graph_toan_canh.html (vis-network) thành JSON của ứng dụng.
// Chạy: node scripts/extract-reference.mjs
import fs from 'node:fs';
import crypto from 'node:crypto';

const SOURCE = 'graph_toan_canh.html';
const OUT = 'src/data/ban-to-chuc-trung-uong.json';
const html = fs.readFileSync(SOURCE, 'utf8');
const read = name => JSON.parse(html.match(new RegExp(`${name} = new vis\\.DataSet\\((\\[.*?\\])\\);`, 's'))[1]);
const nodes = read('nodes'), edges = read('edges');
const byId = new Map(nodes.map(n => [n.id, n]));

const slug = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const typeOf = name => ['Văn phòng', 'Ban', 'Vụ', 'Cục', 'Phòng'].find(prefix => name.startsWith(prefix)) || 'Khác';

const unitNodes = nodes.filter(n => n.nodeKind === 'don_vi');
const ids = new Map(unitNodes.map(n => [n.id, slug(n.id)]));

// Cạnh nét liền #333333 là quan hệ trực thuộc (con → cha). Các cạnh đơn vị–đơn vị khác chưa có chú giải.
const parentOf = new Map();
const unmapped = [];
for (const e of edges) {
  const from = byId.get(e.from), to = byId.get(e.to);
  if (from?.nodeKind !== 'don_vi' || to?.nodeKind !== 'don_vi') continue;
  if (e.color === '#333333' && !e.dashes) parentOf.set(e.from, e.to);
  else unmapped.push({ from: ids.get(e.from), to: ids.get(e.to), style: `${e.color} ${Array.isArray(e.dashes) ? 'dashes ' + e.dashes.join(',') : e.dashes ? 'dashed' : 'solid'}`, note: 'Không có chú giải trong nguồn; chưa xác định ý nghĩa.' });
}

// Ý con (nhiem_vu_con) gắn vào nhiệm vụ qua cạnh nhiem_vu → nhiem_vu_con.
const subItems = new Map();
for (const e of edges) {
  const from = byId.get(e.from), to = byId.get(e.to);
  if (from?.nodeKind === 'nhiem_vu' && to?.nodeKind === 'nhiem_vu_con') {
    if (!subItems.has(e.from)) subItems.set(e.from, []);
    subItems.get(e.from).push({ code: to.soHieu || '', text: to.fullText.trim() });
  }
}
subItems.forEach(list => list.sort((a, b) => a.code.localeCompare(b.code, 'vi', { numeric: true })));
// Thứ tự node trong vis-network không theo văn bản; sắp theo số hiệu (1.2 < 1.10, a < b).
const byCode = (a, b) => (a.soHieu || '').localeCompare(b.soHieu || '', 'vi', { numeric: true });
const items = (owner, kind) => nodes.filter(n => n.owner === owner && n.nodeKind === kind).sort(byCode)
  .map(n => ({ code: n.soHieu || '', text: n.fullText.trim(), ...(subItems.has(n.id) ? { items: subItems.get(n.id) } : {}) }));

const units = unitNodes.map(n => ({
  id: ids.get(n.id),
  parentId: parentOf.has(n.id) ? ids.get(parentOf.get(n.id)) : null,
  name: n.id,
  code: '',
  type: typeOf(n.id),
  description: '',
  duties: items(n.id, 'nhiem_vu'),
  authorities: items(n.id, 'quyen_han'),
}));

const sha256 = crypto.createHash('sha256').update(fs.readFileSync(SOURCE)).digest('hex').toUpperCase();
const data = {
  schemaVersion: 2,
  title: 'Ban Tổ chức Trung ương',
  source: 'reference',
  sourceInfo: {
    file: SOURCE, sha256,
    note: 'Trích tự động từ sơ đồ tham khảo. Chưa đối chiếu với văn bản quy định chức năng, nhiệm vụ hiện hành; không dùng làm căn cứ chính thức.',
  },
  unmappedRelations: unmapped,
  units,
};
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
const count = key => units.reduce((sum, u) => sum + u[key].length, 0);
console.log(`${units.length} đơn vị, ${count('duties')} nhiệm vụ, ${count('authorities')} quyền hạn, ${unmapped.length} quan hệ chưa ánh xạ. SHA-256 ${sha256}`);
