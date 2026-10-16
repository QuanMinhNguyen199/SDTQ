'use client';
import { useMemo, useState } from 'react';
import { journeyStations, journeyUnits, useOrgStore } from '../../store/useOrgStore';
import { orderedStations } from '../../data/orgData';

export default function JourneyControls() {
  const state=useOrgStore();
  const [filtersOpen,setFiltersOpen]=useState(false);
  const data=journeyUnits(state);
  const all=useMemo(()=>orderedStations(data),[data]);
  const stations=journeyStations(state);
  const index=stations.findIndex(u=>u.id===state.activeDeptId);
  const current=stations[index];
  const clusters=all.filter(u=>u.depth===1);
  const levels=[...new Set(all.map(u=>u.depth))].sort((a,b)=>a-b);
  return <>
    <section className="journey-guide floating absolute top-4 left-4 z-10 w-[300px] p-5 max-md:right-3 max-md:left-3 max-md:w-auto" aria-label="Điều hướng Journey">
      <div className="flex items-center justify-between gap-3"><h2 className="text-xl">Journey mode</h2><span className="text-[11px] text-muted tabular-nums">{stations.length} trạm</span></div>
      <button className="mt-2 text-[12px] text-brand md:hidden" aria-expanded={filtersOpen} onClick={()=>setFiltersOpen(!filtersOpen)}>{filtersOpen?'Thu gọn bộ lọc':'Tìm & lọc trạm'}</button>
      <div className={filtersOpen?'':'max-md:hidden'}>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">Khám phá từng đơn vị, hiểu mối liên kết trong tổ chức.</p>
      <label className="mt-4 block text-[12px] text-muted">Dữ liệu
        <select aria-label="Dữ liệu Journey" value={state.journeyDataset} onChange={e=>state.setJourneyDataset(e.target.value as 'current'|'sample')} className="journey-input mt-1.5">
          <option value="current">Cơ cấu đang làm việc</option><option value="sample">Doanh nghiệp mẫu · minh họa</option>
        </select>
      </label>
      <label className="mt-3 block"><span className="sr-only">Tìm đơn vị trong Journey</span><input aria-label="Tìm đơn vị trong Journey" className="journey-input" placeholder="Tìm trạm, tên hoặc mã đơn vị…" value={state.searchQuery} onChange={e=>state.setQuery(e.target.value)}/></label>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-[11px] text-muted">Cụm đơn vị<select aria-label="Cụm đơn vị Journey" value={state.journeyClusterId} onChange={e=>state.setJourneyCluster(e.target.value)} className="journey-input mt-1.5"><option value="">Tất cả cụm</option>{clusters.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
        <label className="text-[11px] text-muted">Cấp tổ chức<select aria-label="Cấp tổ chức Journey" value={state.journeyLayer??''} onChange={e=>state.setJourneyLayer(e.target.value===''?null:Number(e.target.value))} className="journey-input mt-1.5"><option value="">Tất cả cấp</option>{levels.map(level=><option key={level} value={level}>Layer {level} · cấp {level+1}</option>)}</select></label>
      </div>
      <label className="mt-3 block text-[12px] text-muted">Đi đến trạm<select aria-label="Đi đến trạm" className="journey-input mt-1.5" value={current?.id??''} onChange={e=>state.jumpToStation(e.target.value)} disabled={!stations.length}>{!stations.length&&<option value="">Không có trạm phù hợp</option>}{stations.map((u,i)=><option key={u.id} value={u.id}>{String(i+1).padStart(2,'0')}. {u.name}</option>)}</select></label>
      {!stations.length&&<div className="mt-3 text-[13px] text-muted">Không tìm thấy trạm. <button className="text-brand underline" onClick={state.clearFilters}>Xóa bộ lọc</button></div>}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3 text-[11px] text-muted"><span>{state.journeyDataset==='sample'?'Dữ liệu minh họa':'Dữ liệu trong phiên'}</span><button className="text-brand" onClick={()=>state.setDetailOpen(!state.detailOpen)}>{state.detailOpen?'Ẩn hồ sơ':'Mở hồ sơ'}</button></div>
      </div>
      <button className="mt-2 ml-4 text-[12px] text-brand md:hidden" onClick={()=>state.setDetailOpen(true)}>Mở hồ sơ đơn vị</button>
    </section>
    <nav className="journey-player floating absolute right-[calc(var(--inset-r)+16px)] bottom-4 left-[calc(var(--inset-l)+16px)] z-10 px-5 py-4 max-md:right-3 max-md:bottom-3 max-md:left-3" aria-label="Chuyển trạm Journey">
      <div className="mb-3 flex items-center justify-between gap-3"><span className="text-[12px] font-medium text-muted">{current?`Trạm ${String(index+1).padStart(2,'0')} / ${stations.length}`:'Chưa có trạm'}</span><button className="text-[12px] text-brand" onClick={()=>state.command('journey')}>Định vị trạm</button></div>
      <div className="journey-progress mb-4 h-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="Tiến trình khám phá" aria-valuemin={0} aria-valuemax={stations.length||1} aria-valuenow={index+1}><span style={{width:`${stations.length?(index+1)/stations.length*100:0}%`}}/></div>
      <div className="flex items-center justify-between gap-3"><button className="btn-secondary" aria-label="Trạm trước" disabled={index<=0} onClick={()=>state.stepJourney(-1)}>Trạm trước</button><span className="min-w-0 truncate text-center text-[13px] font-medium max-md:hidden">{current?.name??'Điều chỉnh bộ lọc'}</span><button className="btn-primary" aria-label="Trạm tiếp theo" disabled={index<0||index>=stations.length-1} onClick={()=>state.stepJourney(1)}>Trạm tiếp theo</button></div>
    </nav>
  </>;
}
