'use client';
import { Component, Suspense, useEffect, useMemo, useRef, type ComponentRef, type ReactNode, type CSSProperties, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Environment, Html, Line, RoundedBox } from '@react-three/drei';
import { useReducedMotion } from 'motion/react';
import { Color, Vector3, type Group, type MeshPhysicalMaterial, type WebGLRenderer } from 'three';
import { journeyStations, journeyUnits, useOrgStore } from '../../store/useOrgStore';
import { orderedStations, type OrgUnit, type Station } from '../../data/orgData';
import { scenePalette, toneVariables, unitTone } from '../../src/theme.js';
import OrganizationScene from '../../src/scene/OrgScene';

type Insets={left:number;right:number;top:number;bottom:number};
type Position={x:number;y:number;z:number};
export interface OrgSceneProps {
  units:Array<OrgUnit&{depth:number}>;allUnits:OrgUnit[];
  positions:Map<string,{x:number;z:number;busZ?:number;trunkX?:number|null}>;
  matches:(unit:OrgUnit)=>boolean;filtering:boolean;insets:Insets;
}

export default function OrgScene(props:OrgSceneProps) {
  const mode=useOrgStore(s=>s.experienceMode);
  return mode==='journey'?<JourneyScene insets={props.insets}/>:<OrganizationScene {...props}/>;
}

class SceneBoundary extends Component<{children:ReactNode;onError:()=>void},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onError();}
  render(){return this.state.failed?null:this.props.children;}
}

export function journeyLayout(stations:Station[]):Map<string,Position> {
  return new Map(stations.map((station,i)=>[station.id,{x:Math.sin(i*.66)*310,y:station.depth*42,z:i*310}]));
}

function JourneyScene({insets}:{insets:Insets}) {
  const state=useOrgStore();const units=journeyUnits(state);
  const stations=useMemo(()=>orderedStations(units),[units]);
  const positions=useMemo(()=>journeyLayout(stations),[stations]);
  const matches=new Set(journeyStations(state).map(u=>u.id));
  const reduced=!!useReducedMotion();
  const portal=useRef<HTMLDivElement>(null);
  const contextListener=useRef<{canvas:HTMLCanvasElement;handler:(event:Event)=>void}|null>(null);
  const mounted=useRef(true);
  const palette=scenePalette[state.theme];
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;const listener=contextListener.current;if(listener)listener.canvas.removeEventListener('webglcontextlost',listener.handler);};},[]);
  const created=({gl}:{gl:WebGLRenderer})=>{
    if(!mounted.current)return;
    const handler=(event:Event)=>{if(!mounted.current||useOrgStore.getState().experienceMode!=='journey')return;event.preventDefault();useOrgStore.getState().failWebGL();};
    gl.domElement.addEventListener('webglcontextlost',handler);contextListener.current={canvas:gl.domElement,handler};
  };
  return <SceneBoundary onError={state.failWebGL}>
    <div ref={portal} className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"/>
    <Canvas className="three-host journey-canvas" shadows frameloop="demand" dpr={[1,1.5]} camera={{fov:35,near:1,far:16000,position:[700,850,1300]}} gl={{antialias:true,powerPreference:'high-performance'}} onCreated={created}>
      <color attach="background" args={[palette.canvas]}/><fog attach="fog" args={[palette.canvas,1800,6500]}/>
      <ambientLight intensity={.8}/><directionalLight position={[-600,1400,700]} intensity={2.4} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-1300} shadow-camera-right={1300} shadow-camera-top={1400} shadow-camera-bottom={-1400}/>
      <Suspense fallback={null}>
        {/* Same 1K HDR as Environment preset="city", self-hosted for reliable internal use. */}
        <Environment files={`${process.env.NEXT_PUBLIC_BASE_PATH||''}/environments/potsdamer_platz_1k.hdr`} environmentIntensity={.6}/>
      </Suspense>
      <mesh rotation-x={-Math.PI/2} position={[0,-26,stations.length*155]} receiveShadow><planeGeometry args={[12000,20000]}/><meshStandardMaterial color={palette.floor} roughness={.95}/></mesh>
      <JourneyRoute stations={stations} positions={positions}/>
      {stations.map((station,i)=><JourneyNode key={station.id} station={station} index={i} position={positions.get(station.id)!} portal={portal} dimmed={!matches.has(station.id)} reduced={reduced}/>)}
      <JourneyCamera positions={positions} insets={insets} reduced={reduced}/>
    </Canvas>
  </SceneBoundary>;
}

function JourneyRoute({stations,positions}:{stations:Station[];positions:Map<string,Position>}) {
  const theme=useOrgStore(s=>s.theme),active=useOrgStore(s=>s.activeDeptId);
  const index=stations.findIndex(u=>u.id===active);
  const palette=scenePalette[theme];
  const allPoints=stations.map(u=>{const p=positions.get(u.id)!;return [p.x,-12,p.z] as [number,number,number];});
  if(allPoints.length<2)return null;
  return <>
    <Line points={allPoints} color={theme==='dark'?'#294765':'#CBD5E2'} lineWidth={8}/>
    {index>0&&<Line points={allPoints.slice(0,index+1)} color={palette.accent} lineWidth={3}/>}
    {stations.map((u,i)=>{const p=positions.get(u.id)!;return <mesh key={u.id} rotation-x={-Math.PI/2} position={[p.x,-11,p.z]}><circleGeometry args={[i===index?45:20,32]}/><meshBasicMaterial color={i===index?palette.accent:palette.gridSection}/></mesh>;})}
  </>;
}

