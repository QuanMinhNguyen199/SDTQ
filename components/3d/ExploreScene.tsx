'use client';
import { Component, memo, Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Html, RoundedBox } from '@react-three/drei';
import { useShallow } from 'zustand/react/shallow';
import { useReducedMotion } from 'motion/react';
import { Euler, Quaternion, Vector3, type Group, type PerspectiveCamera, type WebGLRenderer } from 'three';
import { useOrgStore, type ExplorePhase } from '../../store/useOrgStore';
import { floorDestination, buildingDepth, floorName, floorRooms, floorY, roomPosition, unitPath } from '../../data/explore';
import { moveOnFloor, nearElevator, roomAt, WALK_SPEED } from '../../data/exploreMovement';
import type { OrgUnit } from '../../data/orgData';

type Portal = RefObject<HTMLElement>;
type Point = [number,number,number];

class Boundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){useOrgStore.getState().failWebGL();}
  render(){return this.state.failed?null:this.props.children;}
}

export default memo(function ExploreScene() {
  const state=useOrgStore(useShallow(s=>({units:s.units,theme:s.theme,outside:['building','travelling'].includes(s.explorePhase)})));
  const maxDepth=useMemo(()=>buildingDepth(state.units),[state.units]);
  const portal=useRef<HTMLDivElement>(null);
  const listener=useRef<{canvas:HTMLCanvasElement;handler:(event:Event)=>void}|null>(null);
  const mounted=useRef(true);
  const outside=state.outside;
  useEffect(()=>{
    mounted.current=true;
    return()=>{mounted.current=false;const current=listener.current;if(current)current.canvas.removeEventListener('webglcontextlost',current.handler);};
  },[]);
  function created({gl}:{gl:WebGLRenderer}) {
    const handler=(event:Event)=>{
      if(!mounted.current||useOrgStore.getState().experienceMode!=='explore')return;
      event.preventDefault();useOrgStore.getState().failWebGL();
    };
    gl.domElement.addEventListener('webglcontextlost',handler);listener.current={canvas:gl.domElement,handler};
  }
  return <Boundary>
    <div ref={portal} className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"/>
    <Canvas className="three-host explore-canvas" frameloop="demand" dpr={[1,1.5]} camera={{fov:62,near:.08,far:500,position:[9,floorY(0,maxDepth)+1.7,0]}} gl={{antialias:true,powerPreference:'high-performance'}} onCreated={created}>
      <color attach="background" args={[state.theme==='dark'?'#08192E':'#E9EEF3']}/>
      <ambientLight intensity={1.15}/>
      <directionalLight position={[12,32,18]} intensity={2.1}/>
      <Suspense fallback={null}><Environment files={`${process.env.NEXT_PUBLIC_BASE_PATH||''}/environments/potsdamer_platz_1k.hdr`} environmentIntensity={.35}/></Suspense>
      {outside?<Building maxDepth={maxDepth} portal={portal as Portal}/>:<Interior maxDepth={maxDepth} portal={portal as Portal}/>}
      <ExploreCamera maxDepth={maxDepth}/>
    </Canvas>
  </Boundary>;
});

function Box({at,size,color,metal=0}:{at:Point;size:Point;color:string;metal?:number}) {
  return <mesh position={at}><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={metal ? .38 : .8} metalness={metal}/></mesh>;
}

