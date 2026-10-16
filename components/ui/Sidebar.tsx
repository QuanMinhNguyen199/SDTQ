'use client';
import { memo, type CSSProperties } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AnimatePresence, motion } from 'motion/react';
import { categoryLabels } from '../../data/orgData';
import { useOrgStore, type DetailTab } from '../../store/useOrgStore';
import { unitPath } from '../../data/explore';
import { toneVariables } from '../../src/theme.js';

const tabs:Array<{id:DetailTab;label:string}>=[{id:'overview',label:'Tổng quan'},{id:'duties',label:'Nhiệm vụ'},{id:'authorities',label:'Quyền hạn'},{id:'children',label:'Đơn vị con'}];
export default memo(function Sidebar() {
  const state=useOrgStore(useShallow(s=>({units:s.units,activeDeptId:s.activeDeptId,tab:s.tab,theme:s.theme,setDetailOpen:s.setDetailOpen,setTab:s.setTab,exploreLocate:s.exploreLocate,setExperienceMode:s.setExperienceMode})));
  const units=state.units;
  const unit=units.find(u=>u.id===state.activeDeptId);
  const level=unit?unitPath(units,unit.id).length:1;
  const children=units.filter(u=>u.parentId===unit?.id);
  if(!unit)return <div className="p-6 text-[14px] text-muted"><button className="float-right text-brand" onClick={()=>state.setDetailOpen(false)}>Đóng</button><h2 className="mb-4 text-lg text-ink">Hồ sơ đơn vị</h2>Chọn đơn vị để xem hồ sơ.</div>;
  return <div className="flex h-full min-h-0 flex-col">
    <div className="flex items-center justify-between px-6 pt-4 text-[12px] text-muted"><span>Hồ sơ đơn vị</span><button className="min-h-9 px-1" aria-label="Đóng hồ sơ Explore" onClick={()=>state.setDetailOpen(false)}>Đóng</button></div>
    <div className="inspector-title px-6 pt-1 pb-5" style={toneVariables(unit.type,state.theme) as CSSProperties}>
      <div className="mb-2 flex items-center gap-2 text-[12px] text-muted"><span className="unit-type-tag">{unit.type}</span><span>Cấp {level}</span></div>
      <h2 className="text-balance">{unit.name}</h2><p className="mt-2 text-[12px] text-muted">{unit.code}</p>
    </div>
    <div className="explore-tabs flex flex-wrap border-y border-line px-4" role="tablist" aria-label="Nội dung hồ sơ Explore">{tabs.map(tab=><button key={tab.id} role="tab" aria-selected={state.tab===tab.id} id={`explore-tab-${tab.id}`} aria-controls={`explore-panel-${tab.id}`} aria-label={tab.label} aria-description={tab.id==='duties'||tab.id==='authorities'?`${unit[tab.id].length} mục`:undefined} className={`flex min-h-11 items-center gap-1 px-1.5 text-[12px] whitespace-nowrap ${state.tab===tab.id?'border-b-2 border-brand font-semibold text-brand':'text-muted'}`} onClick={()=>state.setTab(tab.id)}>{tab.label}{(tab.id==='duties'||tab.id==='authorities')&&<span aria-hidden="true" className="grid h-4 min-w-4 place-items-center rounded bg-bg px-1 text-[11px] font-medium text-muted tabular-nums">{unit[tab.id].length}</span>}</button>)}</div>
    <div className="min-h-0 flex-1 overflow-auto px-6 py-5" role="tabpanel" id={`explore-panel-${state.tab}`} aria-labelledby={`explore-tab-${state.tab}`}>
      <AnimatePresence mode="wait" initial={false}><motion.div key={`${unit.id}-${state.tab}`} initial={{opacity:.5}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.12}}>
        {state.tab==='overview'&&<>
          <h3 className="mb-2 text-[16px]">Chức năng</h3><p className="text-muted">{unit.description||'Chưa có mô tả chức năng.'}</p>
          {unit.leader&&<section className="mt-6 border-t border-line pt-5"><h3 className="mb-2 text-[16px]">Người phụ trách</h3><p className="text-muted">{unit.leader}</p></section>}
        </>}
        {(state.tab==='duties'||state.tab==='authorities')&&<>
          {!unit[state.tab].length&&<p className="text-muted">Chưa có dữ liệu riêng của đơn vị này.</p>}
          <ol className="explore-content-list">{unit[state.tab].map((item,i)=><li className="border-b border-line py-4 first:pt-0" key={`${item.code}-${i}`}>
            {state.tab==='authorities'&&item.category&&<span className="mb-2 inline-block rounded-md bg-brand-soft px-2 py-1 text-[11px] text-brand">{categoryLabels[item.category!]}</span>}
            <div className="flex gap-3"><span className="pt-1 text-[12px] font-semibold text-brand">{item.code||i+1}</span><div><p>{item.text}</p>{item.items?.map((sub,j)=><p key={j} className="mt-2 border-l border-line pl-3 text-muted">{sub.code||j+1}. {sub.text}</p>)}</div></div>
          </li>)}</ol>
        </>}
        {state.tab==='children'&&<>{children.length?<ul>{children.map(child=><li key={child.id}><button className="w-full border-b border-line py-4 text-left text-[15px] hover:text-brand" onClick={()=>state.exploreLocate(child.id)}>{child.name}<small className="mt-1 block text-[12px] text-muted">{child.type} · {child.duties.length} nhiệm vụ</small></button></li>)}</ul>:<p className="text-muted">Đơn vị này chưa có đơn vị trực thuộc.</p>}</>}
      </motion.div></AnimatePresence>
    </div>
    <div className="border-t border-line p-4"><button className="btn-secondary w-full" onClick={()=>state.setExperienceMode('organization')}>Trở về sơ đồ quản lý</button></div>
  </div>;
});
