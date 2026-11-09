// Cubo Rubik 3D del hero: se desordena, se resuelve solo y se puede arrastrar.
import * as THREE from 'three';

const S = 1;            // separación entre cubies
const BODY = 0.96;      // tamaño del cubie
const MOVE_TIME = 0.35; // segundos por giro de capa
const SCRAMBLE_MOVES = 12;
const LABELS = ['JS', 'TS', 'React', 'Py', 'SQL', 'PG', 'API', 'IA', 'Node', 'Git', 'PHP', 'CSS'];

// Colores por cara: naranja, azul rey y variaciones oscuras/blancas
const FACE_COLORS = {
  '1,0,0': { bg: '#FF7A1A', fg: '#0b0d14' },
  '-1,0,0': { bg: '#6F8DFF', fg: '#07080c' },
  '0,1,0': { bg: '#EEF1FA', fg: '#0b0d14' },
  '0,-1,0': { bg: '#1b2030', fg: '#ffffff' },
  '0,0,1': { bg: '#2B4EFF', fg: '#ffffff' },
  '0,0,-1': { bg: '#FFB35C', fg: '#07080c' },
};
const FACE_ROT = { // orientación del plano de cada pegatina
  '1,0,0': [0, Math.PI / 2, 0], '-1,0,0': [0, -Math.PI / 2, 0],
  '0,1,0': [-Math.PI / 2, 0, 0], '0,-1,0': [Math.PI / 2, 0, 0],
  '0,0,1': [0, 0, 0], '0,0,-1': [0, Math.PI, 0],
};

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Textura de pegatina: rectángulo redondeado con texto opcional
const texCache = new Map();
function stickerTexture(face, label) {
  const key = face.bg + (label || '');
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = 22;
  g.beginPath();
  g.roundRect ? g.roundRect(4, 4, 120, 120, r) : g.rect(4, 4, 120, 120);
  g.fillStyle = face.bg; g.fill();
  const grd = g.createLinearGradient(0, 0, 0, 128);
  grd.addColorStop(0, 'rgba(255,255,255,.22)'); grd.addColorStop(1, 'rgba(0,0,0,.18)');
  g.fillStyle = grd; g.fill();
  if (label) {
    g.fillStyle = face.fg;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const size = label.length > 3 ? 36 : 52;
    g.font = `700 ${size}px "Space Grotesk", "Inter", Arial, sans-serif`;
    g.fillText(label, 64, 68);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  texCache.set(key, t);
  return t;
}

// Geometría de cubie redondeado (sin addons: extrusión con bisel)
function roundedCubieGeometry() {
  const r = 0.09, inner = BODY - 2 * r, h = inner / 2, cr = 0.05;
  const s = new THREE.Shape();
  s.moveTo(-h + cr, -h); s.lineTo(h - cr, -h); s.quadraticCurveTo(h, -h, h, -h + cr);
  s.lineTo(h, h - cr); s.quadraticCurveTo(h, h, h - cr, h);
  s.lineTo(-h + cr, h); s.quadraticCurveTo(-h, h, -h, h - cr);
  s.lineTo(-h, -h + cr); s.quadraticCurveTo(-h, -h, -h + cr, -h);
  const geo = new THREE.ExtrudeGeometry(s, { depth: inner, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 3, curveSegments: 4 });
  geo.center();
  return geo;
}

export function initCube(host, { reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);

  // Luces: base + resplandor naranja y azul de la marca
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(3, 6, 8); scene.add(key);
  const orangeL = new THREE.PointLight(0xff7a1a, 90, 0, 2); orangeL.position.set(-6, 2, 5); scene.add(orangeL);
  const blueL = new THREE.PointLight(0x2b4eff, 110, 0, 2); blueL.position.set(6, -3, 4); scene.add(blueL);
  const rim = new THREE.PointLight(0x4a68ff, 70, 0, 2); rim.position.set(0, 5, -6); scene.add(rim);

  // Estructura: root (arrastre) > cubeGroup (cubies) > pivot (capa que gira)
  const root = new THREE.Group();
  root.rotation.set(0.5, -0.7, 0);
  scene.add(root);
  const cubeGroup = new THREE.Group(); root.add(cubeGroup);
  const pivot = new THREE.Group(); cubeGroup.add(pivot);

  const bodyGeo = roundedCubieGeometry();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f121b, roughness: 0.4, metalness: 0.55 });
  const stickerGeo = new THREE.PlaneGeometry(0.74, 0.74);
  const stickerMats = new Map();
  const cubies = [];
  let labelIdx = 0;

  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    const cubie = new THREE.Group();
    cubie.position.set(x * S, y * S, z * S);
    cubie.add(new THREE.Mesh(bodyGeo, bodyMat));
    for (const n of [[x, 1, 0, 0], [x, -1, 0, 0]].concat([[y, 0, 1, 0], [y, 0, -1, 0]], [[z, 0, 0, 1], [z, 0, 0, -1]])) {
      const [coord, nx, ny, nz] = n;
      const sign = nx + ny + nz;
      if (coord !== sign) continue; // solo caras exteriores
      const k = `${nx},${ny},${nz}`;
      const face = FACE_COLORS[k];
      // ~55% de las pegatinas llevan etiqueta tecnológica
      const label = ((x * 7 + y * 13 + z * 5 + Math.abs(nx) * 3 + ny * 2 + nz) & 3) !== 0 || (x === 0 && y === 0 && nz === 1) ? LABELS[labelIdx++ % LABELS.length] : null;
      const tex = stickerTexture(face, label);
      let mat = stickerMats.get(tex.uuid);
      if (!mat) {
        mat = new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.05, roughness: 0.38, metalness: 0.05, transparent: true, alphaTest: 0.02 });
        stickerMats.set(tex.uuid, mat);
      }
      const m = new THREE.Mesh(stickerGeo, mat);
      m.rotation.set(...FACE_ROT[k]);
      m.position.set(nx, ny, nz).multiplyScalar(BODY / 2 + 0.004);
      cubie.add(m);
    }
    cubeGroup.add(cubie);
    cubies.push(cubie);
  }

  // ---- Giros de capa ----
  const AXES = ['x', 'y', 'z'];
  const randMove = (prev) => {
    let m;
    do { m = { axis: (Math.random() * 3) | 0, layer: ((Math.random() * 3) | 0) - 1, dir: Math.random() < 0.5 ? -1 : 1 }; }
    while (prev && prev.axis === m.axis && prev.layer === m.layer);
    return m;
  };
  const snapQ = new THREE.Matrix4();
  function beginMove(m) {
    pivot.rotation.set(0, 0, 0);
    const comp = AXES[m.axis];
    for (const c of cubies) if (Math.round(c.position[comp] / S) === m.layer) pivot.attach(c);
  }
  function endMove() {
    pivot.updateMatrixWorld(true);
    for (const c of [...pivot.children]) {
      cubeGroup.attach(c);
      c.position.set(Math.round(c.position.x / S) * S, Math.round(c.position.y / S) * S, Math.round(c.position.z / S) * S);
      snapQ.makeRotationFromQuaternion(c.quaternion);
      snapQ.elements = snapQ.elements.map((v) => (Math.abs(v) < 1e-4 ? 0 : Math.round(v)));
      c.quaternion.setFromRotationMatrix(snapQ);
    }
    pivot.rotation.set(0, 0, 0);
  }

  // ---- Máquina de estados: desordenar > pausa > resolver > brillo ----
  let phase = 'start', timer = 0.9, seq = [], idx = 0, cur = null, pulse = 0, pulseT = 0;
  function stepAnim(dt) {
    if (cur) {
      cur.t += dt;
      const k = Math.min(cur.t / MOVE_TIME, 1);
      pivot.rotation[AXES[cur.m.axis]] = ease(k) * cur.m.dir * Math.PI / 2;
      if (k >= 1) { endMove(); cur = null; idx++; }
      return;
    }
    if (timer > 0) { timer -= dt; return; }
    if (phase === 'start') {
      seq = []; for (let i = 0; i < SCRAMBLE_MOVES; i++) seq.push(randMove(seq[i - 1]));
      phase = 'scramble'; idx = 0;
    } else if (phase === 'scramble' || phase === 'solve') {
      if (idx < seq.length) { cur = { m: seq[idx], t: 0 }; beginMove(cur.m); }
      else if (phase === 'scramble') { phase = 'hold'; timer = 1.0; }
      else { phase = 'solved'; timer = 1.6; pulseT = 0; }
    } else if (phase === 'hold') {
      seq = seq.slice().reverse().map((m) => ({ ...m, dir: -m.dir })); // secuencia inversa
      phase = 'solve'; idx = 0;
    } else if (phase === 'solved') { phase = 'start'; timer = 0.5; }
  }

  // ---- Arrastre con puntero (ratón y táctil) ----
  const host2 = renderer.domElement;
  host2.style.touchAction = 'pan-y';
  let dragging = false, lx = 0, ly = 0, lt = 0, vx = 0, vy = 0;
  const qa = new THREE.Quaternion(), AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0);
  const spin = (rx, ry) => {
    root.quaternion.premultiply(qa.setFromAxisAngle(AY, ry));
    root.quaternion.premultiply(qa.setFromAxisAngle(AX, rx));
  };
  host2.addEventListener('pointerdown', (e) => {
    dragging = true; lx = e.clientX; ly = e.clientY; lt = e.timeStamp; vx = vy = 0;
    try { host2.setPointerCapture(e.pointerId); } catch (_) { /* sin captura */ }
  });
  host2.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dt = Math.max((e.timeStamp - lt) / 1000, 0.008);
    const dx = (e.clientX - lx) * 0.012, dy = (e.clientY - ly) * 0.012;
    spin(dy, dx);
    vx = vx * 0.5 + (dy / dt) * 0.5; vy = vy * 0.5 + (dx / dt) * 0.5;
    lx = e.clientX; ly = e.clientY; lt = e.timeStamp;
  });
  const endDrag = () => { dragging = false; };
  host2.addEventListener('pointerup', endDrag);
  host2.addEventListener('pointercancel', endDrag);
  host2.addEventListener('lostpointercapture', endDrag);

  // ---- Tamaño ----
  function resize() {
    const w = host.clientWidth || 300, h = host.clientHeight || 300;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const dist = Math.max(9.0, 8.4 / camera.aspect);
    camera.position.set(0, 0, dist);
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(host); resize();

  // ---- Bucle (se pausa fuera de pantalla o con la pestaña oculta) ----
  let visible = true, raf = 0, last = performance.now();
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(host);
  const pulseMats = [...stickerMats.values()];
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (!reduced) stepAnim(dt);
    if (!dragging) {
      spin(vx * dt, vy * dt + (reduced ? 0 : 0.22 * dt));
      const damp = Math.pow(0.04, dt); vx *= damp; vy *= damp;
    }
    // brillo al resolverse
    if (phase === 'solved') { pulseT += dt; pulse = Math.sin(Math.min(pulseT / 1.6, 1) * Math.PI); }
    else pulse *= Math.pow(0.001, dt);
    for (const m of pulseMats) m.emissiveIntensity = 0.05 + pulse * 0.5;
    orangeL.intensity = 90 + pulse * 140; blueL.intensity = 110 + pulse * 140;
    host.parentElement.style.setProperty('--pulse', pulse.toFixed(3));
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  return {
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); host2.remove(); },
  };
}