function Building({maxDepth,portal}:{maxDepth:number;portal:Portal}) {
  const state=useOrgStore(useShallow(s=>({units:s.units,theme:s.theme,exploreBranchId:s.exploreBranchId,exploreDepth:s.exploreDepth,explorePendingDepth:s.explorePendingDepth,explorePhase:s.explorePhase,exploreChooseFloor:s.exploreChooseFloor})));
  const pathDepth=state.explorePendingDepth??state.exploreDepth;
  const depthSize=46;
  const dark=state.theme==='dark';
  return <>
    <mesh rotation-x={-Math.PI/2} position={[0,-.6,-6]}><planeGeometry args={[250,250]}/><meshStandardMaterial color={dark?'#0B2035':'#DAE2E9'} roughness={1}/></mesh>
    <Box at={[0,(maxDepth*7+5)/2,13]} size={[5,maxDepth*7+6,5]} color={dark?'#1D3D59':'#A6B6C4'} metal={.45}/>
    {Array.from({length:maxDepth+1},(_,depth)=>{
      const destination=floorDestination(state.units,state.exploreBranchId,depth);
      const y=floorY(depth,maxDepth),enabled=destination!==null,active=depth===pathDepth;
      const rooms=floorRooms(state.units,destination??state.exploreBranchId,depth);
      return <group key={depth} position={[0,y,0]}>
        <mesh onClick={e=>{e.stopPropagation();if(enabled)state.exploreChooseFloor(depth);}}>
          <boxGeometry args={[28,.4,depthSize]}/><meshPhysicalMaterial color={active?'#BF0D3E':dark?'#24435F':'#F7F9FB'} roughness={.48} metalness={.12} transparent opacity={enabled?1:.32}/>
        </mesh>
        <Box at={[0,1.7,-12]} size={[25,3.2,19]} color={dark?'#173149':'#C6D3DF'}/>
        <Box at={[0,1.7,-2.3]} size={[24,2.1,.12]} color={active?'#F8D4DF':'#6D8FA5'} metal={.35}/>
        <Box at={[0,3.5,-8]} size={[28,.18,34]} color={dark?'#38516A':'#D9E2E9'}/>
        <Html portal={portal} center position={[0,1.6,19]} zIndexRange={[15,0]}>
          <button className={`explore-floor-label pointer-events-auto max-md:hidden rounded-lg border px-4 py-2 text-left text-[12px] shadow-sm ${active?'border-brand bg-brand-soft text-brand':'border-line bg-surface text-ink'}`} disabled={!enabled||state.explorePhase!=='building'} onClick={()=>state.exploreChooseFloor(depth)} aria-label={`Chọn ${floorName(depth,maxDepth)}`}>
            <strong className="block font-display">{floorName(depth,maxDepth)}</strong><span className="mt-1 block text-[11px] text-muted">{enabled?`${rooms.length} đơn vị trong nhánh`:'Chọn đơn vị cha trong bảng tầng'}</span>
          </button>
        </Html>
      </group>;
    })}
    <Box at={[0,floorY(pathDepth,maxDepth)+1.6,14]} size={[3.5,3,2]} color="#BF0D3E" metal={.45}/>
  </>;
}

function Interior({maxDepth,portal}:{maxDepth:number;portal:Portal}) {
  const state=useOrgStore(useShallow(s=>({units:s.units,theme:s.theme,exploreDepth:s.exploreDepth})));
  const scopeId=useOrgStore(s=>{const path=unitPath(s.units,s.exploreBranchId);return path[Math.max(0,s.exploreDepth-1)]?.id;});
  const rooms=useMemo(()=>state.units.filter(unit=>state.exploreDepth===0?unit.id===scopeId:unit.parentId===scopeId),[state.units,state.exploreDepth,scopeId]);
  const dark=state.theme==='dark';
  const length=Math.max(20,Math.ceil(rooms.length/2)*5.2+12);
  const floorColor=dark?'#142E43':'#DCE3E8',wallColor=dark?'#25425B':'#F0F3F5';
  return <group position={[0,floorY(state.exploreDepth,maxDepth),0]}>
    <Box at={[0,-.16,8-length/2]} size={[28,.3,length+8]} color={floorColor}/>
    <Box at={[0,4.2,8-length/2]} size={[28,.2,length+8]} color={wallColor}/>
    <Box at={[0,2,-length+8]} size={[28,4,.3]} color={wallColor}/>
    <Box at={[0,.015,6-length/2]} size={[.07,.025,length-5]} color="#BF0D3E"/>
    <Box at={[-8,2,10.5]} size={[12,4,.3]} color={wallColor}/>
    <Box at={[8,2,10.5]} size={[12,4,.3]} color={wallColor}/>
    {Array.from({length:Math.ceil(length/6)},(_,i)=><group key={i}>
      <Box at={[0,4.04,5-i*6]} size={[.5,.035,2.8]} color={dark?'#BBCFDD':'#FFFFFF'}/>
      <pointLight position={[0,3.5,5-i*6]} intensity={12} distance={10} decay={2} color={dark?'#CDE1F3':'#FFF4E2'}/>
    </group>)}
    {rooms.map((unit,index)=><RoomDoor key={unit.id} unit={unit} index={index} portal={portal} wallColor={wallColor} dark={dark}/>)}
    <Elevator portal={portal}/>

  </group>;
}


