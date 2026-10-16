import React, { Component, createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Html, Line, RoundedBox, Stats } from '@react-three/drei';
import { EffectComposer, SMAA, Vignette } from '@react-three/postprocessing';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { easing } from 'maath';
import { BackSide, Color, Vector3 } from 'three';
import { useOrg } from '../store';
import { BLOCK, FOV, VIEWS, scenePalette, toneVariables, unitTone } from '../theme.js';
import { campusLayout } from './layout.js';

// Lớp DOM cố định cho nhãn Html: tránh việc drei đổi phần tử đích sau khi R3F nối sự kiện.
const LabelLayer = createContext(null);
const ReducedMotion = createContext(false);

// Bậc chất lượng. Mặc định bậc 1: đo trên GPU Intel tích hợp, hậu kỳ (bậc 2) làm tụt dưới 60 fps nên chỉ bật bằng ?quality=2.
// Cảnh tự hạ bậc khi đo được dưới ~55 khung hình/giây lúc đang chuyển động.
const TIERS = [
  { dpr: 1, shadows: false, post: false },
  { dpr: 1.25, shadows: true, post: false },
  { dpr: 1.5, shadows: true, post: true },
];
const params = new URLSearchParams(window.location.search);
const SHOW_FPS = params.has('fps');
const FORCED_TIER = params.has('quality') ? Math.max(0, Math.min(2, Number(params.get('quality')) || 0)) : null;
const readTier = () => { if (FORCED_TIER != null) return FORCED_TIER; try { return Math.min(1, Number(sessionStorage.getItem('sdtq-quality') ?? 1)); } catch { return 1; } };
const H = BLOCK.height;
// Khung đầu tiên sau thời gian nghỉ có delta rất lớn: coi như một khung bình thường để hoạt cảnh không nhảy cóc.
const step = dt => (dt > 0.25 ? 1 / 60 : dt);

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function OrgScene({ units, allUnits, positions, matches, filtering, insets }) {
  const theme = useOrg(s => s.theme);
  const failWebGL = useOrg(s => s.failWebGL);
  const setHovered = useOrg(s => s.setHovered);
  const reduced = !!useReducedMotion();
  const palette = scenePalette[theme];
  const labelLayer = useRef(null);
  const contextListener = useRef(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const listener = contextListener.current;
      if (listener) listener.canvas.removeEventListener('webglcontextlost', listener.handler);
      contextListener.current = null;
    };
  }, []);
  const onCreated = state => {
    state.gl.shadowMap.autoUpdate = false;
    if (!mounted.current) return;
    const canvas = state.gl.domElement;
    const handler = event => {
      // R3F deliberately loses the old context when its Canvas is unmounted.
      // Only a lost context in the active scene is a rendering failure.
      if (!mounted.current || useOrg.getState().view !== '3d') return;
      event.preventDefault();
      failWebGL();
    };
    canvas.addEventListener('webglcontextlost', handler);
    contextListener.current = { canvas, handler };
  };
  const [tier, setTier] = useState(readTier);
  const quality = TIERS[tier];
  const { campuses, baseY } = useMemo(() => campusLayout(units, positions), [units, positions]);
  const decline = () => setTier(t => { const next = Math.max(0, t - 1); try { sessionStorage.setItem('sdtq-quality', next); } catch {} return next; });

  return (
    <SceneBoundary onError={failWebGL}>
      <div ref={labelLayer} data-density="near" className="group/labels pointer-events-none absolute inset-0 z-[1] overflow-hidden" />
      <LabelLayer.Provider value={labelLayer}>
        <ReducedMotion.Provider value={reduced}>
          <Canvas
            className="three-host"
            flat shadows="soft" frameloop={SHOW_FPS ? 'always' : 'demand'} dpr={Math.min(quality.dpr, window.devicePixelRatio || 1)}
            camera={{ fov: FOV, near: 10, far: 40000, position: [-3000, 4000, 5000] }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            onCreated={onCreated}
            onPointerMissed={() => setHovered(null)}
          >
            <color attach="background" args={[palette.canvas]} />
            <fog attach="fog" args={[palette.canvas, 2000, 8000]} />
            {/* Đèn vật lý chia cho π: mặt trên ≈ đúng màu token, mặt trái ≈ 87%, mặt trước (khuất sáng) ≈ 70%. */}
            <ambientLight intensity={1.35} />
            <KeyLight positions={positions} castShadow={quality.shadows} revision={`${theme}|${filtering}|${units.length}`} />
            <Ground positions={positions} palette={palette} />
            {campuses.map(c => <Campus key={c.id} campus={c} palette={palette} />)}
            {units.map(unit => (
              <UnitBlock key={unit.id} unit={unit} position={positions.get(unit.id)} base={baseY.get(unit.id)} palette={palette}
                childCount={allUnits.filter(u => u.parentId === unit.id).length}
                delay={Math.min(.28, unit.depth * .06 + (units.filter(u => u.parentId === unit.parentId).indexOf(unit)) * .025)}
                dimmed={filtering && !matches(unit)} />
            ))}
            <Edges units={units} allUnits={allUnits} positions={positions} baseY={baseY} palette={palette} />
            <HoverPopup units={units} allUnits={allUnits} positions={positions} baseY={baseY} />
            <Rig positions={positions} baseY={baseY} campuses={campuses} units={units} insets={insets} labelLayer={labelLayer} />
            {quality.post && (
              // N8AO làm mất bóng đổ của đèn chính khi chạy chung; dùng SMAA + Vignette nhẹ, giữ bóng thật cho chiều sâu.
              <EffectComposer multisampling={0}>
                <SMAA />
                <Vignette offset={0.3} darkness={theme === 'dark' ? 0.45 : 0.22} />
              </EffectComposer>
            )}
            {FORCED_TIER == null && <AdaptiveQuality tier={tier} onDecline={decline} />}
            {SHOW_FPS && <Stats />}
          </Canvas>
        </ReducedMotion.Provider>
      </LabelLayer.Provider>
    </SceneBoundary>
  );
}

