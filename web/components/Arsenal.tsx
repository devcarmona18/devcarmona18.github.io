'use client';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tools, usedInList, portfolioRow, type Tool } from '@/data/arsenal';
import { projects } from '@/data/projects';
import { ICONS } from '@/data/icons';
import { useInView, usePrefersReducedMotion } from '@/lib/hooks';

const byId = new Map<string, Tool>(tools.map((t) => [t.id, t]));
const rowNum = (id: string) => projects.find((p) => p.id === id)?.num ?? '+';
const IDLE = 6000;
const CYCLE = 3500;

function Terminal({ tool }: { tool: Tool }) {
  const full = tool.snippet.join('\n');
  const [shown, setShown] = useState(full);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(full);
      return;
    }
    let i = 0;
    setShown('');
    const id = window.setInterval(() => {
      i += 2;
      setShown(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 12);
    return () => window.clearInterval(id);
  }, [full]);
  const done = shown.length >= full.length;
  return (
    <div className="panel-dark border border-line shadow-[0_40px_90px_-50px_rgba(10,10,10,0.55)]">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <i className="block h-2 w-2 border border-muted" /><i className="block h-2 w-2 border border-muted" /><i className="block h-2 w-2 bg-accent" />
        </span>
        <span className="mono truncate !normal-case !tracking-[0.04em] text-muted">{tool.file}</span>
        <span className="mono ml-auto hidden text-accent sm:inline">{tool.label}</span>
      </div>
      <pre className={`mono min-h-[10.5rem] overflow-x-auto whitespace-pre !normal-case !tracking-[0.01em] p-4 text-[11.5px] leading-[1.65] text-ink md:text-[13px] ${done ? '' : 'caret'}`} aria-label={`Fragmento de código real de ${tool.label}`}>
        {shown}
      </pre>
      <p className="mono border-t border-line px-4 py-2 !normal-case !tracking-[0.04em] text-muted">Código real · {tool.file}</p>
    </div>
  );
}

interface TileProps {
  tool: Tool;
  index: number;
  on: boolean;
  onPick: (id: string, byHover: boolean) => void;
  reg: (id: string, el: HTMLDivElement | null) => void;
}

function Tile({ tool, index, on, onPick, reg }: TileProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 });
  const sy = useSpring(y, { stiffness: 220, damping: 16 });
  const ic = ICONS[tool.icon];
  const move = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.28);
  };
  const leave = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <div
      ref={(el) => reg(tool.id, el)}
      data-tile={tool.id}
      className="tile-float w-[84px] shrink-0 snap-center lg:w-auto"
      style={{ ['--fd' as string]: `${4.2 + (index % 5) * 0.55}s`, ['--fl' as string]: `-${((index * 0.83) % 4.5).toFixed(2)}s` }}
    >
      <motion.button
        type="button"
        style={{ x: sx, y: sy }}
        onClick={() => onPick(tool.id, false)}
        onFocus={() => onPick(tool.id, false)}
        onPointerEnter={(e) => e.pointerType === 'mouse' && onPick(tool.id, true)}
        onPointerMove={move}
        onPointerLeave={leave}
        aria-pressed={on}
        aria-label={tool.label}
        className={`relative flex h-[92px] w-full flex-col items-center justify-center gap-2 border px-1 transition-[border-color,background-color,box-shadow] duration-300 lg:aspect-square lg:h-auto ${
          on ? 'border-accent bg-accent/[0.07] shadow-[0_12px_28px_-10px_rgb(var(--accent)/0.55)]' : 'border-line bg-surface hover:border-ink/30'
        }`}
      >
        <svg viewBox="0 0 24 24" className={`h-7 w-7 transition-[color,transform] duration-300 lg:h-9 lg:w-9 ${on ? 'scale-110 text-accent' : 'text-ink/85'}`} fill="currentColor" aria-hidden="true">
          <path d={ic.path} />
        </svg>
        <span className={`mono max-w-full truncate !normal-case !tracking-[0.02em] text-[10px] leading-none transition-colors ${on ? 'text-ink' : 'text-muted'}`}>{tool.label}</span>
      </motion.button>
    </div>
  );
}

