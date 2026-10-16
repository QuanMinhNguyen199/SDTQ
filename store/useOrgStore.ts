import { create } from 'zustand';
import { initialUnits, ancestors, descendants, normalize, validateUnits } from '../src/data.js';
import type { OrgUnit } from '../data/orgData.ts';
import { floorDestination, floorRooms, unitPath } from '../data/explore.ts';
import { isExploreEnabled } from './features.ts';

export type ExperienceMode = 'organization' | 'explore';
export type ExplorePhase = 'room' | 'hall' | 'boarding' | 'building' | 'travelling' | 'opening';
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
  experienceMode: ExperienceMode; organizationSnapshot: Snapshot | null;
  exploreBranchId: string; exploreRoomId: string | null; exploreDepth: number; explorePhase: ExplorePhase; explorePendingDepth: number | null; exploreTransition: number; exploreLookActive: boolean;
  command: (type:string)=>void; notify:(message:string)=>void; setHovered:(id:string|null)=>void; setQuery:(query:string)=>void;
  setTab:(tab:DetailTab)=>void; setView:(view:View)=>void; setTheme:(theme:Theme)=>void; setEditor:(editor:Editor|null)=>void; setImportError:(message:string)=>void;
  toggleType:(type:string)=>void; clearFilters:()=>void; setTreeOpen:(open:boolean)=>void; setDetailOpen:(open:boolean)=>void;
  select:(id:string, options?:{locate?:boolean})=>void; dismiss:()=>void; toggle:(id:string)=>void; expandToLevel:(level:number)=>void;
  collapseAll:()=>void; focusBranch:(id:string)=>void; clearFocus:()=>void; saveUnit:(unit:OrgUnit)=>void; replaceUnits:(units:OrgUnit[],source:Source)=>void; markExported:()=>void; failWebGL:()=>void;
  setExperienceMode:(mode:ExperienceMode)=>void;
  setExploreLookActive:(active:boolean)=>void; exploreWalkRoom:(id:string|null)=>void;
  exploreLocate:(id:string)=>void; exploreHall:()=>void; exploreRoot:()=>void;
  exploreElevator:()=>void; exploreChooseFloor:(depth:number,parentId?:string)=>void; exploreCancelElevator:()=>void;
  exploreFinish:(phase:ExplorePhase,token:number)=>void;
}

