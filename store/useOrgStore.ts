import { create } from 'zustand';
import { initialUnits, ancestors, descendants, normalize, validateUnits } from '../src/data.js';
import { orderedStations, sampleUnits, type OrgUnit, type Station } from '../data/orgData.ts';

export type ExperienceMode = 'organization' | 'journey';
export type View = '3d' | '2d' | 'list';
export type Theme = 'light' | 'dark';
export type DetailTab = 'overview' | 'duties' | 'authorities' | 'children';
export type Source = 'reference' | 'edited' | 'import';
export type CameraCommand = { type: string; tick: number };
type Editor = { mode:'add'; parentId:string } | { mode:'edit'; unit:OrgUnit };
type Snapshot = Pick<OrgState, 'view' | 'activeDeptId' | 'expanded' | 'focusId' | 'treeOpen' | 'detailOpen' | 'searchQuery' | 'typeFilter' | 'tab'>;
export interface OrgState {
  units: OrgUnit[]; source: Source; activeDeptId: string | null; hoveredDeptId: string | null;
  expanded: Set<string>; focusId: string | null; searchQuery: string; typeFilter: Set<string>;
  view: View; theme: Theme; tab: DetailTab; detailOpen: boolean; treeOpen: boolean;
  editor: Editor | null; dirty: boolean; notice: string; importError: string; webglFailed: boolean; camera: CameraCommand;
  experienceMode: ExperienceMode; journeyDataset: 'current' | 'sample'; journeyClusterId: string; journeyLayer: number | null; organizationSnapshot: Snapshot | null;
  command: (type:string)=>void; notify:(message:string)=>void; setHovered:(id:string|null)=>void; setQuery:(query:string)=>void;
  setTab:(tab:DetailTab)=>void; setView:(view:View)=>void; setTheme:(theme:Theme)=>void; setEditor:(editor:Editor|null)=>void; setImportError:(message:string)=>void;
  toggleType:(type:string)=>void; clearFilters:()=>void; setTreeOpen:(open:boolean)=>void; setDetailOpen:(open:boolean)=>void;
  select:(id:string, options?:{locate?:boolean})=>void; toggle:(id:string)=>void; expandToLevel:(level:number)=>void;
  collapseAll:()=>void; focusBranch:(id:string)=>void; clearFocus:()=>void; saveUnit:(unit:OrgUnit)=>void; replaceUnits:(units:OrgUnit[],source:Source)=>void; markExported:()=>void; failWebGL:()=>void;
  setExperienceMode:(mode:ExperienceMode)=>void; setJourneyDataset:(dataset:'current'|'sample')=>void;
  setJourneyCluster:(id:string)=>void; setJourneyLayer:(layer:number|null)=>void; jumpToStation:(id:string,openDetails?:boolean)=>void; stepJourney:(delta:number)=>void;
}

