'use client';
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { CubePoster } from './CubePoster';

/* ------------------------------------------------------------------ */
/* Datos                                                               */
/* ------------------------------------------------------------------ */

interface FaceDef {
  area: string;
  normal: [number, number, number];
  right: [number, number, number];
  color: string;
  labels: string[];
}

/* up = normal × right en todas las caras */
const FACES: FaceDef[] = [
  { area: 'FRONTEND', normal: [0, 1, 0], right: [1, 0, 0], color: '#F4F4F4',
    labels: ['React', 'TS', 'JS', 'Next', 'Vite', 'Tailwind', 'HTML', 'CSS', 'PWA'] },
  { area: 'BACKEND', normal: [0, -1, 0], right: [1, 0, 0], color: '#FFD500',
    labels: ['Python', 'FastAPI', 'Node', 'NestJS', 'PHP', 'REST', 'Auth', 'MVC', 'API'] },
  { area: 'DATOS', normal: [0, 0, 1], right: [1, 0, 0], color: '#C41E3A',
    labels: ['Postgres', 'MySQL', 'SQLite', 'Supabase', 'SQL', 'ORM', 'Neon', 'ER', 'Índices'] },
  { area: 'IA', normal: [0, 0, -1], right: [-1, 0, 0], color: '#FF5800',
    labels: ['Claude', 'Agentes', 'Prompts', 'NLQ', 'Bots', 'Auto', 'Flujos', 'Asist.', 'Python'] },
  { area: 'DEVOPS', normal: [1, 0, 0], right: [0, 0, -1], color: '#0051BA',
    labels: ['Docker', 'CI/CD', 'Actions', 'Git', 'Vercel', 'Render', 'Linux', 'Tests', 'Deploy'] },
  { area: 'PRODUCTO', normal: [-1, 0, 0], right: [0, 0, 1], color: '#009E60',
    labels: ['UX', 'UI', 'Mobile', 'Offline', 'Diseño', 'Datos', 'Clientes', 'Escala', 'Ship'] },
];

interface Move {
  axis: 0 | 1 | 2;
  layer: -1 | 1;
  dir: 1 | -1;
}

const AXES = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];

function randomScramble(): Move[] {
  const n = 14 + Math.floor(Math.random() * 5);
  const moves: Move[] = [];
  while (moves.length < n) {
    const m: Move = {
      axis: Math.floor(Math.random() * 3) as 0 | 1 | 2,
      layer: Math.random() < 0.5 ? -1 : 1,
      dir: Math.random() < 0.5 ? 1 : -1,
    };
    const last = moves[moves.length - 1];
    if (last && last.axis === m.axis && last.layer === m.layer) continue;
    moves.push(m);
  }
  return moves;
}

const invert = (moves: Move[]): Move[] =>
  [...moves].reverse().map((m) => ({ ...m, dir: (m.dir * -1) as 1 | -1 }));

const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
/* easeInOutCubic con un pequeño rebasamiento que vuelve a 0 al final */
const moveEase = (p: number) => easeInOutCubic(p) + 0.035 * Math.sin(Math.PI * p * p);

/* ------------------------------------------------------------------ */
/* Texturas                                                            */
/* ------------------------------------------------------------------ */