function JourneyNode({station,index,position,portal,dimmed,reduced}:{station:Station;index:number;position:Position;portal:RefObject<HTMLDivElement|null>;dimmed:boolean;reduced:boolean}) {
  const active=useOrgStore(s=>s.activeDeptId===station.id),hovered=useOrgStore(s=>s.hoveredDeptId===station.id),theme=useOrgStore(s=>s.theme);
  const {setHovered,jumpToStation}=useOrgStore.getState();
  const mesh=useRef<Group>(null),material=useRef<MeshPhysicalMaterial>(null);
  const palette=scenePalette[theme],tone=unitTone(station.type,theme);
  const target=useMemo(()=>new Vector3(position.x,position.y+(active?18:hovered?9:0),position.z),[position,active,hovered]);
  const targetColor=useMemo(()=>new Color(active?palette.blockSelected:palette.block),[active,palette]);
  useEffect(()=>{if(mesh.current)mesh.current.position.set(position.x,position.y,position.z);},[position]);
  useFrame((state,dt)=>{
    if(!mesh.current||!material.current)return;
    if(reduced){mesh.current.position.set(position.x,position.y,position.z);material.current.color.copy(targetColor);return;}
    const alpha=1-Math.exp(-12*Math.min(dt,.05));
    mesh.current.position.lerp(target,alpha);material.current.color.lerp(targetColor,alpha);
    const c=material.current.color;
    if(mesh.current.position.distanceToSquared(target)>.01||Math.abs(c.r-targetColor.r)+Math.abs(c.g-targetColor.g)+Math.abs(c.b-targetColor.b)>.003)state.invalidate();
  });
  const enter=()=>{if(!dimmed)setHovered(station.id);};
  const leave=()=>{if(useOrgStore.getState().hoveredDeptId===station.id)setHovered(null);};
  return <group ref={mesh}>
    <RoundedBox args={[220,68,146]} radius={9} smoothness={3} castShadow receiveShadow onPointerOver={e=>{e.stopPropagation();enter();}} onPointerOut={leave} onClick={e=>{e.stopPropagation();if(!dimmed)jumpToStation(station.id,true);}}>
      <meshPhysicalMaterial ref={material} color={palette.block} roughness={.34} metalness={.08} clearcoat={.65} clearcoatRoughness={.3} transmission={dimmed?0:.08} thickness={12} transparent opacity={dimmed ? 0.25 : 1}/>
    </RoundedBox>
    <mesh position={[0,35,57]} raycast={()=>null}><boxGeometry args={[188,2,7]}/><meshBasicMaterial color={active?palette.accent:tone.ink}/></mesh>
    {(active||hovered)&&<Line points={[[-120,-32,-83],[120,-32,-83],[120,-32,83],[-120,-32,83],[-120,-32,-83]]} color={active?palette.accent:tone.ink} lineWidth={active?2.5:1.5}/>}
    <Html portal={portal as RefObject<HTMLElement>} center position={[0,52,0]} zIndexRange={[20,0]} className="pointer-events-none">
      <button className={`journey-node-label pointer-events-auto w-[136px] rounded-lg border px-2 py-2 text-center shadow-sm ${active?'border-brand bg-surface':'border-line bg-surface/95'} ${dimmed?'opacity-35':''}`} disabled={dimmed} style={toneVariables(station.type,theme) as CSSProperties} aria-label={`Khám phá ${station.name}`} aria-current={active?'step':undefined} onClick={()=>jumpToStation(station.id,true)} onPointerEnter={enter} onPointerLeave={leave}>
        <span className="mb-1 block text-[10px] text-muted">Trạm {String(index+1).padStart(2,'0')} · Layer {station.depth}</span><strong className="block font-display text-[12px] leading-snug">{station.name}</strong>
      </button>
    </Html>
  </group>;
}

function JourneyCamera({positions,insets,reduced}:{positions:Map<string,Position>;insets:Insets;reduced:boolean}) {
  const controls=useRef<ComponentRef<typeof CameraControls>>(null);
  const active=useOrgStore(s=>s.activeDeptId),command=useOrgStore(s=>s.camera);
  const {size,invalidate}=useThree();
  const target=useMemo(()=>new Vector3(),[]);
  useEffect(()=>{
    const c=controls.current;if(!c)return;
    const p=active?positions.get(active):positions.values().next().value;if(!p)return;
    if(command.type==='zoom-in'||command.type==='zoom-out'){c.dolly(c.distance*(command.type==='zoom-in' ? 0.2 : -0.25),!reduced);invalidate();return;}
    const distance=980;
    const back=new Vector3(.55,.6,1).normalize(),right=new Vector3(back.z,0,-back.x).normalize(),up=new Vector3().crossVectors(back,right).normalize();
    const worldPerPx=2*distance*Math.tan(35*Math.PI/360)/Math.max(1,size.height);
    const availableW=Math.max(220,size.width-insets.left-insets.right);
    const fittedDistance=distance*Math.max(1,440/availableW);
    target.set(p.x,p.y+22,p.z).addScaledVector(right,-(insets.left-insets.right)*worldPerPx/2).addScaledVector(up,(insets.top-insets.bottom)*worldPerPx/2);
    const eye=target.clone().addScaledVector(back,fittedDistance);
    c.setLookAt(eye.x,eye.y,eye.z,target.x,target.y,target.z,!reduced);invalidate();
  },[active,command.tick,positions,insets.left,insets.right,insets.top,insets.bottom,size.width,size.height,reduced,invalidate,target]);
  return <CameraControls ref={controls} makeDefault minDistance={420} maxDistance={11000} minPolarAngle={.08} maxPolarAngle={1.42} smoothTime={.35} draggingSmoothTime={.08} dollyToCursor/>;
}
