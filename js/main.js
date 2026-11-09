// Punto de entrada: navbar, revelado, galería, teclado y carga del cubo 3D.
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Navbar: fondo al hacer scroll, menú móvil y enlace activo ---------- */
function initNav() {
  const nav = $('#nav'), toggle = $('#nav-toggle');
  const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 12);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  $$('.nav__menu a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  const links = new Map($$('[data-link]').map((a) => [a.dataset.link, a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.remove('is-active'));
      links.get(en.target.id)?.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

/* ---------- Revelado con IntersectionObserver ---------- */
function initReveal() {
  const items = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach((el) => io.observe(el));
}

/* ---------- Galería del proyecto 01 ---------- */
function initGallery() {
  const main = $('#p1-main');
  $$('.thumb').forEach((btn) => btn.addEventListener('click', () => {
    if (btn.classList.contains('is-active')) return;
    $$('.thumb').forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('is-active'); btn.setAttribute('aria-pressed', 'true');
    main.classList.add('is-fading');
    setTimeout(() => { main.src = btn.dataset.src; main.alt = btn.dataset.alt; main.classList.remove('is-fading'); }, reduced ? 0 : 200);
  }));
}

/* ---------- Teclado 3D: leyenda al pasar o tocar una tecla ---------- */
function initKeyboard() {
  const caption = $('#kb-caption');
  const show = (k) => {
    caption.textContent = '';
    const b = document.createElement('b'); b.textContent = k.textContent;
    caption.append(b, ' · ', k.dataset.cat);
  };
  $$('.key').forEach((k) => {
    ['pointerenter', 'focus'].forEach((ev) => k.addEventListener(ev, () => show(k)));
    k.addEventListener('click', () => {
      show(k); k.classList.add('is-pressed');
      setTimeout(() => k.classList.remove('is-pressed'), 260);
    });
  });
}

/* ---------- Cubo 3D (con respaldo CSS si falla WebGL o Three.js) ---------- */
function buildFallbackCube(stage) {
  const host = $('#cube-host');
  host.hidden = false;
  const colors = ['#FF7A1A', '#2B4EFF', '#EEF1FA', '#1b2030', '#6F8DFF', '#FFB35C'];
  const labels = ['JS', 'TS', 'React', 'Py', 'SQL', 'PG', 'API', 'IA', 'Node', 'Git', 'PHP', 'CSS'];
  const wrap = document.createElement('div');
  wrap.className = 'cube-fallback';
  const cube = document.createElement('div');
  cube.className = 'fb-cube';
  colors.forEach((c, f) => {
    const face = document.createElement('div');
    face.className = `fb-face fb-face--${f + 1}`;
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('i');
      cell.style.setProperty('--c', c);
      if ((i + f) % 3 === 0) { cell.textContent = labels[(i * 2 + f) % labels.length]; if (c === '#EEF1FA' || c === '#FFB35C' || c === '#6F8DFF' || c === '#FF7A1A') cell.style.color = '#07080c'; }
      face.appendChild(cell);
    }
    cube.appendChild(face);
  });
  wrap.appendChild(cube);
  host.replaceChildren(wrap);
  stage.classList.add('no-webgl');
}

async function initCube() {
  const stage = $('#cube-stage');
  try {
    const { initCube: start } = await import('./cube.js');
    start($('#cube-host'), { reduced });
  } catch (err) {
    console.info('Cubo 3D no disponible, se usa el respaldo CSS.', err && err.message);
    buildFallbackCube(stage);
  }
}

initNav();
initReveal();
initGallery();
initKeyboard();
initCube();
