import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ancestors, itemCount, layoutTree } from '../data';
import { useOrg } from '../store';
import { fitViewport, zoomViewport } from './viewport2d';
import { toneVariables } from '../theme';

export function Graph2D({ units, allUnits, matches, filtering }) {
  const selectedId = useOrg(s => s.selectedId);
  const expanded = useOrg(s => s.expanded);
  const camera = useOrg(s => s.camera);
  const theme = useOrg(s => s.theme);
  const reduced = useReducedMotion();
  const selectedPath = new Set(ancestors(allUnits, selectedId).map(u => u.id));
  const { select, toggle } = useOrg.getState();
  const svg = useRef(null);
  const gesture = useRef(null);
  const handledCommand = useRef(null);
  const positions = useMemo(() => layoutTree(units), [units]);
  const points = [...positions.values()];
  const minX = Math.min(...points.map(p => p.x), 0) - 125;
  const maxX = Math.max(...points.map(p => p.x), 0) + 125;
  const minY = Math.min(...points.map(p => -p.y), 0) - 80;
  const maxY = Math.max(...points.map(p => -p.y), 0) + 90;
  const [size, setSize] = useState({ width: 1, height: 1 });
  const fit = useMemo(() => fitViewport({ x: minX, y: minY, width: maxX - minX, height: maxY - minY }, size.width, size.height), [minX, minY, maxX, maxY, size.width, size.height]);
  const [view, setView] = useState(fit);
  const currentView = useRef(view); currentView.current = view;
  const fitRef = useRef(fit); fitRef.current = fit;

  useEffect(() => {
    const element = svg.current;
    const observer = new ResizeObserver(() => {
      const rect = element.getBoundingClientRect();
      if (rect.width && rect.height) setSize({ width: rect.width, height: rect.height });
    });
    observer.observe(element);
    // Native listener must be non-passive so wheel zoom does not scroll the page.
    const wheel = event => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1);
      setView(v => zoomViewport(v, fitRef.current, Math.exp(-Math.max(-300, Math.min(300, delta)) * .002), { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height }));
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => { observer.disconnect(); element.removeEventListener('wheel', wheel); };
  }, []);
  useEffect(() => { setView(fit); }, [fit]);
  useEffect(() => {
    if (handledCommand.current === camera.tick) return;
    handledCommand.current = camera.tick;
    if (camera.type === 'zoom-in' || camera.type === 'zoom-out') setView(v => zoomViewport(v, fit, camera.type === 'zoom-in' ? 1.25 : 1 / 1.25));
    else if (camera.type === 'locate') {
      const p = positions.get(selectedId);
      if (p) setView(v => { const next = zoomViewport(v, fit, Math.max(1, 2 / (fit.width / v.width))); return { ...next, x: p.x - next.width / 2, y: -p.y - next.height / 2 }; });
    } else if (camera.type === 'fit' || camera.type === 'initial') setView(fit);
  }, [camera, fit, positions, selectedId]);

  function pointerDown(event) {
    if (event.button !== 0 || event.target.closest('button') || gesture.current) return;
    const rect = svg.current.getBoundingClientRect();
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, view: currentView.current, width: rect.width, height: rect.height };
    svg.current.setPointerCapture(event.pointerId);
    svg.current.focus();
  }
  function pointerMove(event) {
    const drag = gesture.current;
    if (!drag || drag.id !== event.pointerId) return;
    setView({ ...drag.view, x: drag.view.x - (event.clientX - drag.x) / drag.width * drag.view.width, y: drag.view.y - (event.clientY - drag.y) / drag.height * drag.view.height });
  }
  function pointerUp(event) {
    if (gesture.current?.id !== event.pointerId) return;
    gesture.current = null;
    if (svg.current.hasPointerCapture(event.pointerId)) svg.current.releasePointerCapture(event.pointerId);
  }
  function keyDown(event) {
    if (event.target.closest('button') || event.ctrlKey || event.metaKey || event.altKey) return;
    if (['+', '=', '-', '_'].includes(event.key)) { event.preventDefault(); setView(v => zoomViewport(v, fit, ['+', '='].includes(event.key) ? 1.25 : 1 / 1.25)); }
    else if (event.key === 'Home') { event.preventDefault(); setView(fit); }
    else if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
      event.preventDefault();
      setView(v => ({ ...v, x: v.x + (event.key === 'ArrowLeft' ? -.08 : event.key === 'ArrowRight' ? .08 : 0) * v.width, y: v.y + (event.key === 'ArrowUp' ? -.08 : event.key === 'ArrowDown' ? .08 : 0) * v.height }));
    }
  }
  return (
    <div className="graph-2d size-full overflow-hidden px-4 pt-28 pb-20 md:pt-20">
      <svg ref={svg} viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} role="group" tabIndex={0} aria-label="Sơ đồ tổ chức hai chiều. Cuộn để thu phóng, kéo nền để di chuyển. Phím cộng trừ để thu phóng, mũi tên để di chuyển, Home để về toàn cảnh."
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onLostPointerCapture={() => { gesture.current = null; }} onKeyDown={keyDown}
        className="size-full touch-none select-none cursor-grab active:cursor-grabbing focus-visible:outline-offset-[-3px]">
        {units.filter(u => positions.has(u.parentId)).map(u => {
          const a = positions.get(u.parentId), b = positions.get(u.id);
          return <motion.path key={u.id} d={`M ${a.x} ${-a.y + 40} V ${(-a.y - b.y) / 2} H ${b.x} V ${-b.y - 40}`} className={`fill-none ${selectedPath.has(u.id) ? 'stroke-brand' : 'stroke-control'}`} strokeWidth={selectedPath.has(u.id) ? 2.5 : 1.5}
            initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : .42 }} />;
        })}
        {units.map(u => {
          const p = positions.get(u.id); const count = allUnits.filter(v => v.parentId === u.id).length; const active = selectedId === u.id;
          return (
            <motion.g key={u.id} initial={reduced ? false : { x: p.x, y: -p.y + 12, opacity: .3 }} animate={{ x: p.x, y: -p.y, opacity: 1 }} transition={{ duration: reduced ? 0 : .32, ease: [.22, 1, .36, 1] }}>
            <foreignObject x={-97} y={-45} width="194" height="112">
              <div style={toneVariables(u.type, theme)} className={`flat-unit relative h-[90px] rounded-[9px] border ${active ? 'border-brand bg-brand-soft' : 'border-control bg-surface'} ${filtering && !matches(u) ? 'opacity-40' : ''}`}>
                <button className="flex size-full flex-col items-center justify-center gap-1 px-3 text-center" onClick={() => select(u.id)} aria-label={`Xem ${u.name}`}>
                  <span className="unit-type-tag">{u.code || u.type}</span>
                  <strong className="text-[15px] leading-tight font-semibold">{u.name}</strong>
                </button>
                {count > 0 && <button className="absolute -bottom-3 left-1/2 min-w-9 -translate-x-1/2 rounded-[5px] border border-line bg-surface px-1.5 text-[12px] leading-5 text-muted hover:border-brand hover:text-brand"
                  aria-label={`${expanded.has(u.id) ? 'Thu gọn' : 'Mở rộng'} ${u.name}`} aria-expanded={expanded.has(u.id)} onClick={() => toggle(u.id)}>{expanded.has(u.id) ? '−' : '+'} {count}</button>}
              </div>
            </foreignObject>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

export function ListView({ units, matches, filtering }) {
  const selectedId = useOrg(s => s.selectedId);
  const select = useOrg(s => s.select);
  return (
    <div className="size-full overflow-auto px-3 pt-28 pb-6 md:px-5 md:pt-20">
      <table className="unit-table w-full border-collapse text-[14px]">
        <thead><tr className="text-[12px] text-muted">
          <th className="border-b border-line px-2 py-3 text-left font-medium">Đơn vị</th>
          <th className="border-b border-line px-2 py-3 font-medium">Nhiệm vụ</th>
          <th className="border-b border-line px-2 py-3 font-medium">Quyền hạn</th>
        </tr></thead>
        <tbody>
          {units.map(u => (
            <tr key={u.id} className={`${selectedId === u.id ? 'bg-brand-soft' : ''} ${filtering && !matches(u) ? 'opacity-45' : ''}`}>
              <td className="border-b border-line"><button onClick={() => select(u.id)} className="flex w-full items-center gap-2 py-3.5 pr-2 text-left text-[15px]" style={{ paddingLeft: 10 + u.depth * 16 }}>
                <span>{u.name}<small className="mt-1 block text-[12px] text-muted">{[u.code, u.type].filter(Boolean).join(' · ')}</small></span>
              </button></td>
              <td className="border-b border-line text-center tabular-nums">{itemCount(u.duties)}</td>
              <td className="border-b border-line text-center tabular-nums">{itemCount(u.authorities)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