// Đo trung vị thời gian khung hình trong lúc cảnh đang chuyển động liên tục; bỏ qua khoảng nghỉ.
function AdaptiveQuality({ tier, onDecline }) {
  const samples = useRef([]);
  useEffect(() => { samples.current = []; }, [tier]);
  useFrame((_, dt) => {
    if (tier === 0) return;
    if (dt > 0.1) { samples.current = []; return; }
    samples.current.push(dt);
    if (samples.current.length < 60) return;
    const median = [...samples.current].sort((a, b) => a - b)[30];
    samples.current = [];
    if (median > 1 / 55) onDecline();
  });
  return null;
}

function useBounds(positions) {
  return useMemo(() => {
    const points = [...positions.values()];
    const minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x));
    const minZ = Math.min(...points.map(p => p.z)), maxZ = Math.max(...points.map(p => p.z));
    return { minX, maxX, minZ, maxZ, cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2, radius: Math.hypot(maxX - minX, maxZ - minZ) / 2 + BLOCK.width };
  }, [positions]);
}

// Đèn chính đổ bóng, khung bóng ôm vừa sơ đồ để bóng sắc nét.
function KeyLight({ positions, castShadow }) {
  const light = useRef(null);
  const invalidate = useThree(s => s.invalidate);
  const gl = useThree(s => s.gl);
  const bounds = useBounds(positions);
  useLayoutEffect(() => {
    const l = light.current; const dir = new Vector3(-0.75, 0.85, -0.45).normalize();
    l.position.set(bounds.cx + dir.x * 2500, dir.y * 2500, bounds.cz + dir.z * 2500);
    l.target.position.set(bounds.cx, 0, bounds.cz); l.target.updateMatrixWorld();
    const cam = l.shadow.camera, r = bounds.radius + 160;
    Object.assign(cam, { left: -r, right: r, top: r, bottom: -r, near: 500, far: 5000 }); cam.updateProjectionMatrix();
    l.shadow.needsUpdate = true; gl.shadowMap.needsUpdate = true; invalidate();
  }, [bounds, invalidate, gl]);
  // Bóng chỉ vẽ lại khi cảnh đổi (khối di chuyển, lọc, theme), không vẽ lại khi chỉ xoay camera.
  useEffect(() => { gl.shadowMap.needsUpdate = true; invalidate(); });
  return <directionalLight ref={light} intensity={2} castShadow={castShadow} shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={1.2} />;
}

