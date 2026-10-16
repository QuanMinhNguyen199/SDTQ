'use client';
import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { categoryLabels, orderedStations } from '../../data/orgData';
import { journeyUnits, useOrgStore, type DetailTab } from '../../store/useOrgStore';
import { toneVariables } from '../../src/theme.js';

const tabs:Array<{id:DetailTab;label:string}>=[{id:'overview',label:'Tổng quan'},{id:'duties',label:'Nhiệm vụ'},{id:'authorities',label:'Quyền hạn'},{id:'children',label:'Đơn vị con'}];
export default function Sidebar() {
  const state=useOrgStore();
  const units=journeyUnits(state);
  const unit=units.find(u=>u.id===state.activeDeptId);
  const station=orderedStations(units).find(u=>u.id===state.activeDeptId);
  const children=units.filter(u=>u.parentId===unit?.id);
  if(!unit)return <div className="p-6 text-[14px] text-muted"><button className="float-right text-brand" onClick={()=>state.setDetailOpen(false)}>Đóng</button><h2 className="mb-4 text-lg text-ink">Hồ sơ đơn vị</h2>Chọn một trạm hoặc xóa bộ lọc để tiếp tục.</div>;
  return <div className="flex h-full min-h-0 flex-col">
    <div className="flex items-center justify-between px-6 pt-4 text-[12px] text-muted"><span>Hồ sơ Journey</span><button className="min-h-9 px-1" aria-label="Đóng hồ sơ Journey" onClick={()=>state.setDetailOpen(false)}>Đóng</button></div>
    <div className="inspector-title px-6 pt-1 pb-5" style={toneVariables(unit.type,state.theme) as CSSProperties}>
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted"><span className="unit-type-tag">{unit.type}</span><span>Layer {station?.depth??0} · cấp {(station?.depth??0)+1}</span></div>
      <h2 className="text-balance">{unit.name}</h2><p className="mt-2 text-[12px] text-muted">{unit.code}</p>
    </div>
    <div className="journey-tabs flex flex-wrap border-y border-line px-4" role="tablist" aria-label="Nội dung hồ sơ Journey">{tabs.map(tab=><button key={tab.id} role="tab" aria-selected={state.tab===tab.id} id={`journey-tab-${tab.id}`} aria-controls={`journey-panel-${tab.id}`} className={`min-h-11 px-2 text-[12px] ${state.tab===tab.id?'border-b-2 border-brand font-semibold text-brand':'text-muted'}`} onClick={()=>state.setTab(tab.id)}>{tab.label}</button>)}</div>
    <div className="min-h-0 flex-1 overflow-auto px-6 py-5" role="tabpanel" id={`journey-panel-${state.tab}`} aria-labelledby={`journey-tab-${state.tab}`}>
      <AnimatePresence mode="wait" initial={false}><motion.div key={`${unit.id}-${state.tab}`} initial={{opacity:.5}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.12}}>
        {state.tab==='overview'&&<>
          <h3 className="mb-2 text-[16px]">Chức năng</h3><p className="text-muted">{unit.description||'Chưa có mô tả chức năng.'}</p>
          <section className="mt-6 border-t border-line pt-5"><h3 className="mb-2 text-[16px]">Người phụ trách</h3><p className="text-muted">{unit.leader||'Chưa có dữ liệu người phụ trách.'}</p></section>
          <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-line py-5">{[[unit.duties.length,'Nhiệm vụ'],[unit.authorities.length,'Quyền hạn'],[children.length,'Đơn vị con']].map(([count,label])=><div key={String(label)}><dt className="text-[11px] text-muted">{label}</dt><dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{count}</dd></div>)}</dl>
          {state.journeyDataset==='sample'&&<p className="mt-5 text-muted">Cơ cấu, vai trò và nội dung trên là dữ liệu minh họa để thử Journey mode.</p>}
        </>}
        {(state.tab==='duties'||state.tab==='authorities')&&<>
          {!unit[state.tab].length&&<p className="text-muted">Chưa có dữ liệu riêng của đơn vị này.</p>}
          <ol className="journey-content-list">{unit[state.tab].map((item,i)=><li className="border-b border-line py-4 first:pt-0" key={`${item.code}-${i}`}>
            {state.tab==='authorities'&&<span className="mb-2 inline-block rounded-md bg-brand-soft px-2 py-1 text-[11px] text-brand">{item.category?categoryLabels[item.category]:'Quyền hạn chuyên môn'}</span>}
            <div className="flex gap-3"><span className="pt-1 text-[12px] font-semibold text-brand">{item.code||i+1}</span><div><p>{item.text}</p>{item.items?.map((sub,j)=><p key={j} className="mt-2 border-l border-line pl-3 text-muted">{sub.code||j+1}. {sub.text}</p>)}</div></div>
          </li>)}</ol>
        </>}
        {state.tab==='children'&&<>{children.length?<ul>{children.map(child=><li key={child.id}><button className="w-full border-b border-line py-4 text-left text-[15px] hover:text-brand" onClick={()=>state.jumpToStation(child.id,true)}>{child.name}<small className="mt-1 block text-[12px] text-muted">{child.type} · {child.duties.length} nhiệm vụ</small></button></li>)}</ul>:<p className="text-muted">Đơn vị này chưa có đơn vị trực thuộc.</p>}</>}
      </motion.div></AnimatePresence>
    </div>
    <div className="border-t border-line p-4"><button className="btn-secondary w-full" onClick={()=>state.setExperienceMode('organization')}>Trở về sơ đồ quản lý</button></div>
  </div>;
}
