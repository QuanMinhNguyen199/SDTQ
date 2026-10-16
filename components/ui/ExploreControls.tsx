'use client';
import { useEffect, useRef, useState } from 'react';
import { useOrgStore } from '../../store/useOrgStore';
import { branchFloors, buildingDepth, floorDestination, floorName, floorParents, unitPath } from '../../data/explore';
import { normalize } from '../../src/data';

export default function ExploreControls() {
  const state=useOrgStore();
  const [query,setQuery]=useState('');
  const searchDetails=useRef<HTMLDetailsElement>(null);
  const [parentChoices,setParentChoices]=useState<Record<number,string>>({});
  useEffect(()=>setParentChoices({}),[state.exploreBranchId,state.units]);
  useEffect(()=>{if(state.exploreLookActive){setQuery('');if(searchDetails.current)searchDetails.current.open=false;}},[state.exploreLookActive]);
  const maxDepth=buildingDepth(state.units);
  const path=unitPath(state.units,state.exploreBranchId);
  const room=state.units.find(unit=>unit.id===state.exploreRoomId);
  const allowed=branchFloors(state.units,state.exploreBranchId);
  const building=state.explorePhase==='building';
  const busy=['boarding','travelling','opening'].includes(state.explorePhase);
  const results=query.trim()?state.units.filter(unit=>normalize(`${unit.name} ${unit.code}`).includes(normalize(query.trim()))).slice(0,12):[];
  const scope=state.exploreDepth===0?path[0]:path[state.exploreDepth-1];
  return <>
    <div className="pointer-events-none absolute top-3 right-[calc(var(--inset-r)+12px)] left-3 z-10 flex flex-wrap items-start justify-between gap-2 max-md:right-3">
      <section className="floating pointer-events-auto max-w-full p-3 md:min-w-[270px]" aria-label="Vị trí Explore">
        <div className="flex items-center justify-between gap-5 text-[11px] text-muted"><span>{floorName(state.exploreDepth,maxDepth)}</span><span>{building?'Toàn nhà':busy?'Thang máy':room?'Trong phòng':'Hành lang'}</span></div>
        <h2 className="mt-1 max-w-[310px] text-[14px] leading-snug">{room&&!building?room.name:scope?.name}</h2>
        {path.length>1&&<nav className="mt-2 flex max-w-[340px] flex-wrap gap-1 text-[11px] text-muted" aria-label="Nhánh đang khám phá">{path.map((unit,index)=><span key={unit.id}>{index>0&&<span className="mx-1" aria-hidden="true">/</span>}<button className="hover:text-brand" disabled={busy} onClick={()=>state.exploreLocate(unit.id)}>{unit.name}</button></span>)}</nav>}
        {!building&&!busy&&<details ref={searchDetails} className="mt-3 border-t border-line pt-2 text-[12px]">
          <summary className="cursor-pointer text-muted">Tìm đơn vị</summary>
          <input aria-label="Tìm đơn vị trong Explore" placeholder="Tên hoặc mã đơn vị…" value={query} onChange={event=>setQuery(event.target.value)} className="explore-input mt-2"/>
          {query&&<ul className="mt-2 max-h-48 overflow-auto">{results.length?results.map(unit=><li key={unit.id}><button className="w-full border-b border-line py-2 text-left hover:text-brand" onClick={()=>{state.exploreLocate(unit.id);setQuery('');}}>{unit.name}</button></li>):<li className="py-2 text-muted">Không tìm thấy đơn vị.</li>}</ul>}
        </details>}
      </section>
      {busy&&<div className="floating pointer-events-auto px-4 py-3 text-[12px] text-muted" role="status">{state.explorePhase==='boarding'?'Đang vào thang máy…':state.explorePhase==='travelling'?'Đang chuyển tầng…':'Đang mở cửa…'}</div>}
    </div>

    {building&&<section className="explore-floor-picker floating absolute bottom-4 left-3 z-10 w-[290px] p-4 max-md:right-3 max-md:bottom-3 max-md:w-auto" aria-label="Chọn tầng thang máy">
      <div className="mb-3 flex items-center justify-between"><h2 className="text-[15px]">Chọn tầng</h2><button className="min-h-9 px-2 text-[12px] text-muted" onClick={state.exploreCancelElevator}>Quay lại</button></div>
      <div className="max-h-[38dvh] space-y-1 overflow-auto">{Array.from({length:maxDepth+1},(_,depth)=>{
        const candidates=floorParents(state.units,state.exploreBranchId,depth);
        const choice=parentChoices[depth];
        const destination=floorDestination(state.units,state.exploreBranchId,depth,choice||undefined);
        const enabled=destination!==null;
        const parent=depth===0?path[0]:destination?unitPath(state.units,destination)[depth-1]:undefined;
        return <div key={depth}>
          {candidates.length>1&&<select aria-label={`Đơn vị cha của ${floorName(depth,maxDepth)}`} className="explore-input mb-1" value={choice??(allowed.includes(depth)?path[depth-1]?.id??'':'')} onChange={event=>setParentChoices(current=>({...current,[depth]:event.target.value}))}><option value="">Chọn đơn vị cha</option>{candidates.map(candidate=><option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select>}
          <button className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left ${depth===state.exploreDepth?'border-brand bg-brand-soft':'border-line'}`} disabled={!enabled} onClick={()=>state.exploreChooseFloor(depth,choice||undefined)} aria-label={`Đi đến ${floorName(depth,maxDepth)}`}>
            <span><strong className="block text-[12px] font-semibold">{floorName(depth,maxDepth)}</strong><span className="mt-1 block text-[11px] text-muted">{enabled?(depth===0?parent?.name:`Trực thuộc ${parent?.name}`):candidates.length?'Chọn đơn vị cha':'Chưa có đơn vị ở cấp này'}</span></span><span className="text-[11px] text-muted">{depth===state.exploreDepth?'Đang ở đây':''}</span>
          </button>
        </div>;
      })}</div>
    </section>}

    {!building&&!busy&&<div className="pointer-events-none absolute right-[calc(var(--inset-r)+12px)] bottom-3 left-3 z-10 flex flex-col items-center gap-2 max-md:right-3">
      <div role="group" aria-label="Quick access" className="floating pointer-events-auto p-1 text-[12px]">
        <button className="min-h-10 rounded-md bg-brand-soft px-4 font-semibold text-brand" onClick={state.exploreElevator}>Thang máy</button>
      </div>
      <div className="floating pointer-events-auto flex gap-1 p-1 text-[11px] md:hidden">{[['a','Trái'],['w','Tiến'],['s','Lùi'],['d','Phải']].map(([key,label])=><button key={key} className="min-h-10 touch-none px-3" onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);state.command(`explore-hold-${key}`);}} onPointerUp={()=>state.command('explore-release')} onPointerCancel={()=>state.command('explore-release')} onLostPointerCapture={()=>state.command('explore-release')}>{label}</button>)}</div>
      <p className="hidden max-w-full rounded-lg border border-line bg-surface px-5 py-3 text-center text-[15px] leading-relaxed font-medium text-ink md:block">{state.exploreLookActive?'Di chuột để nhìn · WASD / mũi tên để đi · Bấm lần nữa để thả chuột':'Bấm vào cảnh để nhìn tự do · Giữ WASD / mũi tên để đi'}</p>
      <p className="max-w-full rounded-lg border border-line bg-surface px-3 py-2 text-center text-[14px] leading-relaxed font-medium text-ink md:hidden">Vuốt để nhìn quanh · Giữ nút để di chuyển</p>
    </div>}
  </>;
}