interface Beam {
  id: string;
  d: string;
  ex: number;
  ey: number;
}

export default function Arsenal() {
  const root = useRef<HTMLElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const tileEls = useRef(new Map<string, HTMLDivElement>());
  const rowEls = useRef(new Map<string, HTMLLIElement>());
  const inView = useInView(root, '-10% 0px');
  const reduced = usePrefersReducedMotion();
  const [sel, setSel] = useState<string>('postgresql');
  const [desktop, setDesktop] = useState(false);
  const [beams, setBeams] = useState<Beam[]>([]);
  const [tick, setTick] = useState(0);
  const lastAct = useRef(0);
  const hovering = useRef(false);

  const tool = byId.get(sel) ?? tools[0];
  const used = useMemo(() => new Set(tool.usedIn), [tool]);

  const pick = useCallback((id: string, byHover: boolean) => {
    lastAct.current = performance.now();
    if (byHover) hovering.current = true;
    setSel(id);
  }, []);

  const reg = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) tileEls.current.set(id, el);
    else tileEls.current.delete(id);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  /* ciclo automático mientras está en reposo y a la vista */
  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => {
      if (hovering.current || performance.now() - lastAct.current < IDLE) return;
      setSel((cur) => {
        const i = tools.findIndex((t) => t.id === cur);
        return tools[(i + 1) % tools.length].id;
      });
    }, CYCLE);
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  /* móvil: centra la ficha activa dentro de la tira, sin mover la página */
  useEffect(() => {
    if (desktop) return;
    const sc = scroller.current;
    const el = tileEls.current.get(sel);
    if (!sc || !el) return;
    sc.scrollTo({ left: el.offsetLeft - (sc.clientWidth - el.clientWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
  }, [sel, desktop, reduced]);

  /* geometría de los haces (solo escritorio) */
  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTick((n) => n + 1));
    ro.observe(el);
    const t = window.setTimeout(() => setTick((n) => n + 1), 1400);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  useLayoutEffect(() => {
    const b = board.current;
    const tEl = tileEls.current.get(sel);
    if (!desktop || !b || !tEl) {
      setBeams([]);
      return;
    }
    const br = b.getBoundingClientRect();
    const tr = tEl.getBoundingClientRect();
    const cx = tr.left - br.left + tr.width / 2;
    const cy = tr.top - br.top + tr.height / 2;
    const out: Beam[] = [];
    tool.usedIn.forEach((pid) => {
      const r = rowEls.current.get(pid);
      if (!r) return;
      const rr = r.getBoundingClientRect();
      const ex = rr.left - br.left - 4;
      const ey = rr.top - br.top + rr.height / 2;
      const mx = cx + (ex - cx) * 0.62;
      out.push({ id: pid, d: `M${cx.toFixed(1)},${cy.toFixed(1)} C${mx.toFixed(1)},${cy.toFixed(1)} ${(ex - (ex - cx) * 0.3).toFixed(1)},${ey.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`, ex, ey });
    });
    setBeams(out);
  }, [sel, desktop, tick, tool]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-ars-title] span', {
        yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 75%', once: true },
      });
      gsap.from(board.current, {
        opacity: 0, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: board.current, start: 'top 90%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const rows = [...usedInList, portfolioRow];

  return (
    <section ref={root} id="arsenal" aria-labelledby="ars-title" className="rule relative overflow-hidden py-24 md:py-40">
      <div className="wrap">
        <p className="mono text-muted">(03) ARSENAL</p>
        <h2 id="ars-title" data-ars-title className="display mt-6 text-[clamp(2.1rem,6.5vw,6.9rem)] md:mt-10">
          <span className="block -mt-[0.18em] overflow-hidden pt-[0.18em]"><span className="block">TECNOLOGÍA EN</span></span>
          <span className="block -mt-[0.1em] overflow-hidden pt-[0.18em]"><span className="block"><span className="text-accent">PRODUCCIÓN</span></span></span>
        </h2>
        <p className="mt-6 max-w-xl text-lg text-ink/80 md:mt-10 md:text-xl">Cada herramienta, conectada al proyecto donde la usé.</p>

        <div
          ref={board}
          className="relative mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.25fr)_clamp(70px,9vw,140px)_minmax(0,1fr)] lg:gap-0"
          onPointerLeave={() => { hovering.current = false; lastAct.current = performance.now(); }}
        >
          {desktop && (
            <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" aria-hidden="true">
              {beams.map((bm, i) => (
                <g key={`${sel}-${bm.id}`}>
                  <motion.path
                    d={bm.d}
                    fill="none"
                    className="stroke-accent"
                    strokeOpacity="0.5"
                    strokeWidth="1.2"
                    initial={reduced ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <path d={bm.d} pathLength={1} fill="none" strokeWidth="2.4" strokeLinecap="round" className="beam-pulse stroke-accentHover" style={{ filter: 'drop-shadow(0 0 4px rgb(var(--accent-hover) / 0.6))', animationDelay: `${0.7 + i * 0.12}s` }} />
                  <circle cx={bm.ex} cy={bm.ey} r="3.5" className="fill-accent" />
                  {!reduced && (
                    <circle cx={bm.ex} cy={bm.ey} r="3.5" fill="none" className="stroke-accent">
                      <animate attributeName="r" values="3.5;13" dur="1.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0" dur="1.6s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              ))}
            </svg>
          )}

          <div className="relative z-10 min-w-0">
            <p className="mono mb-4 hidden text-muted lg:block">TECNOLOGÍAS · {String(tools.length).padStart(2, '0')}</p>
            <div
              ref={scroller}
              role="group"
              aria-label="Tecnologías. Elige una para ver en qué proyectos la usé"
              className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] md:-mx-8 md:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0 xl:grid-cols-6 [&::-webkit-scrollbar]:hidden"
            >
              {tools.map((t, i) => (
                <Tile key={t.id} tool={t} index={i} on={sel === t.id} onPick={pick} reg={reg} />
              ))}
            </div>
          </div>

          <div className="hidden lg:block" aria-hidden="true" />

          <div className="relative z-10 min-w-0">
            <p className="mono mb-4 flex items-center justify-between text-muted">
              <span>USADO EN</span>
              <span className="text-accent" aria-live="polite">{tool.label} · {String(tool.usedIn.length).padStart(2, '0')} {tool.usedIn.length === 1 ? 'PROYECTO' : 'PROYECTOS'}</span>
            </p>
            <ul className="border-t border-line">
              {rows.map((p) => {
                const on = used.has(p.id);
                const extra = p.id === portfolioRow.id;
                return (
                  <li
                    key={p.id}
                    ref={(el) => {
                      if (el) rowEls.current.set(p.id, el);
                      else rowEls.current.delete(p.id);
                    }}
                    className={`relative flex items-center gap-4 border-b border-line transition-[background-color] duration-500 ${extra ? 'py-3' : 'py-4 lg:py-5'} ${on ? 'bg-accent/[0.06]' : ''}`}
                  >
                    <span className={`mono w-6 shrink-0 pl-1 transition-colors duration-300 ${on ? 'text-accent' : 'text-muted/50'}`}>{rowNum(p.id)}</span>
                    <span className={`display min-w-0 truncate transition-colors duration-300 ${extra ? 'text-[0.95rem]' : 'text-[clamp(1.05rem,1.6vw,1.5rem)]'} ${on ? 'text-ink' : 'text-muted/40'}`}>{p.name}</span>
                    <span className={`mono ml-auto shrink-0 pr-1 transition-opacity duration-300 ${on ? 'text-accent opacity-100' : 'opacity-0'}`}>● EN USO</span>
                    <span
                      className="absolute bottom-[-1px] left-0 h-[2px] w-full origin-left bg-accent shadow-[0_0_8px_0_rgb(var(--accent)/0.45)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] lg:hidden"
                      style={{ transform: `scaleX(${on ? 0.38 : 0})` }}
                      aria-hidden="true"
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 lg:mt-14"><Terminal tool={tool} /></div>
      </div>
    </section>
  );
}