const rootId = initialUnits.find(u => !u.parentId)!.id;
const width = () => typeof window === 'undefined' ? 1440 : window.innerWidth;
const readTheme = ():Theme => { try { return localStorage.getItem('sdtq-theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } };
// Both experiences share this one store; the classic state is restored on return.
export const useOrgStore = create<OrgState>((set,get)=> {
  return {
    units:initialUnits as OrgUnit[],source:'reference',activeDeptId:rootId,hoveredDeptId:null,expanded:new Set([rootId]),focusId:null,
    searchQuery:'',typeFilter:new Set(),view:width()<768?'list':'3d',theme:readTheme(),tab:'overview',detailOpen:width()>=768,treeOpen:width()>=1200,
    editor:null,dirty:false,notice:'',importError:'',webglFailed:false,camera:{type:'initial',tick:0},
    experienceMode:'organization',organizationSnapshot:null,
    exploreBranchId:rootId,exploreRoomId:rootId,exploreDepth:0,explorePhase:'room',explorePendingDepth:null,exploreTransition:0,exploreLookActive:false,
    command:type=>set(s=>({camera:{type,tick:s.camera.tick+1}})),
    notify:notice=>set({notice}),
    setHovered:hoveredDeptId=>{if(get().hoveredDeptId!==hoveredDeptId)set({hoveredDeptId});},
    setQuery:searchQuery=>set({searchQuery}),
    setTab:tab=>set({tab}),
    setView:view=>set(s=>({view,hoveredDeptId:null,webglFailed:view==='3d'?false:s.webglFailed,...(view==='3d'&&{notice:'',camera:{type:'initial',tick:s.camera.tick+1}})})),
    setTheme:theme=>set({theme}),setEditor:editor=>set({editor}),setImportError:importError=>set({importError}),
    toggleType:type=>{set(s=>{const types=new Set(s.typeFilter);types.has(type)?types.delete(type):types.add(type);return {typeFilter:types};});},
    clearFilters:()=>set({typeFilter:new Set(),searchQuery:''}),
    setTreeOpen:treeOpen=>set(s=>({treeOpen,detailOpen:treeOpen&&width()<1200?false:s.detailOpen})),
    setDetailOpen:detailOpen=>set(s=>({detailOpen,treeOpen:detailOpen&&width()<1200?false:s.treeOpen})),
    // Bấm vùng trống hoặc Escape: bỏ chọn, tắt hover và đóng hồ sơ; dữ liệu và nhánh đang mở giữ nguyên.
    dismiss:()=>set({activeDeptId:null,hoveredDeptId:null,detailOpen:false}),
    select:(id,{locate=false}={})=>{
      if(get().experienceMode==='explore'){get().exploreLocate(id);return;}
      const {units,focusId}=get();if(!units.some(u=>u.id===id))return;
      const keepFocus=focusId&&(id===focusId||descendants(units,focusId).has(id));
      set(s=>({activeDeptId:id,expanded:new Set([...s.expanded,...ancestors(units,id).slice(0,-1).map((u:OrgUnit)=>u.id)]),focusId:keepFocus?focusId:null}));
      get().setDetailOpen(true);if(locate)get().command('locate');
    },
    toggle:id=>{
      const {units,expanded,activeDeptId}=get();const next=new Set(expanded);
      if(next.has(id)){next.delete(id);if(activeDeptId&&descendants(units,id).has(activeDeptId))set({activeDeptId:id,notice:'Đã thu gọn nhánh.'});}else next.add(id);
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
      set(s=>({units:next,activeDeptId:value.id,editor:null,dirty:true,source:s.source==='reference'?'edited':s.source,expanded:new Set([...s.expanded,...ancestors(next,value.id).map((u:OrgUnit)=>u.id)]),notice:'Đã lưu thay đổi.'}));get().setDetailOpen(true);get().command('fit');
    },
    replaceUnits:(units,source)=>{
      if(get().experienceMode==='explore')get().setExperienceMode('organization');
      const roots=units.filter(u=>!u.parentId);
      set({units,source,activeDeptId:roots[0].id,expanded:new Set(roots.map(u=>u.id)),focusId:null,searchQuery:'',typeFilter:new Set(),dirty:false,importError:'',hoveredDeptId:null,notice:`Đã nhập ${units.length} đơn vị.`});get().setDetailOpen(true);get().command('fit');
    },
    markExported:()=>set({dirty:false,notice:'Đã xuất dữ liệu.'}),
    failWebGL:()=>{
      const s=get();if(s.webglFailed)return;
      set({...s.organizationSnapshot,organizationSnapshot:null,experienceMode:'organization',webglFailed:true,view:'2d',hoveredDeptId:null,notice:'Không mở được 3D. Đã chuyển sang 2D.'});
    },
    setExperienceMode:mode=>{
      const s=get();if(mode===s.experienceMode)return;
      if(mode==='explore'&&!isExploreEnabled())return; // Explore chỉ mở ở localhost
      if(mode==='explore'){
        const snapshot:Snapshot={view:s.view,activeDeptId:s.activeDeptId,expanded:new Set(s.expanded),focusId:s.focusId,treeOpen:s.treeOpen,detailOpen:s.detailOpen,searchQuery:s.searchQuery,typeFilter:new Set(s.typeFilter),tab:s.tab};
        const id=s.units.some(u=>u.id===s.activeDeptId)?s.activeDeptId!:s.units[0].id;
        set({experienceMode:mode,organizationSnapshot:snapshot,view:'3d',webglFailed:false,treeOpen:false,detailOpen:false,searchQuery:'',typeFilter:new Set(),hoveredDeptId:null,tab:'overview'});
        get().exploreLocate(id);
      }else{
        set({...s.organizationSnapshot,experienceMode:mode,organizationSnapshot:null,hoveredDeptId:null,view:s.webglFailed?'2d':s.organizationSnapshot?.view??'3d',camera:{type:'initial',tick:s.camera.tick+1},explorePendingDepth:null,exploreTransition:s.exploreTransition+1});
      }
    },
    setExploreLookActive:exploreLookActive=>{const s=get();if(s.exploreLookActive!==exploreLookActive||exploreLookActive&&s.detailOpen)set({exploreLookActive,...(exploreLookActive?{detailOpen:false}:{})});},
    exploreWalkRoom:id=>{
      const s=get();if(s.experienceMode!=='explore'||!['room','hall'].includes(s.explorePhase)||s.exploreRoomId===id)return;
      if(id&&!floorRooms(s.units,s.exploreBranchId,s.exploreDepth).some(unit=>unit.id===id))return;
      if(id)set({exploreBranchId:id,exploreRoomId:id,activeDeptId:id,explorePhase:'room',detailOpen:true,tab:'overview'});
      else set({exploreRoomId:null,explorePhase:'hall',detailOpen:false});
    },
    exploreLocate:id=>{
      const s=get(),path=unitPath(s.units,id);if(!path.length)return;
      set({exploreBranchId:id,exploreRoomId:id,activeDeptId:id,exploreDepth:path.length-1,explorePhase:'room',explorePendingDepth:null,exploreTransition:s.exploreTransition+1,detailOpen:false,hoveredDeptId:null,tab:'overview',searchQuery:''});
    },
    exploreHall:()=>set(s=>({exploreRoomId:null,explorePhase:'hall',exploreTransition:s.exploreTransition+1,detailOpen:false})),
    exploreRoot:()=>{const s=get();const root=unitPath(s.units,s.exploreBranchId)[0];if(root)get().exploreLocate(root.id);},
    exploreElevator:()=>{
      const s=get();if(!['room','hall'].includes(s.explorePhase))return;
      set({explorePhase:'boarding',explorePendingDepth:null,detailOpen:false,exploreTransition:s.exploreTransition+1});
    },
    exploreChooseFloor:(depth,parentId)=>{
      const s=get();if(s.explorePhase!=='building')return;
      const destination=floorDestination(s.units,s.exploreBranchId,depth,parentId);if(!destination)return;
      const path=unitPath(s.units,destination);
      set({exploreBranchId:destination,activeDeptId:path[Math.max(0,depth-1)]?.id??path[0].id,explorePendingDepth:depth,explorePhase:'travelling',exploreTransition:s.exploreTransition+1});
    },
    exploreCancelElevator:()=>{
      const s=get();if(!['building','boarding'].includes(s.explorePhase))return;
      set({explorePhase:'opening',explorePendingDepth:null,exploreTransition:s.exploreTransition+1});
    },
    exploreFinish:(phase,token)=>{
      const s=get();if(s.experienceMode!=='explore'||s.explorePhase!==phase||s.exploreTransition!==token)return;
      if(phase==='room')set({detailOpen:true});
      if(phase==='boarding')set({explorePhase:'building',exploreTransition:token+1});
      if(phase==='travelling'&&s.explorePendingDepth!==null)set({exploreDepth:s.explorePendingDepth,explorePendingDepth:null,exploreRoomId:null,explorePhase:'opening',exploreTransition:token+1});
      if(phase==='opening')set({exploreRoomId:null,explorePhase:'hall',exploreTransition:token+1});
    },
  };
});
export const unitTypes = ['Ban','Vụ','Cục','Văn phòng','Phòng'];