function Ground({ positions, palette }) {
  const bounds = useBounds(positions);
  const lines = useMemo(() => {
    const stepSize = 80, pad = 1600;
    const snap = v => Math.round(v / stepSize) * stepSize;
    const minX = snap(bounds.minX - pad), maxX = snap(bounds.maxX + pad), minZ = snap(bounds.minZ - pad), maxZ = snap(bounds.maxZ + pad);
    const minor = [], major = [];
    for (let x = minX; x <= maxX; x += stepSize) (x % (stepSize * 5) ? minor : major).push([x, 0.1, minZ], [x, 0.1, maxZ]);
    for (let z = minZ; z <= maxZ; z += stepSize) (z % (stepSize * 5) ? minor : major).push([minX, 0.1, z], [maxX, 0.1, z]);
    return { minor, major };
  }, [bounds]);
  return <>
    <mesh rotation-x={-Math.PI / 2}>
      <planeGeometry args={[60000, 60000]} />
      <meshBasicMaterial color={palette.floor} />
    </mesh>
    <mesh rotation-x={-Math.PI / 2} position-y={0.2} receiveShadow>
      <planeGeometry args={[60000, 60000]} />
      <shadowMaterial transparent opacity={palette.shadow} />
    </mesh>
    <Line points={lines.minor} segments color={palette.grid} lineWidth={1} />
    <Line points={lines.major} segments color={palette.gridSection} lineWidth={1} />
  </>;
}

// Mặt bằng của một đơn vị có nhánh đang mở; trượt và co giãn mượt khi bố cục đổi.
function Campus({ campus, palette }) {
  const reduced = useContext(ReducedMotion);
  const mesh = useRef(null);
  const target = useMemo(() => {
    const w = campus.maxX - campus.minX, d = campus.maxZ - campus.minZ;
    return { position: [(campus.minX + campus.maxX) / 2, campus.top / 2, (campus.minZ + campus.maxZ) / 2], scale: [w, campus.top, d] };
  }, [campus]);
  useLayoutEffect(() => {
    const m = mesh.current; m.position.set(target.position[0], reduced ? target.position[1] : 0, target.position[2]);
    m.scale.set(target.scale[0], reduced ? target.scale[1] : 0.001, target.scale[2]);
  }, []);
  useFrame((state, dt) => {
    const m = mesh.current;
    if (reduced) { m.position.set(...target.position); m.scale.set(...target.scale); state.gl.shadowMap.needsUpdate = true; return; }
    const moving = easing.damp3(m.position, target.position, 0.2, step(dt)) | easing.damp3(m.scale, target.scale, 0.2, step(dt));
    if (moving) { state.gl.shadowMap.needsUpdate = true; state.invalidate(); }
  });
  const color = palette.campus[Math.min(campus.level, palette.campus.length - 1)];
  return (
    <mesh ref={mesh} receiveShadow castShadow>
      <boxGeometry />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
    </mesh>
  );
}