function makeLabelTexture(text: string, bg: string): THREE.CanvasTexture {
  const size = 192;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (g) {
    g.fillStyle = bg;
    g.fillRect(0, 0, size, size);
    g.fillStyle = '#0A0A0A';
    let fs = 52;
    const font = (n: number) => `700 ${n}px "JetBrains Mono", ui-monospace, monospace`;
    g.font = font(fs);
    while (g.measureText(text).width > size * 0.8 && fs > 16) {
      fs -= 2;
      g.font = font(fs);
    }
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, size / 2, size / 2 + 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function roundedSquare(size: number, r: number): THREE.ShapeGeometry {
  const h = size / 2;
  const s = new THREE.Shape();
  s.moveTo(-h + r, -h);
  s.lineTo(h - r, -h);
  s.quadraticCurveTo(h, -h, h, -h + r);
  s.lineTo(h, h - r);
  s.quadraticCurveTo(h, h, h - r, h);
  s.lineTo(-h + r, h);
  s.quadraticCurveTo(-h, h, -h, h - r);
  s.lineTo(-h, -h + r);
  s.quadraticCurveTo(-h, -h, -h + r, -h);
  const geo = new THREE.ShapeGeometry(s, 4);
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / size + 0.5;
    uv[i * 2 + 1] = pos.getY(i) / size + 0.5;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

/* ------------------------------------------------------------------ */
/* Cubito                                                              */
/* ------------------------------------------------------------------ */

interface StickerSpec {
  face: number;
  k: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

function stickersFor(x: number, y: number, z: number): StickerSpec[] {
  const out: StickerSpec[] = [];
  const p = new THREE.Vector3(x, y, z);
  FACES.forEach((f, fi) => {
    const n = new THREE.Vector3(...f.normal);
    if (p.dot(n) !== 1) return;
    const right = new THREE.Vector3(...f.right);
    const up = new THREE.Vector3().crossVectors(n, right);
    const col = Math.round(p.dot(right)) + 1;
    const row = 1 - Math.round(p.dot(up));
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, n));
    const e = new THREE.Euler().setFromQuaternion(q);
    out.push({ face: fi, k: row * 3 + col, position: [n.x * 0.4775, n.y * 0.4775, n.z * 0.4775], rotation: [e.x, e.y, e.z] });
  });
  return out;
}

interface CubieProps {
  x: number;
  y: number;
  z: number;
  stickerGeo: THREE.BufferGeometry;
  baseMats: THREE.MeshStandardMaterial[];
  labelTex: THREE.CanvasTexture[][];
}

function Cubie({ x, y, z, stickerGeo, baseMats, labelTex }: CubieProps) {
  const specs = useMemo(() => stickersFor(x, y, z), [x, y, z]);
  return (
    <group position={[x, y, z]} userData={{ cubie: true }}>
      <RoundedBox args={[0.95, 0.95, 0.95]} radius={0.075} smoothness={3} creaseAngle={0.6}>
        <meshStandardMaterial color="#0b0b0b" roughness={0.42} metalness={0.15} />
      </RoundedBox>
      {specs.map((s) => (
        <group key={s.face} position={s.position} rotation={s.rotation}>
          <mesh geometry={stickerGeo} material={baseMats[s.face]} />
          <mesh geometry={stickerGeo} position={[0, 0, 0.005]} visible={false} userData={{ overlay: true, face: s.face, k: s.k }}>
            <meshStandardMaterial map={labelTex[s.face][s.k]} transparent opacity={0} roughness={0.34} metalness={0} polygonOffset polygonOffsetFactor={-2} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Escena + máquina de estados                                         */
/* ------------------------------------------------------------------ */

type Phase = 'init' | 'solving' | 'labels' | 'hold' | 'scrambling' | 'pause';

interface DragState {
  vx: number;
  vy: number;
  dx: number;
  dy: number;
  last: number;
  active: boolean;
}

interface SceneProps {
  scrollRef: MutableRefObject<number>;
  onCaption: (t: string) => void;
  forceSolved: boolean;
  dragRef: MutableRefObject<DragState>;
}

interface Anim {
  move: Move;
  sel: THREE.Group[];
  p0: THREE.Vector3[];
  q0: THREE.Quaternion[];
  t: number;
  dur: number;
}

interface Machine {
  ready: boolean;
  cubies: THREE.Group[];
  overlays: THREE.Mesh[];
  cur: Float32Array;
  tgt: Float32Array;
  phase: Phase;
  t: number;
  queue: Move[];
  scramble: Move[];
  anim: Anim | null;
  moveDur: number;
  faceShown: number;
  base: THREE.Quaternion;
}

const FACE_T = 0.95;

function CubeScene({ scrollRef, onCaption, forceSolved, dragRef }: SceneProps) {
  const outer = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const cubeRoot = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const stickerGeo = useMemo(() => roundedSquare(0.8, 0.12), []);
  const baseMats = useMemo(
    () => FACES.map((f) => new THREE.MeshStandardMaterial({ color: f.color, roughness: 0.34, metalness: 0 })),
    [],
  );
  const labelTex = useMemo(() => FACES.map((f) => f.labels.map((l) => makeLabelTexture(l, f.color))), []);
  useEffect(
    () => () => {
      stickerGeo.dispose();
      baseMats.forEach((m) => m.dispose());
      labelTex.forEach((r) => r.forEach((t) => t.dispose()));
    },
    [stickerGeo, baseMats, labelTex],
  );

  const coords = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) arr.push([x, y, z]);
    return arr;
  }, []);

  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  const m = useRef<Machine>({
    ready: false,
    cubies: [],
    overlays: [],
    cur: new Float32Array(54),
    tgt: new Float32Array(54),
    phase: 'init',
    t: 0,
    queue: [],
    scramble: [],
    anim: null,
    moveDur: 0.32,
    faceShown: -1,
    base: new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0.65, 0)),
  });

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  useFrame((state, dtRaw) => {
    const s = m.current;
    const dt = Math.min(dtRaw, 0.05);
    const root = cubeRoot.current;
    if (!root) return;

    const applyInstant = (mv: Move) => {
      const q = new THREE.Quaternion().setFromAxisAngle(AXES[mv.axis], (mv.dir * Math.PI) / 2);
      for (const g of s.cubies) {
        if (Math.round(g.position.getComponent(mv.axis)) !== mv.layer) continue;
        g.position.applyQuaternion(q);
        g.position.set(Math.round(g.position.x), Math.round(g.position.y), Math.round(g.position.z));
        g.quaternion.premultiply(q);
      }
    };
    const startMove = (mv: Move, dur: number) => {
      const sel = s.cubies.filter((g) => Math.round(g.position.getComponent(mv.axis)) === mv.layer);
      s.anim = { move: mv, sel, p0: sel.map((g) => g.position.clone()), q0: sel.map((g) => g.quaternion.clone()), t: 0, dur };
    };

    if (!s.ready) {
      s.cubies = root.children.filter((c) => c.userData.cubie) as THREE.Group[];
      root.traverse((o) => {
        if (o.userData.overlay) s.overlays.push(o as THREE.Mesh);
      });
      s.ready = true;
      if (forceSolved) {
        s.phase = 'hold';
        s.cur.fill(1);
        s.tgt.fill(1);
        onCaption('STACK: FRONTEND');
      } else {
        s.scramble = randomScramble();
        s.scramble.forEach(applyInstant);
        s.queue = invert(s.scramble);
        s.phase = 'init';
        s.t = 0;
        onCaption('ESTADO: MEZCLADO');
      }
    }

    s.t += dt;

    if (!forceSolved) {
      if (s.anim) {
        const a = s.anim;
        a.t += dt;
        const p = Math.min(1, a.t / a.dur);
        const ang = a.move.dir * (Math.PI / 2) * (p >= 1 ? 1 : moveEase(p));
        const q = new THREE.Quaternion().setFromAxisAngle(AXES[a.move.axis], ang);
        a.sel.forEach((g, i) => {
          g.position.copy(a.p0[i]).applyQuaternion(q);
          g.quaternion.copy(q).multiply(a.q0[i]);
        });
        if (p >= 1) {
          a.sel.forEach((g) => g.position.set(Math.round(g.position.x), Math.round(g.position.y), Math.round(g.position.z)));
          s.anim = null;
        }
      } else if (s.phase === 'init') {
        if (s.t > (reduced ? 0.2 : 1.2)) {
          s.phase = 'solving';
          s.t = 0;
          onCaption('ESTADO: RESOLVIENDO');
        }
      } else if (s.phase === 'solving' || s.phase === 'scrambling') {
        const mv = s.queue.shift();
        if (mv) {
          if (reduced) applyInstant(mv);
          else startMove(mv, s.moveDur);
        } else if (s.phase === 'solving') {
          s.phase = 'labels';
          s.t = 0;
          s.faceShown = -1;
        } else {
          s.phase = 'pause';
          s.t = 0;
        }
      } else if (s.phase === 'pause') {
        if (s.t > 0.5) {
          s.queue = invert(s.scramble);
          s.moveDur = 0.32;
          s.phase = 'solving';
          s.t = 0;
          onCaption('ESTADO: RESOLVIENDO');
        }
      } else if (s.phase === 'labels') {
        const f = Math.min(5, Math.floor(s.t / FACE_T));
        if (f !== s.faceShown) {
          s.faceShown = f;
          onCaption(`STACK: ${FACES[f].area}`);
        }
        for (let fi = 0; fi <= f; fi++) {
          const tl = s.t - fi * FACE_T;
          for (let k = 0; k < 9; k++) if (tl > 0.28 + k * 0.045) s.tgt[fi * 9 + k] = 1;
        }
        if (s.t > 6 * FACE_T) {
          s.phase = 'hold';
          s.t = 0;
        }
      } else if (s.phase === 'hold') {
        if (s.t > 1.2) s.tgt.fill(0);
        if (s.t > 1.8) {
          s.scramble = randomScramble();
          s.queue = s.scramble.slice();
          s.moveDur = 0.13;
          s.phase = 'scrambling';
          s.t = 0;
          s.faceShown = -1;
          onCaption('ESTADO: MEZCLANDO');
        }
      }
    }

    // opacidad de etiquetas (fundido cruzado)
    for (let i = 0; i < s.overlays.length; i++) {
      const o = s.overlays[i];
      const idx = (o.userData.face as number) * 9 + (o.userData.k as number);
      const c = s.cur[idx] + (s.tgt[idx] - s.cur[idx]) * Math.min(1, dt * 9);
      s.cur[idx] = c;
      (o.material as THREE.MeshStandardMaterial).opacity = c;
      o.visible = c > 0.01;
    }

    // orientación global: arrastre + inercia
    const d = dragRef.current;
    if (d.dx !== 0 || d.dy !== 0) {
      const qy = new THREE.Quaternion().setFromAxisAngle(AXES[1], d.dx * 0.011);
      const qx = new THREE.Quaternion().setFromAxisAngle(AXES[0], d.dy * 0.011);
      s.base.premultiply(qy).premultiply(qx);
      d.dx = 0;
      d.dy = 0;
    }
    if (!d.active && (Math.abs(d.vx) > 0.01 || Math.abs(d.vy) > 0.01)) {
      const qy = new THREE.Quaternion().setFromAxisAngle(AXES[1], d.vx * dt);
      const qx = new THREE.Quaternion().setFromAxisAngle(AXES[0], d.vy * dt);
      s.base.premultiply(qy).premultiply(qx);
      const damp = Math.pow(0.05, dt);
      d.vx *= damp;
      d.vy *= damp;
    }
    const interacting = d.active || performance.now() - d.last < 1800;
    if (!interacting) {
      let target: THREE.Quaternion;
      if ((s.phase === 'labels' || forceSolved) && s.faceShown >= 0) {
        const n = new THREE.Vector3(...FACES[s.faceShown].normal);
        target = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.3, 0.38, 0)).multiply(new THREE.Quaternion().setFromUnitVectors(n, new THREE.Vector3(0, 0, 1)));
      } else {
        const t = state.clock.elapsedTime;
        target = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5 + Math.sin(t * 0.4) * 0.07, 0.65 + Math.sin(t * 0.3) * 0.16, 0));
      }
      s.base.slerp(target, 1 - Math.pow(0.004, dt));
    }

    if (spin.current) spin.current.quaternion.copy(s.base);
    if (tilt.current) {
      const k = Math.min(1, dt * 4);
      tilt.current.rotation.y += (pointer.current.x * 0.3 - tilt.current.rotation.y) * k;
      tilt.current.rotation.x += (pointer.current.y * 0.2 - tilt.current.rotation.x) * k;
    }
    if (outer.current) {
      const p = scrollRef.current;
      outer.current.scale.setScalar(1 - 0.55 * p);
      outer.current.rotation.y = p * Math.PI * 1.2;
      outer.current.position.y = p * 0.9;
    }
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 6]} intensity={2.0} />
      <directionalLight position={[-5, 2, 3]} intensity={0.6} color="#fff3e6" />
      <directionalLight position={[-3, 3, -6]} intensity={1.6} color="#FF6B1A" />
      <group ref={outer}>
        <group ref={tilt}>
          <group ref={spin}>
            <group ref={cubeRoot}>
              {coords.map(([x, y, z]) => (
                <Cubie key={`${x}${y}${z}`} x={x} y={y} z={z} stickerGeo={stickerGeo} baseMats={baseMats} labelTex={labelTex} />
              ))}
            </group>
          </group>
        </group>
      </group>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Póster estático (carga y sin WebGL)                                 */
