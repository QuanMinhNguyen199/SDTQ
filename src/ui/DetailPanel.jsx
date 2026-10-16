import React from 'react';
import { motion } from 'motion/react';
import { ancestors, itemCount } from '../data';
import { useOrg } from '../store';
import { toneVariables } from '../theme';

const tabs = [{ id: 'overview', label: 'Tổng quan' }, { id: 'duties', label: 'Nhiệm vụ' }, { id: 'authorities', label: 'Quyền hạn' }];

export default function DetailPanel() {
  const units = useOrg(s => s.units);
  const selectedId = useOrg(s => s.selectedId);
  const tab = useOrg(s => s.tab);
  const theme = useOrg(s => s.theme);
  const { select, setTab, setDetailOpen, setEditor, focusBranch } = useOrg.getState();
  const unit = units.find(u => u.id === selectedId) || units[0];
  const path = ancestors(units, unit.id);
  const children = units.filter(u => u.parentId === unit.id);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between pt-3 pr-3 pl-6 text-[12px] text-muted">
        <span>Hồ sơ đơn vị</span>
        <button className="min-h-9 rounded-md px-2 text-[14px] hover:bg-bg hover:text-ink" aria-label="Đóng hồ sơ" onClick={() => setDetailOpen(false)}>Đóng</button>
      </div>

      <div className="inspector-title px-6 pt-1 pb-5" style={toneVariables(unit.type, theme)}>
        <p className="mb-2 flex flex-wrap items-center gap-2 text-[12px] text-muted"><span className="unit-type-tag">{unit.type}</span><span>{[unit.code, `Cấp ${path.length}`].filter(Boolean).join(' · ')}</span></p>
        <motion.h2 key={unit.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16 }}
          className="text-[22px] leading-snug font-semibold tracking-tight text-balance">{unit.name}</motion.h2>
        <div className="unit-path mt-3 flex flex-wrap items-center gap-1 text-[12px] text-muted">
          {path.slice(0, -1).map(p => <button key={p.id} onClick={() => select(p.id, { locate: true })} className="flex items-center gap-1 hover:text-brand">{p.name}<span aria-hidden="true">/</span></button>)}
        </div>
      </div>

      <div className="flex gap-5 border-b border-line px-6" role="tablist" aria-label="Nội dung hồ sơ">
        {tabs.map(t => (
          <button key={t.id} role="tab" id={`button-${t.id}`} aria-selected={tab === t.id} aria-controls={`tab-${t.id}`} onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-1.5 py-3 text-[14px] whitespace-nowrap ${tab === t.id ? 'font-semibold text-brand' : 'text-muted hover:text-ink'}`}>
            {t.label}
            {t.id !== 'overview' && <span className="grid h-4 min-w-4 place-items-center rounded bg-bg px-1 text-[11px] text-muted tabular-nums">{unit[t.id].length}</span>}
            {tab === t.id && <motion.span layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand" transition={{ duration: 0.15 }} />}
          </button>
        ))}
      </div>

      <motion.div key={`${unit.id}-${tab}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}
        className="min-h-0 flex-1 overflow-auto px-6 py-5" role="tabpanel" id={`tab-${tab}`} aria-labelledby={`button-${tab}`}>
        {tab === 'overview' ? <>
          <section className="mb-6">
            <h3 className="mb-2 text-[14px] font-semibold">Chức năng</h3>
            <p className="text-[15px] leading-relaxed text-muted">{unit.description || 'Nguồn dữ liệu chưa có mô tả chức năng của đơn vị này.'}</p>
          </section>
          <div className="mb-6 border-y border-line py-1.5">
            {[['duties', 'Nhiệm vụ riêng'], ['authorities', 'Quyền hạn riêng']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} className="group flex w-full items-center gap-2.5 py-2.5 text-left text-[14px]">
                <strong className="text-sm font-semibold tabular-nums">{unit[key].length}</strong>
                <span className="text-muted group-hover:text-brand">{label}{itemCount(unit[key]) > unit[key].length && ` · ${itemCount(unit[key]) - unit[key].length} ý con`}</span>
              </button>
            ))}
          </div>
          <section className="mb-6">
            <div className="flex items-baseline justify-between"><h3 className="mb-2 text-[14px] font-semibold">Đơn vị trực thuộc</h3><span className="text-[12px] text-muted">{children.length}</span></div>
            {children.length
              ? <ul>{children.map(c => (
                  <li key={c.id}><button onClick={() => select(c.id, { locate: true })} className="flex w-full items-center gap-2.5 border-b border-line py-3 text-left text-[14px] hover:text-brand">
                    <span>{c.name}<small className="mt-1 block text-[11px] text-muted">{[c.type, c.code].filter(Boolean).join(' · ')} · {c.duties.length} nhiệm vụ · {c.authorities.length} quyền hạn</small></span>
                  </button></li>))}</ul>
              : <p className="text-[15px] text-muted">Đơn vị này chưa có đơn vị trực thuộc.</p>}
          </section>
        </> : <>
          <div className="mb-4">
            <h3 className="mb-1.5 text-[14px] font-semibold">{tab === 'duties' ? 'Nhiệm vụ' : 'Quyền hạn'} của đơn vị</h3>
            <p className="text-[14px] leading-relaxed text-muted">Nội dung riêng của {unit.name.toLowerCase()}, không bao gồm đơn vị cấp dưới.</p>
          </div>
          <ol className="responsibility-list">
            {unit[tab].map((item, i) => (
              <li key={i} className="flex gap-3 border-t border-line py-4">
                <span className="min-w-7 pt-0.5 text-[12px] font-semibold text-brand tabular-nums">{item.code || i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-relaxed">{item.text}</p>
                  {item.items?.length > 0 && (
                    <ol className="mt-2.5 space-y-2 border-l border-line pl-3">
                      {item.items.map((sub, j) => (
                        <li key={j} className="flex gap-2 text-[15px] leading-relaxed text-ink/90">
                          <span className="min-w-4 text-[12px] font-semibold text-muted">{sub.code || String.fromCharCode(97 + j)})</span><p>{sub.text}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {!unit[tab].length && <p className="border-t border-line py-6 text-[15px] leading-relaxed text-muted">Nguồn dữ liệu chưa có {tab === 'duties' ? 'nhiệm vụ' : 'quyền hạn'} riêng của đơn vị này. Không tự suy từ đơn vị cấp trên hoặc cấp dưới; chọn Chỉnh sửa nếu có văn bản căn cứ để bổ sung.</p>}
        </>}
      </motion.div>

      <div className="flex flex-wrap gap-2 border-t border-line p-4">
        <button className="btn-secondary flex-1" onClick={() => setEditor({ mode: 'edit', unit })}>Chỉnh sửa</button>
        <button className="btn-primary flex-1" onClick={() => setEditor({ mode: 'add', parentId: unit.id })}>Thêm đơn vị con</button>
        <button className="flex min-h-9 w-full items-center justify-center gap-2 text-[14px] text-muted hover:text-brand" onClick={() => focusBranch(unit.id)}>Xem riêng nhánh này</button>
      </div>
    </div>
  );
}