function UnitBlock({ unit, position, base, palette, childCount, dimmed, delay }) {
  const theme = useOrg(s => s.theme);
  const selected = useOrg(s => s.activeDeptId === unit.id);
  const hovered = useOrg(s => s.hoveredDeptId === unit.id);
  const open = useOrg(s => s.expanded.has(unit.id));
  const { select, setHovered, toggle } = useOrg.getState();
  const portal = useContext(LabelLayer);
  const reduced = useContext(ReducedMotion);
  const outer = useRef(null), lifter = useRef(null), body = useRef(null), appearAt = useRef(null);
  const material = useRef(null);
  const lift = selected ? 16 : hovered ? 8 : 0;
  const color = selected ? palette.blockSelected : hovered ? palette.blockHover : palette.block;
  const targetColor = useMemo(() => new Color(color), [color]);
  const tone = unitTone(unit.type, theme);
  const enter = () => { setHovered(unit.id); document.body.style.cursor = 'pointer'; };
  const leave = () => { if (useOrg.getState().hoveredDeptId === unit.id) setHovered(null); document.body.style.cursor = ''; };
  useEffect(() => () => { document.body.style.cursor = ''; }, []);

  useLayoutEffect(() => {
    outer.current.position.set(position.x, base, position.z);
    body.current.scale.y = reduced ? 1 : 0.001;
  }, []);
  // Khối "mọc" lên theo thứ tự cấp rồi thứ tự trong hàng; sau đó trượt mượt khi bố cục thay đổi.
  useFrame((state, dt) => {
    const o = outer.current, l = lifter.current, b = body.current;
    if (reduced) { o.position.set(position.x, base, position.z); l.position.y = 0; b.scale.y = 1; material.current?.color.copy(targetColor); state.gl.shadowMap.needsUpdate = true; return; }
    if (appearAt.current == null) appearAt.current = state.clock.elapsedTime + delay;
    if (state.clock.elapsedTime < appearAt.current) { state.invalidate(); return; }
    const d = step(dt);
    const moving = easing.damp3(o.position, [position.x, base, position.z], 0.2, d)
      | easing.damp(l.position, 'y', lift, 0.12, d)
      | easing.damp(b.scale, 'y', 1, 0.24, d);
    const currentColor = material.current?.color;
    const colorMoving = currentColor && Math.abs(currentColor.r - targetColor.r) + Math.abs(currentColor.g - targetColor.g) + Math.abs(currentColor.b - targetColor.b) > .002;
    if (colorMoving) currentColor.lerp(targetColor, 1 - Math.exp(-12 * d));
    if (moving || colorMoving) { state.gl.shadowMap.needsUpdate = true; state.invalidate(); }
  });

  const ring = [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]].map(([sx, sz]) => [sx * (BLOCK.width / 2 + 10), 0.8, sz * (BLOCK.depth / 2 + 10)]);
  return (
    <group ref={outer}>
      {selected && <Line points={ring} color={palette.accent} lineWidth={2} />}
      <group ref={lifter}>
        <group ref={body}>
          <RoundedBox args={[BLOCK.width, H, BLOCK.depth]} radius={5} smoothness={3} position-y={H / 2} castShadow={!dimmed} receiveShadow
            onClick={event => { event.stopPropagation(); select(unit.id); }}
            onPointerOver={event => { event.stopPropagation(); enter(); }}
            onPointerOut={leave}>
            <meshStandardMaterial ref={material} color={palette.block} roughness={0.82} metalness={0} transparent={dimmed} opacity={dimmed ? 0.3 : 1} />
          </RoundedBox>
          {/* Viền khối (design.md §10.4) bằng lớp vỏ lật mặt sau: rẻ hơn hậu kỳ Outline. */}
          <RoundedBox args={[BLOCK.width + 3, H + 3, BLOCK.depth + 3]} radius={6} smoothness={3} position-y={H / 2} raycast={() => null}>
            <meshBasicMaterial color={selected ? palette.accent : palette.blockSide} side={BackSide} transparent={dimmed} opacity={dimmed ? 0.3 : 1} />
          </RoundedBox>
          <mesh position={[0, H + 0.6, BLOCK.depth / 2 - 12]} raycast={() => null}>
            <boxGeometry args={[BLOCK.width - 30, 1.2, selected ? 9 : 6]} />
            <meshBasicMaterial color={selected ? palette.accent : tone.ink} />
          </mesh>
          <Html portal={portal} position={[0, H + 2, 0]} center zIndexRange={[20, 0]} className="pointer-events-none">
            <div style={toneVariables(unit.type, theme)} className={`node-label flex w-[124px] flex-col items-center gap-1 ${dimmed ? 'opacity-40' : ''}`}>
              <button type="button" aria-label={`Xem ${unit.name}`} aria-current={selected ? 'true' : undefined}
                onClick={() => select(unit.id)} onPointerEnter={enter} onPointerLeave={leave} onFocus={() => setHovered(unit.id)} onBlur={leave}
                className={`pointer-events-auto flex max-w-full flex-col items-center gap-0.5 rounded-md px-2 py-1 text-center outline-offset-2 ${selected ? 'bg-surface/95 shadow-sm ring-1 ring-brand' : 'bg-surface/80'}`}>
                <span className="unit-type-tag">{unit.code || unit.type}</span>
                <strong className={`line-clamp-2 text-[12px] leading-tight font-semibold text-balance text-ink ${selected || hovered ? '' : 'group-data-[density=far]/labels:hidden'}`}>{unit.name}</strong>
              </button>
              {childCount > 0 && (
                <button type="button" onClick={() => toggle(unit.id)} aria-expanded={open} aria-label={`${open ? 'Thu gọn' : 'Mở rộng'} ${unit.name}`}
                  className="pointer-events-auto min-w-9 rounded-[5px] border border-line bg-surface px-1.5 text-[11px] leading-5 text-muted tabular-nums transition-colors hover:border-brand hover:text-brand group-data-[density=far]/labels:hidden">
                  {open ? '−' : '+'} {childCount}
                </button>
              )}
            </div>
          </Html>
        </group>
      </group>
    </group>
  );
}