function Elevator({portal}:{portal:Portal}) {
  const state=useOrgStore(useShallow(s=>({explorePhase:s.explorePhase,exploreElevator:s.exploreElevator})));
  const interactive=['hall','room'].includes(state.explorePhase);
  return (
    <group position={[0,0,10]} onClick={event=>{event.stopPropagation();if(interactive)state.exploreElevator();}}>
      <Box at={[-2,1.9,1]} size={[.25,3.8,3]} color="#5C7181" metal={.65}/>
      <Box at={[2,1.9,1]} size={[.25,3.8,3]} color="#5C7181" metal={.65}/>
      <Box at={[0,1.9,3]} size={[4,3.8,.2]} color="#8193A1" metal={.65}/>
      <Box at={[0,3.8,1.5]} size={[4,.2,3]} color="#DFE6EC"/>
      <ElevatorDoors phase={state.explorePhase}/>
      <Html portal={portal} center position={[0,3.15,-.35]} zIndexRange={[12,0]}><button className="pointer-events-auto rounded border border-line bg-surface px-4 py-2 text-[12px] text-ink" disabled={!interactive} onClick={state.exploreElevator}>Thang máy</button></Html>
    </group>
  );
}

const RoomDoor=memo(function RoomDoor({unit,index,portal,wallColor,dark}:{unit:OrgUnit;index:number;portal:Portal;wallColor:string;dark:boolean}) {
  const state=useOrgStore(useShallow(s=>({inside:s.explorePhase==='room'&&s.exploreRoomId===unit.id,interactive:['hall','room'].includes(s.explorePhase),exploreLocate:s.exploreLocate,setDetailOpen:s.setDetailOpen,parentName:s.units.find(parent=>parent.id===unit.parentId)?.name})));
  const {side,z}=roomPosition(index);
  const {camera}=useThree();
  const [near,setNear]=useState(false);
  const nearRef=useRef(false);
  const {inside,interactive}=state;
  const open=inside||near;
  useFrame(()=>{const next=interactive&&Math.abs(camera.position.x-side*5)<2.3&&Math.abs(camera.position.z-z)<1.5;if(next!==nearRef.current){nearRef.current=next;setNear(next);}});
  return <group position={[side*5,0,z]} rotation-y={side>0?-Math.PI/2:Math.PI/2} onClick={event=>{event.stopPropagation();if(interactive&&!inside)state.exploreLocate(unit.id);}}>
    <Box at={[-1.65,2,0]} size={[.6,4,.25]} color={wallColor}/>
    <Box at={[1.65,2,0]} size={[.6,4,.25]} color={wallColor}/>
    <Box at={[0,3.55,0]} size={[2.7,.9,.25]} color={wallColor}/>
    <Box at={[-1.3,1.5,0]} size={[.12,3,.35]} color="#425B70" metal={.5}/>
    <Box at={[1.3,1.5,0]} size={[.12,3,.35]} color="#425B70" metal={.5}/>
    <DoorPanel open={open} dark={dark}/>
    <Box at={[0,1.8,-7]} size={[4,3.6,.2]} color={wallColor}/>
    <Box at={[-2,1.8,-3.5]} size={[.2,3.6,7]} color={wallColor}/>
    <Box at={[2,1.8,-3.5]} size={[.2,3.6,7]} color={wallColor}/>
    <RoundedBox position={[0,.8,-4.6]} args={[2.5,.14,1.2]} radius={.05} smoothness={2}><meshStandardMaterial color={dark?'#526A7E':'#A6886A'} roughness={.75}/></RoundedBox>
    <Box at={[0,.4,-4.6]} size={[1.8,.8,.65]} color={dark?'#1B354C':'#C3CDD5'}/>
    <Box at={[0,1.25,-4.8]} size={[.65,.4,.06]} color="#18324A" metal={.15}/>
    <Box at={[0,2.8,-6.85]} size={[2.4,.06,.04]} color="#BF0D3E"/>
    <Html portal={portal} occlude distanceFactor={12} center position={[0,3.15,.3]} zIndexRange={[14,0]}>
      <button className="explore-door-label pointer-events-auto w-[154px] rounded-md border border-line bg-surface px-3 py-2 text-center text-ink shadow-sm" disabled={!interactive} aria-label={`Vào ${unit.name}`} onClick={()=>state.exploreLocate(unit.id)}>
        <span className="mb-1 block text-[10px] text-muted">{unit.code||unit.type}</span><strong className="block font-display text-[12px] leading-snug">{unit.name}</strong><small className="mt-1 block text-[10px] leading-snug text-muted">{state.parentName?`Thuộc ${state.parentName}`:'Đơn vị gốc'}</small>
      </button>
    </Html>
    {inside&&<Html portal={portal} occlude center position={[0,2.4,-6.6]} zIndexRange={[15,0]}><button className="pointer-events-auto w-[230px] rounded-lg border border-line bg-surface px-4 py-3 text-center text-ink" onClick={()=>state.setDetailOpen(true)}><strong className="block font-display text-[15px]">{unit.name}</strong><span className="mt-2 block text-[12px] text-brand">Xem hồ sơ</span></button></Html>}
  </group>;
});