/* ------------------------------------------------------------------ */

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

interface CubeProps {
  scrollRef: MutableRefObject<number>;
  onCaption: (t: string) => void;
  className?: string;
}

export default function Cube({ scrollRef, onCaption, className = '' }: CubeProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [gl, setGl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const [docVisible, setDocVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [forceSolved, setForceSolved] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const drag = useRef<DragState>({ vx: 0, vy: 0, dx: 0, dy: 0, last: 0, active: false });
  const pdata = useRef<{ id: number; x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    setGl(hasWebGL());
    setNarrow(window.innerWidth < 768);
    setForceSolved(new URLSearchParams(window.location.search).has('solved'));
    const onVis = () => setDocVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    pdata.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
    drag.current.vx = 0;
    drag.current.vy = 0;
    drag.current.active = true;
    drag.current.last = performance.now();
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pdata.current;
    if (!p || p.id !== e.pointerId) return;
    const now = performance.now();
    const dt = Math.max(1, now - p.t) / 1000;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    drag.current.dx += dx;
    drag.current.dy += dy;
    drag.current.vx = (dx * 0.011) / dt;
    drag.current.vy = (dy * 0.011) / dt;
    drag.current.last = now;
    pdata.current = { id: p.id, x: e.clientX, y: e.clientY, t: now };
  };
  const up = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pdata.current?.id !== e.pointerId) return;
    const now = performance.now();
    if (now - pdata.current.t > 90) {
      drag.current.vx = 0;
      drag.current.vy = 0;
    }
    pdata.current = null;
    drag.current.active = false;
    drag.current.last = now;
  };

  return (
    <div
      ref={wrap}
      className={`relative select-none ${className}`}
      style={{ touchAction: 'pan-y' }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      data-cursor="ARRASTRA"
    >
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center p-[10%]">
          <CubePoster />
        </div>
      )}
      {gl && (
        <Canvas
          flat
          dpr={[1, 2]}
          frameloop={visible && docVisible ? 'always' : 'never'}
          camera={{ position: [0, 0, narrow ? 10.2 : 11.5], fov: 30 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={() => setReady(true)}
          role="img"
          aria-label="Cubo de Rubik 3D interactivo: se mezcla, se resuelve y muestra las tecnologías que uso"
        >
          <CubeScene scrollRef={scrollRef} onCaption={onCaption} forceSolved={forceSolved} dragRef={drag} />
        </Canvas>
      )}
    </div>
  );
}