function Edges({ units, allUnits, positions, baseY, palette }) {
  const activeDeptId = useOrg(s => s.activeDeptId);
  const path = useMemo(() => {
    const ids = new Set(); let current = allUnits.find(u => u.id === activeDeptId);
    while (current) { ids.add(current.id); current = allUnits.find(u => u.id === current.parentId); }
    return ids;
  }, [allUnits, activeDeptId]);
  // Đường nối dạng trục chung trên mặt bằng của đơn vị cha: hàng đầu nối thẳng, các hàng sau đi qua trục bên trái nhóm con.
  const routes = units.filter(u => positions.has(u.parentId)).map(unit => {
    const parent = positions.get(unit.parentId), child = positions.get(unit.id);
    const y = baseY.get(unit.parentId) + 0.8;
    const startZ = parent.z + BLOCK.depth / 2, endZ = child.z - BLOCK.depth / 2 - 10;
    const firstBus = startZ + BLOCK.levelGap / 2;
    const points = child.trunkX == null
      ? [[parent.x, startZ], [parent.x, child.busZ], [child.x, child.busZ], [child.x, endZ]]
      : [[parent.x, startZ], [parent.x, firstBus], [child.trunkX, firstBus], [child.trunkX, child.busZ], [child.x, child.busZ], [child.x, endZ]];
    return { unit, child, endZ, y, points, active: path.has(unit.id) };
  }).sort((a, b) => a.active - b.active);
  return routes.map(({ unit, child, endZ, y, points, active }) => {
    const color = active ? palette.edgeActive : palette.edge;
    return (
      <group key={unit.id}>
        <Line points={points.map(([x, z]) => [x, y + (active ? 0.4 : 0), z])} color={color} lineWidth={active ? 2.6 : 1.3} />
        <RoutePulse points={points.map(([x, z]) => [x, y + 4, z])} active={active} trigger={activeDeptId} color={palette.accent} delay={Math.min(.21, unit.depth * .07)} />
        <mesh position={[child.x, y + 0.5, endZ + 4]} rotation-x={Math.PI / 2} scale={[1, 1, 0.35]}>
          <coneGeometry args={[6, 10, 3]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    );
  });
}

// One bounded pass along the selected ancestry path. No idle render loop.
function RoutePulse({ points, active, trigger, color, delay }) {
  const reduced = useContext(ReducedMotion);
  const marker = useRef(null);
  const elapsed = useRef(1);
  const invalidate = useThree(s => s.invalidate);
  const routeKey = points.map(p => p.join(',')).join(';');
  const route = useMemo(() => {
    const vertices = points.map(p => new Vector3(...p));
    const lengths = vertices.slice(1).map((v, i) => v.distanceTo(vertices[i]));
    return { vertices, lengths, total: lengths.reduce((sum, length) => sum + length, 0) };
  }, [routeKey]);
  useEffect(() => {
    elapsed.current = active && !reduced ? -delay : 1;
    if (marker.current) marker.current.visible = false;
    if (active && !reduced) invalidate();
  }, [trigger, routeKey, active, reduced, delay, invalidate]);
  useFrame((state, dt) => {
    const mesh = marker.current;
    if (!mesh || reduced || !active || elapsed.current >= .65) return;
    elapsed.current += step(dt);
    if (elapsed.current < 0) { state.invalidate(); return; }
    if (elapsed.current >= .65) { mesh.visible = false; return; }
    let distance = route.total * Math.min(1, elapsed.current / .65);
    for (let i = 0; i < route.lengths.length; i++) {
      if (distance <= route.lengths[i] || i === route.lengths.length - 1) {
        mesh.position.lerpVectors(route.vertices[i], route.vertices[i + 1], route.lengths[i] ? distance / route.lengths[i] : 1);
        break;
      }
      distance -= route.lengths[i];
    }
    mesh.visible = true;
    state.invalidate();
  });
  if (!active || reduced) return null;
  return <mesh ref={marker} visible={false} raycast={() => null}>
    <sphereGeometry args={[4.5, 10, 8]} />
    <meshBasicMaterial color={color} />
  </mesh>;
}

function HoverPopup({ units, allUnits, positions, baseY }) {
  const hoveredDeptId = useOrg(s => s.hoveredDeptId);
  const portal = useContext(LabelLayer);
  const unit = units.find(u => u.id === hoveredDeptId);
  const last = useRef(null);
  if (unit && positions.has(unit.id)) last.current = { unit, position: positions.get(unit.id), base: baseY.get(unit.id) ?? 0 };
  if (!last.current) return null;
  const { position, base } = last.current;
  const shown = unit && positions.has(unit.id) ? unit : null;
  const parent = shown && allUnits.find(u => u.id === shown.parentId);
  const children = shown ? allUnits.filter(u => u.parentId === shown.id).length : 0;
  return (
    <Html portal={portal} position={[position.x, base + H + 8, position.z]} zIndexRange={[60, 50]} className="pointer-events-none">
      <AnimatePresence>
        {shown && (
          // Một popup duy nhất: đổi khối chỉ cập nhật nội dung, tránh hai popup chồng nhau lúc chuyển.
          <motion.div key="hover-popup" role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.08 } }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[46px] left-0 w-64 -translate-x-1/2 rounded-xl border border-line bg-raised p-3.5 text-left shadow-[0_14px_40px_-12px_rgb(11_29_51/.35)]">
            <p className="text-[11px] text-muted">{[shown.type, shown.code].filter(Boolean).join(' · ')}</p>
            <p className="mt-1 text-sm leading-snug font-semibold text-ink">{shown.name}</p>
            {parent && <p className="mt-1 truncate text-[11px] text-muted">Trực thuộc {parent.name}</p>}
            <dl className="mt-3 grid grid-cols-3 border-t border-line pt-2.5 text-center">
              {[[shown.duties.length, 'Nhiệm vụ'], [shown.authorities.length, 'Quyền hạn'], [children, 'Đơn vị con']].map(([value, label]) => (
                <div key={label}><dt className="text-[10px] text-muted">{label}</dt><dd className="text-sm font-semibold text-ink tabular-nums">{value}</dd></div>
              ))}
            </dl>
            <p className="mt-2.5 text-[11px] text-brand">Nhấp khối để mở hồ sơ</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Html>
  );
}

// Điều khiển camera: một nơi duy nhất ghi vị trí (camera-controls). Motion chỉ lo DOM.
function Rig({ positions, baseY, campuses, units, insets, labelLayer }) {
  const controls = useRef(null);
  const { size } = useThree();
  const command = useOrg(s => s.camera);
  const reduced = useContext(ReducedMotion);
  const latest = useRef({}); latest.current = { positions, baseY, campuses, units, insets, size };
  const view = useRef('angled');
  const density = useRef('near');

  // Sương mù bám theo khoảng cách camera; nhãn rút gọn khi khối trên màn hình quá nhỏ (chỉ ghi DOM khi đổi trạng thái).
  useFrame(state => {
    const c = controls.current; if (!c) return;
    const distance = c.distance;
    if (state.scene.fog) { state.scene.fog.near = distance * 0.9; state.scene.fog.far = distance * 2.8; }
    const pxPerUnit = state.size.height / (2 * Math.tan((FOV * Math.PI) / 360) * distance);
    const next = BLOCK.width * pxPerUnit < 90 ? 'far' : 'near';
    if (next !== density.current) { density.current = next; labelLayer.current?.setAttribute('data-density', next); }
  });

  useEffect(() => {
    const c = controls.current; if (!c) return;
    c.mouseButtons.left = 2;   // ACTION.TRUCK — kéo để di chuyển
    c.mouseButtons.right = 1;  // ACTION.ROTATE — chuột phải để xoay
    c.touches.one = 128;       // ACTION.TOUCH_TRUCK
  }, []);

  // Bàn phím: mũi tên/WASD di chuyển trên mặt sàn theo hướng nhìn, Shift + mũi tên hoặc Q/E xoay,
  // +/− hoặc PageUp/PageDown thu phóng, Home về toàn cảnh. Giữ phím để di chuyển liên tục.
  const keys = useRef(new Set());
  const shift = useRef(false);
  const invalidate = useThree(s => s.invalidate);
  useEffect(() => {
    const movement = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'PageUp', 'PageDown', 'Equal', 'Minus', 'NumpadAdd', 'NumpadSubtract']);
    // Không chiếm phím khi đang gõ, đang mở biểu mẫu hoặc focus nằm trong panel (để mũi tên vẫn cuộn được panel).
    const ignored = e => e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input, textarea, select, [contenteditable="true"], dialog, aside');
    const down = e => {
      if (ignored(e)) return;
      if (e.code === 'Home') { e.preventDefault(); useOrg.getState().command('fit'); return; }
      if (!movement.has(e.code)) return;
      e.preventDefault();
      keys.current.add(e.code); shift.current = e.shiftKey;
      invalidate();
    };
    const up = e => { keys.current.delete(e.code); shift.current = e.shiftKey; };
    const reset = () => keys.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', reset);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', reset); };
  }, [invalidate]);

  const target = useMemo(() => new Vector3(), []);
  useFrame((state, dt) => {
    const k = keys.current, c = controls.current;
    if (!k.size || !c) return;
    const d = Math.min(dt, 0.05);
    const on = (...codes) => (codes.some(code => k.has(code)) ? 1 : 0);
    const x = on('ArrowRight', 'KeyD') - on('ArrowLeft', 'KeyA');
    const y = on('ArrowUp', 'KeyW') - on('ArrowDown', 'KeyS');
    const turn = on('KeyQ') - on('KeyE') + (shift.current ? -x : 0);
    const tilt = shift.current ? -y : 0;
    const zoom = on('Equal', 'NumpadAdd', 'PageUp') - on('Minus', 'NumpadSubtract', 'PageDown');
    if (turn || tilt) c.rotate(turn * 1.1 * d, tilt * 0.7 * d, false);
    if (!shift.current && (x || y)) {
      // Hướng phải và hướng tiến chiếu trên mặt sàn theo góc phương vị hiện tại; tốc độ tỉ lệ khoảng cách camera.
      const az = c.azimuthAngle, speed = c.distance * 0.35 * d;
      const dx = (Math.cos(az) * x - Math.sin(az) * y) * speed, dz = (-Math.sin(az) * x - Math.cos(az) * y) * speed;
      c.getTarget(target);
      c.moveTo(target.x + dx, target.y, target.z + dz, false);
    }
    if (zoom) c.dolly(c.distance * 0.8 * d * zoom, false);
    state.invalidate();
  });

  useEffect(() => {
    const c = controls.current; if (!c) return;
    const { positions, baseY, campuses, units, insets, size } = latest.current;
    const type = command.type;
    const animate = !reduced;
    // frameloop="demand": lệnh camera phải tự yêu cầu một khung hình, nếu không camera chỉ đổi khi có thao tác khác.
    invalidate();
    if (type === 'zoom-in' || type === 'zoom-out') { c.dolly(c.distance * (type === 'zoom-in' ? 0.22 : -0.28), animate); return; }
    if (type === 'locate') {
      const id = useOrg.getState().activeDeptId; const p = positions.get(id);
      if (!p) return;
      aim(c, new Vector3(p.x, (baseY.get(id) ?? 0) + H / 2, p.z), { azimuth: c.azimuthAngle, polar: c.polarAngle }, Math.min(c.distance, 1100), insets, size, animate);
      return;
    }
    if (VIEWS[type]) view.current = type;
    const goal = fitGoal(positions, baseY, campuses, units, VIEWS[view.current], insets, size);
    if (!goal) return;
    if (type === 'initial' && !reduced) {
      // Camera bay vào từ trên cao, xoay nhẹ về góc làm việc.
      aim(c, goal.center, { azimuth: goal.angles.azimuth - 0.9, polar: 0.35 }, goal.distance * 2.1, insets, size, false);
      c.smoothTime = 0.75;
      aim(c, goal.center, goal.angles, goal.distance, insets, size, true);
      const timer = setTimeout(() => { if (controls.current) controls.current.smoothTime = 0.25; }, 1600);
      return () => clearTimeout(timer);
    }
    aim(c, goal.center, goal.angles, goal.distance, insets, size, animate && type !== 'initial');
  }, [command.tick]);

  return <CameraControls ref={controls} makeDefault minDistance={180} maxDistance={9000} minPolarAngle={0.02} maxPolarAngle={1.38}
    dollyToCursor smoothTime={0.25} draggingSmoothTime={0.08} />;
}