function DoorPanel({open,dark}:{open:boolean;dark:boolean}) {
  const door=useRef<Group>(null);
  const reduced=useReducedMotion();
  useFrame(({invalidate},dt)=>{
    if(!door.current)return;
    const target=open?-1.95:-1.2;
    door.current.position.x=reduced?target:door.current.position.x+(target-door.current.position.x)*(1-Math.exp(-8*Math.min(dt,.05)));
    const angle=open?-Math.PI*.46:0;
    door.current.rotation.y=reduced?angle:door.current.rotation.y+(angle-door.current.rotation.y)*(1-Math.exp(-8*Math.min(dt,.05)));
    if(Math.abs(door.current.position.x-target)>.002||Math.abs(door.current.rotation.y-angle)>.002)invalidate();
  });
  return <group ref={door} position={[-1.2,0,0]}><Box at={[1.2,1.5,0]} size={[2.4,3,.14]} color={dark?'#1B344B':'#24435B'}/><Box at={[2.15,1.4,.11]} size={[.05,.35,.06]} color="#D0D9DE" metal={.8}/><Box at={[1.2,2.65,.09]} size={[1.65,.045,.025]} color="#BF0D3E"/></group>;
}

function ElevatorDoors({phase}:{phase:ExplorePhase}) {
  const left=useRef<Group>(null),right=useRef<Group>(null);
  const progress=useRef(1);
  const elapsed=useRef(0);
  const reduced=useReducedMotion();
  useEffect(()=>{elapsed.current=0;if(phase==='opening')progress.current=0;},[phase]);
  useFrame(({invalidate},dt)=>{
    elapsed.current+=Math.min(dt,.05);
    const target=phase==='boarding'&&(reduced||elapsed.current>1.15)?0:1;
    if(reduced)progress.current=target;
    else progress.current+=(target-progress.current)*(1-Math.exp(-6*Math.min(dt,.05)));
    if(left.current)left.current.position.x=-.94-progress.current*1.85;
    if(right.current)right.current.position.x=.94+progress.current*1.85;
    if(Math.abs(progress.current-target)>.002||(phase==='boarding'&&elapsed.current<=1.15))invalidate();
  });
  return <><group ref={left}><Box at={[0,1.8,0]} size={[1.86,3.6,.12]} color="#91A3AF" metal={.7}/></group><group ref={right}><Box at={[0,1.8,0]} size={[1.86,3.6,.12]} color="#91A3AF" metal={.7}/></group></>;
}

