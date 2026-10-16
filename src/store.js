import { create } from 'zustand';
import { initialUnits, ancestors, descendants, validateUnits } from './data';

const rootId = initialUnits.find(u => !u.parentId).id;

const width = () => (typeof window === 'undefined' ? 1440 : window.innerWidth);
const readTheme = () => { try { return localStorage.getItem('sdtq-theme') || 'light'; } catch { return 'light'; } };

// Một store duy nhất cho dữ liệu nghiệp vụ và trạng thái giao diện.
// Cảnh R3F chỉ đọc store và gọi action; không giữ bản dữ liệu riêng.
export const useOrg = create((set, get) => ({
  units: initialUnits,
  source: 'reference',
  selectedId: rootId,
  hoveredId: null,
  expanded: new Set([rootId]),
  focusId: null,
  query: '',
  typeFilter: new Set(),
  view: width() < 768 ? 'list' : '3d',
  theme: readTheme(),
  tab: 'overview',
  detailOpen: width() >= 768,
  treeOpen: width() >= 1200,
  editor: null,
  dirty: false,
  notice: '',
  importError: '',
  webglFailed: false,
  camera: { type: 'initial', tick: 0 },

  command: type => set(s => ({ camera: { type, tick: s.camera.tick + 1 } })),
  notify: notice => set({ notice }),
  setHovered: hoveredId => { if (get().hoveredId !== hoveredId) set({ hoveredId }); },
  setQuery: query => set({ query }),
  setTab: tab => set({ tab }),
  setView: view => set(s => ({ view, hoveredId: null, webglFailed: view === '3d' ? false : s.webglFailed, ...(view === '3d' && { notice: '', camera: { type: 'initial', tick: s.camera.tick + 1 } }) })),
  setTheme: theme => set({ theme }),
  setEditor: editor => set({ editor }),
  setImportError: importError => set({ importError }),
  toggleType: type => set(s => { const next = new Set(s.typeFilter); next.has(type) ? next.delete(type) : next.add(type); return { typeFilter: next }; }),
  clearFilters: () => set({ typeFilter: new Set(), query: '' }),

  // Từ 768 đến 1199px chỉ mở một panel phụ tại một thời điểm để giữ vùng sơ đồ.
  setTreeOpen: treeOpen => set(s => ({ treeOpen, detailOpen: treeOpen && width() < 1200 ? false : s.detailOpen })),
  setDetailOpen: detailOpen => set(s => ({ detailOpen, treeOpen: detailOpen && width() < 1200 ? false : s.treeOpen })),

  select: (id, { locate = false } = {}) => {
    const { units, focusId } = get();
    const keepFocus = focusId && (id === focusId || descendants(units, focusId).has(id));
    set(s => ({
      selectedId: id,
      expanded: new Set([...s.expanded, ...ancestors(units, id).slice(0, -1).map(u => u.id)]),
      focusId: keepFocus ? focusId : null,
    }));
    get().setDetailOpen(true);
    if (width() < 768) set({ treeOpen: false });
    if (locate) get().command('locate');
  },

  toggle: id => {
    const { units, expanded, selectedId } = get();
    const next = new Set(expanded);
    if (next.has(id)) {
      next.delete(id);
      if (descendants(units, id).has(selectedId)) set({ selectedId: id, notice: 'Đã thu gọn nhánh và chọn đơn vị cha.' });
    } else next.add(id);
    set({ expanded: next });
    get().command('fit');
  },

  expandToLevel: level => {
    const { units, selectedId } = get();
    const path = ancestors(units, selectedId);
    set({
      expanded: new Set(units.filter(u => ancestors(units, u.id).length < level).map(u => u.id)),
      focusId: null,
      selectedId: path.length > level ? path[level - 1].id : selectedId,
    });
    get().command('fit');
  },

  collapseAll: () => {
    const roots = get().units.filter(u => !u.parentId);
    set({ expanded: new Set(roots.map(u => u.id)), selectedId: roots[0].id, focusId: null, query: '' });
    get().command('fit');
  },

  focusBranch: id => {
    set(s => ({ focusId: id, expanded: new Set([...s.expanded, id]) }));
    if (width() < 768) set({ detailOpen: false });
    get().command('fit');
  },
  clearFocus: () => { set({ focusId: null }); get().command('fit'); },

  saveUnit: value => {
    const { units, editor } = get();
    const next = validateUnits(editor.mode === 'add' ? [...units, value] : units.map(u => (u.id === value.id ? value : u)));
    set(s => ({
      units: next, selectedId: value.id, editor: null, dirty: true, source: s.source === 'reference' ? 'edited' : s.source,
      expanded: new Set([...s.expanded, ...ancestors(next, value.id).map(u => u.id)]),
      notice: 'Đã cập nhật bản làm việc. Xuất JSON để lưu thành file.',
    }));
    get().setDetailOpen(true);
    get().command('fit');
  },

  replaceUnits: (data, source) => {
    const roots = data.filter(u => !u.parentId);
    set({
      units: data, source, selectedId: roots[0].id, expanded: new Set(roots.map(u => u.id)), focusId: null,
      query: '', typeFilter: new Set(), dirty: false, importError: '', hoveredId: null, notice: `Đã nhập ${data.length} đơn vị.`,
    });
    get().setDetailOpen(true);
    get().command('fit');
  },
  markExported: () => set({ dirty: false, notice: 'Đã xuất dữ liệu JSON. Hãy giữ file để mở lại phiên làm việc.' }),

  failWebGL: () => {
    if (get().webglFailed) return;
    set({ webglFailed: true, view: get().view === '3d' ? '2d' : get().view, hoveredId: null, notice: 'Thiết bị không mở được 3D. Đã chuyển sang sơ đồ 2D.' });
  },
}));

export const unitTypes = ['Ban', 'Vụ', 'Cục', 'Văn phòng', 'Phòng'];
