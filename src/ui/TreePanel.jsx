import React from 'react';
import { ancestors } from '../data';
import { unitTypes, useOrg } from '../store';
import { toneVariables } from '../theme';

export default function TreePanel({ results, filtering, maxDepth }) {
  const { units, searchQuery, typeFilter } = useOrg();
  const { setQuery, toggleType, clearFilters, expandToLevel, collapseAll, setTreeOpen, select } = useOrg.getState();
  const presentTypes = unitTypes.filter(t => units.some(u => u.type === t)).concat([...new Set(units.map(u => u.type))].filter(t => !unitTypes.includes(t)));
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between py-3 pr-3 pl-5">
        <h2 className="text-[14px] font-semibold">Cây tổ chức</h2>
        <button className="min-h-9 rounded-md px-2 text-[12px] text-muted hover:bg-bg hover:text-ink" onClick={() => setTreeOpen(false)} aria-label="Ẩn cây tổ chức">Ẩn</button>
      </div>

      <label className="mx-4 flex items-center gap-2 rounded-lg border border-control/60 px-3 py-2 text-muted focus-within:border-brand">
        <input value={searchQuery} onChange={e => setQuery(e.target.value)} placeholder="Tìm đơn vị…" aria-label="Tìm đơn vị"
          className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none! placeholder:text-muted" />
        {searchQuery && <button onClick={() => setQuery('')} aria-label="Xóa tìm kiếm" className="min-h-6 rounded px-1 text-[11px] hover:text-ink">Xóa</button>}
      </label>

      <fieldset className="mx-4 mt-3">
        <legend className="mb-2 text-[11px] text-muted">Loại đơn vị</legend>
        <div className="flex flex-wrap gap-1.5">
          {presentTypes.map(type => {
            const on = typeFilter.has(type);
            return (
              <button key={type} onClick={() => toggleType(type)} aria-pressed={on} style={toneVariables(type, 'dark')}
                className={`unit-type-filter rounded-full border px-2.5 py-1 text-[11px] transition-colors ${on ? 'font-semibold' : ''}`}>
                {type}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="tree-meta mx-5 mt-4 mb-2 flex items-center justify-between text-[11px] text-muted">
        <span className="tabular-nums">{filtering ? `${results.length} kết quả` : `${units.length} đơn vị`}</span>
        {filtering
          ? <button onClick={clearFilters} className="text-brand hover:underline">Xóa bộ lọc</button>
          : <label className="flex items-center gap-1">Mở
              <select aria-label="Mở theo cấp" value="" onChange={e => expandToLevel(Number(e.target.value))} className="cursor-pointer rounded bg-transparent p-0.5 text-ink">
                <option value="" disabled>tới cấp…</option>
                {Array.from({ length: maxDepth }, (_, i) => <option key={i} value={i + 1}>cấp {i + 1}</option>)}
              </select>
            </label>}
      </div>

      <nav className="min-h-0 flex-1 overflow-auto px-2.5 pb-3" aria-label="Danh sách đơn vị">
        {filtering ? <SearchResults results={results} onSelect={id => select(id, { locate: true })} /> : <ul><TreeLevel parentId={null} depth={0} /></ul>}
      </nav>

      <div className="border-t border-line px-5 py-3">
        <button onClick={collapseAll} className="flex min-h-9 items-center gap-2 text-[12px] text-muted hover:text-brand">Thu gọn toàn cây</button>
      </div>
    </div>
  );
}

function SearchResults({ results, onSelect }) {
  const units = useOrg(s => s.units);
  const activeDeptId = useOrg(s => s.activeDeptId);
  if (!results.length) return <p className="px-2 py-6 text-[13px] leading-relaxed text-muted">Không tìm thấy đơn vị.</p>;
  return (
    <ul className="search-results">
      {results.map(u => (
        <li key={u.id}>
          <button onClick={() => onSelect(u.id)} className={`w-full rounded-md px-2.5 py-2.5 text-left text-[13px] ${activeDeptId === u.id ? 'bg-brand-soft text-brand' : 'hover:bg-bg'}`}>
            <strong className="font-semibold">{u.name}</strong>
            <small className="mt-1 block text-[11px] text-muted">{ancestors(units, u.id).slice(0, -1).map(v => v.name).join(' / ') || u.type}</small>
          </button>
        </li>
      ))}
    </ul>
  );
}

function TreeLevel({ parentId, depth }) {
  const units = useOrg(s => s.units);
  const expanded = useOrg(s => s.expanded);
  const activeDeptId = useOrg(s => s.activeDeptId);
  const { select, toggle, setHovered } = useOrg.getState();
  return units.filter(u => u.parentId === parentId).map(u => {
    const count = units.filter(v => v.parentId === u.id).length;
    const open = expanded.has(u.id); const active = activeDeptId === u.id;
    return (
      <li key={u.id}>
        <div className={`flex min-h-9 items-center gap-0.5 rounded-md pr-2 ${active ? 'bg-brand-soft text-brand' : 'hover:bg-bg'}`} style={{ paddingLeft: 4 + depth * 14 }}
          onMouseEnter={() => setHovered(u.id)} onMouseLeave={() => setHovered(null)}>
          {count
            ? <button className="grid h-8 w-9 shrink-0 place-items-center text-[11px] text-muted" onClick={() => toggle(u.id)} aria-label={`${open ? 'Thu gọn' : 'Mở rộng'} ${u.name}`} aria-expanded={open}>{open ? 'Thu' : 'Mở'}</button>
            : <span className="w-9 shrink-0" />}
          <button className={`flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-[13px] leading-snug ${active ? 'font-semibold' : ''}`} onClick={() => select(u.id, { locate: true })} aria-current={active ? 'true' : undefined}>
            <span>{u.name}</span>
          </button>
          {count > 0 && <span className="text-[11px] text-muted tabular-nums">{count}</span>}
        </div>
        {count > 0 && open && <ul className="branch-list"><TreeLevel parentId={u.id} depth={depth + 1} /></ul>}
      </li>
    );
  });
}