function basis({ azimuth, polar }) {
  const back = new Vector3().setFromSphericalCoords(1, polar, azimuth);
  const right = new Vector3(Math.cos(azimuth), 0, -Math.sin(azimuth));
  const up = new Vector3().crossVectors(back, right).normalize();
  return { back, right, up };
}

// Đặt điểm nhìn sao cho đích nằm giữa phần trống còn lại giữa các panel phủ trên canvas.
function aim(c, center, angles, distance, insets, size, animate) {
  const { back, right, up } = basis(angles);
  const worldPerPx = (2 * distance * Math.tan((FOV * Math.PI) / 360)) / size.height;
  const dx = ((insets.left - insets.right) / 2) * worldPerPx, dy = ((insets.top - insets.bottom) / 2) * worldPerPx;
  const target = center.clone().addScaledVector(right, -dx).addScaledVector(up, dy);
  const eye = target.clone().addScaledVector(back, distance);
  c.setLookAt(eye.x, eye.y, eye.z, target.x, target.y, target.z, animate);
}

function fitGoal(positions, baseY, campuses, units, angles, insets, size) {
  if (!units.length) return null;
  const { back, right, up } = basis(angles);
  const corners = [];
  const box = (minX, maxX, minY, maxY, minZ, maxZ) => { for (const x of [minX, maxX]) for (const y of [minY, maxY]) for (const z of [minZ, maxZ]) corners.push(new Vector3(x, y, z)); };
  units.forEach(u => { const p = positions.get(u.id); if (!p) return; const y = baseY.get(u.id) ?? 0; box(p.x - BLOCK.width / 2, p.x + BLOCK.width / 2, y, y + H, p.z - BLOCK.depth / 2, p.z + BLOCK.depth / 2); });
  campuses.forEach(c => box(c.minX, c.maxX, 0, c.top, c.minZ, c.maxZ));
  const center = corners.reduce((sum, v) => sum.add(v), new Vector3()).divideScalar(corners.length);
  const proj = axis => corners.map(v => v.clone().sub(center).dot(axis));
  const us = proj(right), vs = proj(up), ws = proj(back);
  // Khoảng cách nhỏ nhất để mọi góc (kể cả góc gần camera, bị phóng lớn do phối cảnh) nằm trong vùng trống.
  const midU = (Math.max(...us) + Math.min(...us)) / 2, midV = (Math.max(...vs) + Math.min(...vs)) / 2;
  const tanV = Math.tan((FOV * Math.PI) / 360), tanH = tanV * (size.width / size.height);
  const fracW = Math.max(0.2, (size.width - insets.left - insets.right) / size.width), fracH = Math.max(0.2, (size.height - insets.top - insets.bottom) / size.height);
  const needed = corners.map((_, i) => Math.max(ws[i] + Math.abs(us[i] - midU) / (tanH * fracW), ws[i] + Math.abs(vs[i] - midV) / (tanV * fracH)));
  const distance = Math.min(8000, Math.max(320, Math.max(...needed) * 1.08 + 30));
  center.addScaledVector(right, midU).addScaledVector(up, midV);
  return { center, angles, distance };
}