function ExploreCamera({maxDepth}:{maxDepth:number}) {
  const state=useOrgStore(useShallow(s=>({units:s.units,explorePhase:s.explorePhase,exploreDepth:s.exploreDepth,explorePendingDepth:s.explorePendingDepth,exploreRoomId:s.exploreRoomId,exploreBranchId:s.exploreBranchId,exploreTransition:s.exploreTransition,camera:s.camera})));
  const {camera,gl,size,invalidate}=useThree();
  const reduced=!!useReducedMotion();
  const motion=useRef<{from:Vector3;to:Vector3;start:Quaternion;end:Quaternion;elapsed:number;duration:number;phase:ExplorePhase;token:number;done:boolean}|null>(null);
  const held=useRef(new Set<string>());
  const velocity=useRef(new Vector3());
  const lookActive=useRef(false);
  const touch=useRef<{x:number;y:number;id:number}|null>(null);
  const lookTarget=useRef<Quaternion|null>(null);
  const impulseUntil=useRef(0);
  const impulseDirection=useRef(0);
  const look=useMemo(()=>new Euler(0,0,0,'YXZ'),[]);
  useEffect(()=>{
    const phase=state.explorePhase;
    const depth=phase==='travelling'?state.explorePendingDepth??state.exploreDepth:state.exploreDepth;
    const y=floorY(depth,maxDepth);
    let eye=new Vector3(0,y+1.7,7),target=new Vector3(0,y+1.7,-10);
    if(phase==='building'){
      target=new Vector3(0,maxDepth*3.5,-6);
      const direction=new Vector3(43,maxDepth*7+25,54).sub(target);
      eye=target.clone().addScaledVector(direction,Math.max(1,1.15/(size.width/size.height)));
    }else if(['boarding','travelling','opening'].includes(phase)){
      eye=new Vector3(0,y+1.7,12);target=new Vector3(0,y+1.7,-10);
    }else if(phase==='room'&&state.exploreRoomId){
      const rooms=floorRooms(state.units,state.exploreBranchId,depth);
      const index=rooms.findIndex(u=>u.id===state.exploreRoomId);
      if(index>=0){const p=roomPosition(index);eye=new Vector3(p.side*7,y+1.7,p.z+.4);target=new Vector3(p.side*12,y+1.8,p.z-.2);}
    }
    const virtual=camera.clone();virtual.position.copy(eye);virtual.lookAt(target);
    motion.current={from:camera.position.clone(),to:eye,start:camera.quaternion.clone(),end:virtual.quaternion.clone(),elapsed:0,duration:reduced?0:phase==='travelling'?1.6:phase==='boarding'?1.65:phase==='opening'?1.1:1.05,phase,token:state.exploreTransition,done:false};
    invalidate();
  },[state.exploreTransition,maxDepth,reduced,camera,invalidate,size.width,size.height]);
  useEffect(()=>{
    const perspective=camera as PerspectiveCamera;
    const outside=['building','travelling'].includes(state.explorePhase);
    perspective.setViewOffset(size.width,size.height,0,outside&&size.width<768?85:0,size.width,size.height);
    perspective.updateProjectionMatrix();invalidate();
    return()=>perspective.clearViewOffset();
  },[camera,size.width,size.height,['building','travelling'].includes(state.explorePhase),invalidate]);
  useEffect(()=>{
    const canvas=gl.domElement;
    canvas.tabIndex=0;
    const ready=()=>{const current=useOrgStore.getState();return ['hall','room'].includes(current.explorePhase)&&motion.current?.done;};
    const clear=()=>{held.current.clear();velocity.current.set(0,0,0);impulseUntil.current=0;};
    const unlock=()=>{
      clear();lookActive.current=false;lookTarget.current=null;
      useOrgStore.getState().setExploreLookActive(false);
      if(document.pointerLockElement===canvas)document.exitPointerLock();
    };
    const syncLock=()=>{
      const active=document.pointerLockElement===canvas;
      lookActive.current=active;lookTarget.current=null;clear();
      look.setFromQuaternion(camera.quaternion,'YXZ');
      useOrgStore.getState().setExploreLookActive(active);
    };
    const activate=(event:MouseEvent)=>{
      if(document.pointerLockElement===canvas||lookActive.current){
        event.preventDefault();event.stopImmediatePropagation();unlock();return;
      }
      if(!ready())return;
      canvas.focus({preventScroll:true});look.setFromQuaternion(camera.quaternion,'YXZ');
      const fallback=()=>{if(!ready())return;lookActive.current=true;useOrgStore.getState().setExploreLookActive(true);};
      try{if(typeof canvas.requestPointerLock==='function')Promise.resolve(canvas.requestPointerLock()).catch(fallback);else fallback();}catch{fallback();}
    };
    const rotate=(dx:number,dy:number)=>{
      look.y-=dx*.0024;look.x=Math.max(-1.1,Math.min(1.1,look.x-dy*.0024));
      if(!lookTarget.current)lookTarget.current=new Quaternion();
      lookTarget.current.setFromEuler(look);invalidate();
    };
    const mouse=(event:MouseEvent)=>{
      if(!ready()||!lookActive.current)return;
      if(document.pointerLockElement===canvas||event.target===canvas)rotate(event.movementX,event.movementY);
    };
    const touchDown=(event:PointerEvent)=>{
      if(event.pointerType!=='touch'||!ready())return;
      look.setFromQuaternion(camera.quaternion,'YXZ');
      touch.current={x:event.clientX,y:event.clientY,id:event.pointerId};canvas.setPointerCapture(event.pointerId);
    };
    const touchMove=(event:PointerEvent)=>{
      const current=touch.current;if(!current||!ready())return;
      rotate(event.clientX-current.x,event.clientY-current.y);current.x=event.clientX;current.y=event.clientY;
    };
    const touchUp=()=>{touch.current=null;};
    const keyName=(key:string)=>({ArrowUp:'w',ArrowDown:'s',ArrowLeft:'a',ArrowRight:'d'}[key]??key.toLowerCase());
    const down=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){unlock();return;}
      if(!ready()||event.ctrlKey||event.metaKey||event.altKey||!(event.target instanceof HTMLElement)||event.target.closest('input,select,textarea,button,summary,aside,[contenteditable=true],[role=tab]'))return;
      const key=keyName(event.key);if(!['w','s','a','d'].includes(key))return;
      event.preventDefault();held.current.add(key);invalidate();
    };
    const up=(event:KeyboardEvent)=>{held.current.delete(keyName(event.key));invalidate();};
    const visibility=()=>{if(document.hidden)unlock();};
    canvas.addEventListener('click',activate,true);document.addEventListener('mousemove',mouse);
    canvas.addEventListener('pointerdown',touchDown);canvas.addEventListener('pointermove',touchMove);canvas.addEventListener('pointerup',touchUp);canvas.addEventListener('pointercancel',touchUp);
    document.addEventListener('pointerlockchange',syncLock);window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',unlock);document.addEventListener('visibilitychange',visibility);
    const unsubscribe=useOrgStore.subscribe((next,previous)=>{
      if(previous.exploreLookActive&&!next.exploreLookActive||next.detailOpen&&!previous.detailOpen&&window.innerWidth<768||!['room','hall'].includes(next.explorePhase)||next.experienceMode!=='explore')unlock();
    });
    return()=>{
      unsubscribe();canvas.removeEventListener('click',activate,true);document.removeEventListener('mousemove',mouse);
      canvas.removeEventListener('pointerdown',touchDown);canvas.removeEventListener('pointermove',touchMove);canvas.removeEventListener('pointerup',touchUp);canvas.removeEventListener('pointercancel',touchUp);
      document.removeEventListener('pointerlockchange',syncLock);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',unlock);document.removeEventListener('visibilitychange',visibility);unlock();
    };
  },[camera,gl,invalidate,look]);
  useEffect(()=>{
    if(state.camera.type==='explore-forward'||state.camera.type==='explore-back'){
      impulseDirection.current=state.camera.type==='explore-forward'?1:-1;
      impulseUntil.current=performance.now()+260;invalidate();
    }
    if(state.camera.type==='explore-move-stop'){impulseDirection.current=0;impulseUntil.current=0;}
    const movementKey=state.camera.type.replace('explore-hold-','');
    if(state.camera.type.startsWith('explore-hold-')&&['w','a','s','d'].includes(movementKey)){held.current.add(movementKey);invalidate();}
    if(state.camera.type==='explore-release'){held.current.clear();invalidate();}
  },[state.camera.tick,invalidate]);
  useFrame((_,dt)=>{
    const delta=Math.min(dt,.04);
    const current=motion.current;
    if(current&&!current.done){
      held.current.clear();velocity.current.set(0,0,0);lookTarget.current=null;
      current.elapsed+=Math.min(dt,.05);
      const t=current.duration?Math.min(1,current.elapsed/current.duration):1;
      const eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
      camera.position.lerpVectors(current.from,current.to,eased);camera.quaternion.slerpQuaternions(current.start,current.end,eased);
      if(t<1)invalidate();else{current.done=true;invalidate();useOrgStore.getState().exploreFinish(current.phase,current.token);}
      return;
    }
    const s=useOrgStore.getState();if(!['room','hall'].includes(s.explorePhase))return;
    if(s.detailOpen&&size.width<768){held.current.clear();velocity.current.set(0,0,0);return;}
    let looking=false;
    if(lookTarget.current){
      camera.quaternion.slerp(lookTarget.current,1-Math.exp(-24*delta));
      looking=camera.quaternion.angleTo(lookTarget.current)>.0001;
      if(!looking)lookTarget.current=null;
    }
    const keys=held.current;
    const impulse=performance.now()<impulseUntil.current?impulseDirection.current:0;
    const forward=new Vector3();camera.getWorldDirection(forward);forward.y=0;forward.normalize();
    const right=new Vector3().crossVectors(forward,new Vector3(0,1,0));
    const desired=forward.multiplyScalar((keys.has('w')?1:0)-(keys.has('s')?1:0)+impulse).addScaledVector(right,(keys.has('d')?1:0)-(keys.has('a')?1:0));
    if(desired.lengthSq()>0)desired.normalize().multiplyScalar(WALK_SPEED);
    velocity.current.lerp(desired,1-Math.exp(-(desired.lengthSq()?12:18)*delta));
    const moving=velocity.current.lengthSq()>.0001;
    if(moving){
      const rooms=floorRooms(s.units,s.exploreBranchId,s.exploreDepth);
      const next=moveOnFloor(camera.position,{x:velocity.current.x*delta,z:velocity.current.z*delta},rooms.length);
      camera.position.x=next.x;camera.position.z=next.z;
      const previous=rooms.findIndex(room=>room.id===s.exploreRoomId);
      const index=roomAt(next,rooms.length,previous<0?null:previous);
      s.exploreWalkRoom(index===null?null:rooms[index].id);
      if(nearElevator(next))s.exploreElevator();
    }
    if(moving||looking||keys.size||impulse)invalidate();
  });
  return null;
}