const rootId = initialUnits.find(u => !u.parentId)!.id;
const width = () => typeof window === 'undefined' ? 1440 : window.innerWidth;
const readTheme = ():Theme => { try { return localStorage.getItem('sdtq-theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } };
export function journeyUnits(state:Pick<OrgState,'units'|'journeyDataset'>):OrgUnit[] { return state.journeyDataset === 'sample' ? sampleUnits : state.units; }
export function journeyStations(state:Pick<OrgState,'units'|'journeyDataset'|'searchQuery'|'typeFilter'|'journeyClusterId'|'journeyLayer'>):Station[] {
  const query = normalize(state.searchQuery.trim());
  return orderedStations(journeyUnits(state)).filter(u =>
    (!query || normalize(`${u.name} ${u.code}`).includes(query)) &&
    (!state.typeFilter.size || state.typeFilter.has(u.type)) &&
    (!state.journeyClusterId || u.clusterId === state.journeyClusterId) &&
    (state.journeyLayer === null || u.depth === state.journeyLayer));
}

// Both experiences share this one store; the classic state is restored on return.
export const useOrgStore = create<OrgState>((set,get)=> {
  const alignJourney = () => {
    const s=get(); if(s.experienceMode!=='journey') return;
    const stations=journeyStations(s);
    if(!stations.some(u=>u.id===s.activeDeptId)) set({activeDeptId:stations[0]?.id??null,hoveredDeptId:null});
  };
  return {
    units:initialUnits as OrgUnit[],source:'reference',activeDeptId:rootId,hoveredDeptId:null,expanded:new Set([rootId]),focusId:null,
    searchQuery:'',typeFilter:new Set(),view:width()<768?'list':'3d',theme:readTheme(),tab:'overview',detailOpen:width()>=768,treeOpen:width()>=1200,
    editor:null,dirty:false,notice:'',importError:'',webglFailed:false,camera:{type:'initial',tick:0},
    experienceMode:'organization',journeyDataset:'current',journeyClusterId:'',journeyLayer:null,organizationSnapshot:null,
    command:type=>set(s=>({camera:{type,tick:s.camera.tick+1}})),
    notify:notice=>set({notice}),
    setHovered:hoveredDeptId=>{if(get().hoveredDeptId!==hoveredDeptId)set({hoveredDeptId});},
    setQuery:searchQuery=>{set({searchQuery});alignJourney();},
    setTab:tab=>set({tab}),
    setView:view=>set(s=>({view,hoveredDeptId:null,webglFailed:view==='3d'?false:s.webglFailed,...(view==='3d'&&{notice:'',camera:{type:'initial',tick:s.camera.tick+1}})})),
    setTheme:theme=>set({theme}),setEditor:editor=>set({editor}),setImportError:importError=>set({importError}),
    toggleType:type=>{set(s=>{const types=new Set(s.typeFilter);types.has(type)?types.delete(type):types.add(type);return {typeFilter:types};});alignJourney();},
    clearFilters:()=>{set({typeFilter:new Set(),searchQuery:'',journeyClusterId:'',journeyLayer:null});alignJourney();},
    setTreeOpen:treeOpen=>set(s=>({treeOpen,detailOpen:treeOpen&&width()<1200?false:s.detailOpen})),
    setDetailOpen:detailOpen=>set(s=>({detailOpen,treeOpen:detailOpen&&width()<1200?false:s.treeOpen})),
    select:(id,{locate=false}={})=>{
      if(get().experienceMode==='journey'){get().jumpToStation(id);return;}
      const {units,focusId}=get();if(!units.some(u=>u.id===id))return;
      const keepFocus=focusId&&(id===focusId||descendants(units,focusId).has(id));
      set(s=>({activeDeptId:id,expanded:new Set([...s.expanded,...ancestors(units,id).slice(0,-1).map((u:OrgUnit)=>u.id)]),focusId:keepFocus?focusId:null}));
      get().setDetailOpen(true);if(locate)get().command('locate');
    },
    toggle:id=>{
      const {units,expanded,activeDeptId}=get();const next=new Set(expanded);
      if(next.has(id)){next.delete(id);if(activeDeptId&&descendants(units,id).has(activeDeptId))set({activeDeptId:id,notice:'Đã thu gọn nhánh và chọn đơn vị cha.'});}else next.add(id);
      set({expanded:next});get().command('fit');
    },
    expandToLevel:level=>{
      const {units,activeDeptId}=get();const path=ancestors(units,activeDeptId);
      set({expanded:new Set(units.filter(u=>ancestors(units,u.id).length<level).map(u=>u.id)),focusId:null,activeDeptId:path.length>level?path[level-1].id:activeDeptId});get().command('fit');
    },
    collapseAll:()=>{const roots=get().units.filter(u=>!u.parentId);set({expanded:new Set(roots.map(u=>u.id)),activeDeptId:roots[0].id,focusId:null,searchQuery:''});get().command('fit');},
    focusBranch:id=>{set(s=>({focusId:id,expanded:new Set([...s.expanded,id])}));if(width()<768)set({detailOpen:false});get().command('fit');},
    clearFocus:()=>{set({focusId:null});get().command('fit');},
    saveUnit:value=>{
      const {units,editor}=get();if(!editor)return;
      const next=validateUnits(editor.mode==='add'?[...units,value]:units.map(u=>u.id===value.id?value:u)) as OrgUnit[];
      set(s=>({units:next,activeDeptId:value.id,editor:null,dirty:true,source:s.source==='reference'?'edited':s.source,expanded:new Set([...s.expanded,...ancestors(next,value.id).map((u:OrgUnit)=>u.id)]),notice:'Đã cập nhật bản làm việc. Xuất JSON để lưu thành file.'}));get().setDetailOpen(true);get().command('fit');
    },
    replaceUnits:(units,source)=>{
      if(get().experienceMode==='journey')get().setExperienceMode('organization');
      const roots=units.filter(u=>!u.parentId);
      set({units,source,activeDeptId:roots[0].id,expanded:new Set(roots.map(u=>u.id)),focusId:null,searchQuery:'',typeFilter:new Set(),dirty:false,importError:'',hoveredDeptId:null,notice:`Đã nhập ${units.length} đơn vị.`});get().setDetailOpen(true);get().command('fit');
    },
    markExported:()=>set({dirty:false,notice:'Đã xuất dữ liệu JSON. Hãy giữ file để mở lại phiên làm việc.'}),
    failWebGL:()=>{
      const s=get();if(s.webglFailed)return;
      set({...s.organizationSnapshot,organizationSnapshot:null,experienceMode:'organization',webglFailed:true,view:'2d',hoveredDeptId:null,notice:'Thiết bị không mở được 3D. Đã chuyển sang sơ đồ 2D.'});
    },
    setExperienceMode:mode=>{
      const s=get();if(mode===s.experienceMode)return;
      if(mode==='journey'){
        const snapshot:Snapshot={view:s.view,activeDeptId:s.activeDeptId,expanded:new Set(s.expanded),focusId:s.focusId,treeOpen:s.treeOpen,detailOpen:s.detailOpen,searchQuery:s.searchQuery,typeFilter:new Set(s.typeFilter),tab:s.tab};
        const data=journeyUnits(s);
        set({experienceMode:mode,organizationSnapshot:snapshot,view:'3d',webglFailed:false,treeOpen:false,detailOpen:width()>=768,searchQuery:'',typeFilter:new Set(),journeyClusterId:'',journeyLayer:null,hoveredDeptId:null,activeDeptId:data.some(u=>u.id===s.activeDeptId)?s.activeDeptId:data[0]?.id??null,tab:'overview',camera:{type:'journey',tick:s.camera.tick+1}});
      }else{
        set({...s.organizationSnapshot,experienceMode:mode,organizationSnapshot:null,hoveredDeptId:null,view:s.webglFailed?'2d':s.organizationSnapshot?.view??'3d',camera:{type:'initial',tick:s.camera.tick+1}});
      }
    },
    setJourneyDataset:journeyDataset=>{set({journeyDataset,searchQuery:'',typeFilter:new Set(),journeyClusterId:'',journeyLayer:null,activeDeptId:journeyDataset==='sample'?sampleUnits[0].id:get().units[0].id,hoveredDeptId:null,tab:'overview'});get().command('journey');},
    setJourneyCluster:journeyClusterId=>{set({journeyClusterId});alignJourney();},
    setJourneyLayer:journeyLayer=>{set({journeyLayer});alignJourney();},
    jumpToStation:(id,openDetails=false)=>{
      const unit=journeyUnits(get()).find(u=>u.id===id);if(!unit)return;
      if(!journeyStations(get()).some(u=>u.id===id))get().clearFilters();
      set(s=>({activeDeptId:id,hoveredDeptId:null,detailOpen:openDetails||width()>=768||s.detailOpen,tab:'overview',camera:{type:'journey',tick:s.camera.tick+1}}));
    },
    stepJourney:delta=>{
      const s=get(),stations=journeyStations(s),index=stations.findIndex(u=>u.id===s.activeDeptId);
      const next=index+delta;if(next>=0&&next<stations.length)get().jumpToStation(stations[next].id);
    },
  };
});
export const unitTypes = ['Ban','Vụ','Cục','Văn phòng','Phòng'];
