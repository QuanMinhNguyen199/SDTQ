import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ancestors, normalize, referenceInfo, unmappedRelations, validateUnits, visibleUnits } from './data';
import { useOrg } from './store';
import { hasWebGL, layoutScene } from './scene/layout';
import TreePanel from './ui/TreePanel';
import DetailPanel from './ui/DetailPanel';
import UnitEditor from './ui/UnitEditor';
import { Graph2D, ListView } from './ui/FlatViews';
import logoDark from '../assets/logo-dark.png';

const OrgScene = lazy(() => import('../components/3d/OrgScene'));
import ExploreControls from '../components/ui/ExploreControls';
import ExploreSidebar from '../components/ui/Sidebar';
import { isExploreEnabled } from '../store/features';

// Explore mode chỉ mở ở localhost; trên GitHub Pages ẩn nút chuyển chế độ.
const exploreEnabled = isExploreEnabled();
const ease = [0.22, 1, 0.36, 1];

function useViewportWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => { const onResize = () => setWidth(window.innerWidth); window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize); }, []);
  return width;
}

export default function App() {
  const units = useOrg(s => s.units);
  const expanded = useOrg(s => s.expanded);
  const focusId = useOrg(s => s.focusId);
  const searchQuery = useOrg(s => s.searchQuery);
  const typeFilter = useOrg(s => s.typeFilter);
  const theme = useOrg(s => s.theme);
  const view = useOrg(s => s.view);
  const treeOpen = useOrg(s => s.treeOpen);
  const detailOpen = useOrg(s => s.detailOpen);
  const editor = useOrg(s => s.editor);
  const dirty = useOrg(s => s.dirty);
  const notice = useOrg(s => s.notice);
  const importError = useOrg(s => s.importError);
  const webglFailed = useOrg(s => s.webglFailed);
  const explore = useOrg(s => s.experienceMode) === 'explore';
  const store = useOrg.getState();
  const fileInput = useRef(null);
  const vw = useViewportWidth();
  const mobile = vw < 768;

  const visible = useMemo(() => visibleUnits(units, expanded, focusId), [units, expanded, focusId]);
  const positions = useMemo(() => layoutScene(visible), [visible]);
  const filtering = !!searchQuery.trim() || typeFilter.size > 0;
  const matches = useMemo(() => {
    const q = normalize(searchQuery.trim());
    return u => (!typeFilter.size || typeFilter.has(u.type)) && (!q || normalize(`${u.name} ${u.code}`).includes(q));
  }, [searchQuery, typeFilter]);
  const results = useMemo(() => (filtering ? units.filter(matches) : []), [units, matches, filtering]);
  const maxDepth = useMemo(() => Math.max(...units.map(u => ancestors(units, u.id).length)), [units]);

  // Panel phủ lên canvas: camera căn giữa sơ đồ trong phần còn trống.
  const treeW = vw >= 1600 ? 340 : 320, detailW = vw >= 1600 ? 440 : vw >= 1200 ? 408 : 360;
  const insets = { left: explore ? 0 : treeOpen && !mobile ? treeW + 24 : 0, right: detailOpen && !mobile ? detailW + 24 : 0, top: explore ? 140 : 64, bottom: explore ? 130 : 76 };

  useEffect(() => { if (!hasWebGL()) store.failWebGL(); }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem('sdtq-theme', theme); } catch {} }, [theme]);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => store.notify(''), 4500); return () => clearTimeout(t); }, [notice]);
  useEffect(() => { if (!dirty) return; const h = e => { e.preventDefault(); e.returnValue = ''; }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h); }, [dirty]);

  function exportData() {
    const { units, source } = useOrg.getState();
    const blob = new Blob([JSON.stringify({ schemaVersion: 2, title: 'Cơ cấu tổ chức', source, ...(source !== 'import' && { sourceInfo: referenceInfo, unmappedRelations }), exportedAt: new Date().toISOString(), units }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'co-cau-to-chuc.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
    store.markExported();
  }
  async function importData(event) {
    const file = event.target.files[0]; event.target.value = ''; if (!file) return;
    if (useOrg.getState().dirty && !window.confirm('Bạn có thay đổi chưa xuất. Thay dữ liệu hiện tại bằng file mới?')) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('File không được vượt quá 5 MB.');
      const parsed = JSON.parse(await file.text());
      store.replaceUnits(validateUnits(parsed.units), parsed.source === 'reference' ? 'reference' : parsed.source === 'edited' ? 'edited' : 'import');
    } catch (error) { store.setImportError(error.message || 'Không thể đọc file JSON.'); }
  }

  const focusUnit = focusId && units.find(u => u.id === focusId);
  const panelMotion = side => ({ initial: { opacity: 0, x: side * 16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: side * 16 }, transition: { duration: 0.18, ease } });
  const changeView = next => {
    if (next === '3d' && !hasWebGL()) { store.notify('Không mở được 3D. Hãy dùng sơ đồ 2D hoặc thử lại.'); return; }
    store.setView(next);
  };

  const changeMode = mode => {
    if (mode === 'explore' && !exploreEnabled) return;
    if (mode === 'explore' && !hasWebGL()) { store.notify('Explore cần trình duyệt hỗ trợ 3D. Bạn vẫn có thể dùng sơ đồ 2D.'); return; }
    store.setExperienceMode(mode);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-dvh flex-col overflow-hidden">
        <header className="brand-header z-30 flex min-h-16 shrink-0 flex-wrap items-center gap-2 py-2 md:h-16 md:flex-nowrap md:py-0 border-b border-line bg-surface px-3 md:gap-5 md:px-6">
          <a href="./" aria-label="THEHEGEO — trang đầu" className="w-[96px] shrink-0 overflow-hidden rounded md:w-[144px] max-sm:w-[80px]">
            <img src={typeof logoDark === 'string' ? logoDark : logoDark.src} alt="THEHEGEO" className="block h-auto w-full" />
          </a>
          <span className="hidden h-6 w-px bg-line lg:block" />
          <h1 className="hidden items-center gap-2.5 text-[15px] font-semibold tracking-tight lg:flex">
            Sơ đồ tổ chức
          </h1>
          {exploreEnabled && <div role="group" aria-label="Chế độ trải nghiệm" className="order-3 flex w-full shrink-0 justify-center gap-0.5 rounded-lg bg-bg p-1 md:order-none md:w-auto">
            {[['organization','Sơ đồ'],['explore','Explore']].map(([mode,label]) => <button key={mode} aria-label={mode==='explore'?'Explore mode':'Chế độ Sơ đồ'} aria-pressed={explore === (mode === 'explore')} onClick={() => changeMode(mode)} className={`min-h-8 rounded-md px-2 text-[12px] md:px-3 ${explore === (mode === 'explore') ? 'bg-brand-soft font-semibold text-brand' : 'text-muted hover:text-ink'}`}>{label}</button>)}
          </div>}
          <div className="ml-auto flex items-center gap-1.5 md:gap-2">
            {dirty && <span className="mr-2 hidden text-[11px] text-muted lg:inline">Chưa xuất thay đổi</span>}
            <input type="file" accept="application/json,.json" ref={fileInput} hidden onChange={importData} />
            <button className="btn-secondary px-2.5 md:px-3.5" aria-label="Nhập dữ liệu" onClick={() => fileInput.current.click()}><span className="sm:hidden">Nhập</span><span className="hidden sm:inline">Nhập dữ liệu</span></button>
            <button className="btn-primary relative px-2.5 md:px-3.5" aria-label="Xuất JSON" onClick={exportData}><span className="sm:hidden">Xuất</span><span className="hidden sm:inline">Xuất dữ liệu</span>{dirty && <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-white" />}</button>
            <button className="min-h-10 rounded-md px-2 text-[12px] text-muted hover:bg-bg hover:text-ink" onClick={() => store.setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? 'Bật theme tối' : 'Bật theme sáng'}>{theme === 'light' ? 'Tối' : 'Sáng'}</button>
          </div>
        </header>

        <main className="relative min-h-0 flex-1 overflow-hidden bg-bg" style={{ '--inset-l': `${insets.left}px`, '--inset-r': `${insets.right}px` }}>
          <section aria-label="Không gian sơ đồ" className="absolute inset-0">
            {view === '3d' && !webglFailed && (
              <Suspense fallback={<p className="grid h-full place-items-center text-[15px] text-muted">Đang tải sơ đồ…</p>}>
                <div role="region" tabIndex={0} aria-label={explore ? "Explore: bấm vào cảnh để nhìn tự do, Bấm lần nữa hoặc Escape để thả chuột. Giữ W A S D hoặc phím mũi tên để di chuyển. Chọn cửa để vào đơn vị hoặc thang máy để đổi tầng." : "Sơ đồ tổ chức 3D. Mũi tên hoặc W A S D để di chuyển, Shift cộng mũi tên hoặc Q E để xoay, cộng trừ để thu phóng, Home để về toàn cảnh. Chọn đơn vị qua nhãn hoặc cây tổ chức."} className="absolute inset-0 focus-visible:outline-offset-[-3px]">
                  <OrgScene units={visible} allUnits={units} positions={positions} matches={matches} filtering={filtering} insets={insets} />
                </div>
              </Suspense>
            )}
            {view !== '3d' && (
              <div className="absolute inset-0 transition-[padding] duration-200" style={{ paddingLeft: insets.left, paddingRight: insets.right }}>
                {view === '2d' ? <Graph2D units={visible} allUnits={units} matches={matches} filtering={filtering} /> : <ListView units={visible} matches={matches} filtering={filtering} />}
              </div>
            )}
          </section>

          {!explore && <>
          {/* Thanh công cụ trên: chế độ xem + ngữ cảnh phạm vi */}
          <div className="pointer-events-none absolute top-3 right-[calc(var(--inset-r)+12px)] left-[calc(var(--inset-l)+12px)] z-10 flex flex-wrap items-start justify-between gap-2 transition-[left,right] duration-200 max-md:right-3 max-md:left-3">
            <div className="pointer-events-auto flex items-center gap-2">
              {!treeOpen && <button className="floating min-h-10 px-3 text-[14px] text-muted hover:text-ink" aria-label="Mở cây tổ chức" onClick={() => store.setTreeOpen(true)}>Cây tổ chức</button>}
              <div className="floating flex gap-0.5 p-1">
                {[{ id: '3d', label: '3D' }, { id: '2d', label: '2D' }, { id: 'list', label: 'Danh sách' }].map(v => (
                  <button key={v.id} onClick={() => changeView(v.id)} aria-pressed={view === v.id}
                    className={`flex min-h-8 items-center gap-1.5 rounded-md px-2.5 text-[14px] ${view === v.id ? 'bg-brand-soft font-semibold text-brand' : 'text-muted hover:text-ink'}`}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="pointer-events-auto flex items-center gap-2">
              {focusUnit && <div className="floating flex min-h-10 items-center gap-2.5 px-3 text-[12px] text-muted">
                <span className="max-w-40 truncate font-semibold text-ink">{focusUnit.name}</span>
                <button onClick={store.clearFocus} className="border-l border-line pl-2.5 text-brand">Toàn cây</button>
              </div>}
              {!detailOpen && <button className="floating flex min-h-10 items-center gap-2 px-3 text-[14px] font-semibold hover:text-brand" onClick={() => store.setDetailOpen(true)}>Hồ sơ đơn vị</button>}
            </div>
          </div>

          {/* Điều khiển camera + chú giải */}
          {(view === '2d' || (view === '3d' && !webglFailed)) && (
            <div className="pointer-events-none absolute right-[calc(var(--inset-r)+12px)] bottom-3 left-[calc(var(--inset-l)+12px)] z-10 flex items-end justify-center transition-[left,right] duration-200 max-md:right-3 max-md:left-3">
              <div className="floating pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-0.5 p-1 text-[12px] text-muted [&>button]:min-h-9 [&>button]:px-2 [&>button]:rounded-md [&>button:hover]:bg-brand-soft [&>button:hover]:text-brand max-md:[&>button]:min-h-11">
                <button aria-label="Thu nhỏ" title="Thu nhỏ (−)" onClick={() => store.command('zoom-out')}>Thu nhỏ</button>
                <button aria-label="Phóng to" title="Phóng to (+)" onClick={() => store.command('zoom-in')}>Phóng to</button>
                <span className="mx-1 h-5 w-px bg-line" />
                {view === '3d' && <select aria-label="Góc nhìn" defaultValue="angled" onChange={e => store.command(e.target.value)} className="min-h-9 max-w-28 rounded-md bg-transparent px-2 text-[12px] text-ink max-md:min-h-11">
                  <option value="angled">Phối cảnh</option><option value="top">Từ trên</option><option value="front">Chính diện</option>
                </select>}
                <button aria-label="Toàn cảnh" title="Toàn cảnh (Home)" onClick={() => store.command('fit')}>Toàn cảnh</button>
                <button aria-label="Định vị đơn vị đang chọn" title="Định vị" onClick={() => store.command('locate')}>Định vị</button>
              </div>
            </div>
          )}

          </>}
          {explore && <ExploreControls />}
          <AnimatePresence>
            {!explore && treeOpen && (
              <motion.aside key="tree" {...panelMotion(-1)} aria-label="Cây tổ chức"
                className="navigation-panel floating absolute top-3 bottom-3 left-3 z-20 overflow-hidden max-md:inset-0 max-md:rounded-none max-md:border-0"
                style={{ width: mobile ? undefined : treeW }}>
                <TreePanel results={results} filtering={filtering} maxDepth={maxDepth} />
              </motion.aside>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!explore && detailOpen && (
              <motion.aside key="detail" {...panelMotion(1)} aria-label="Hồ sơ đơn vị"
                className="floating absolute top-3 right-3 bottom-3 z-20 overflow-hidden max-md:inset-0 max-md:rounded-none max-md:border-0"
                style={{ width: mobile ? undefined : detailW }}>
                <DetailPanel />
              </motion.aside>
            )}
          </AnimatePresence>
          {explore && <motion.aside
            initial={false} animate={{opacity:detailOpen?1:0,x:detailOpen?0:16}} transition={{duration:0.18,ease}}
            aria-label="Hồ sơ đơn vị" aria-hidden={!detailOpen} inert={!detailOpen}
            className="floating absolute top-3 right-3 bottom-3 z-20 overflow-hidden max-md:inset-0 max-md:rounded-none max-md:border-0"
            style={{width:mobile?undefined:detailW,visibility:detailOpen?'visible':'hidden',pointerEvents:detailOpen?'auto':'none'}}>
            <ExploreSidebar />
          </motion.aside>}
        </main>

        <div className="sr-only" aria-live="polite">{notice}</div>
        <AnimatePresence>
          {notice && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease }}
              className="fixed bottom-24 left-1/2 z-50 flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-3 rounded-xl bg-ink px-4 py-3 text-[14px] text-surface shadow-panel">
              {notice}
              <button className="shrink-0 underline" aria-label="Đóng thông báo" onClick={() => store.notify('')}>Đóng</button>
            </motion.div>
          )}
        </AnimatePresence>
        {importError && (
          <div role="alert" className="fixed bottom-40 left-1/2 z-50 flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-3 rounded-xl bg-[#9b2020] px-4 py-3 text-[14px] text-white shadow-panel">
            <span>{importError}</span>
            <button className="shrink-0 underline" aria-label="Đóng lỗi nhập dữ liệu" onClick={() => store.setImportError('')}>Đóng</button>
          </div>
        )}
        {editor && <UnitEditor />}
      </div>
    </MotionConfig>
  );
}
