'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { especialidades, type DemoKind } from '@/data/especialidad';
import InterfacesDemo from './demos/InterfacesDemo';
import ApiDemo from './demos/ApiDemo';
import SqlDemo from './demos/SqlDemo';
import ChatDemo from './demos/ChatDemo';
import { useInView, usePrefersReducedMotion, useTween } from '@/lib/hooks';

const DURATION = 11000;
const IDLE = 10000;

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setT(value), 250);
    return () => window.clearTimeout(id);
  }, [value]);
  const n = useTween(t, 1100);
  return <span className="tabular-nums">{Math.round(n)}{suffix}</span>;
}

function Demo({ kind }: { kind: DemoKind }) {
  switch (kind) {
    case 'interfaces':
      return <InterfacesDemo />;
    case 'api':
      return <ApiDemo />;
    case 'datos':
      return <SqlDemo />;
    case 'ia':
      return <ChatDemo />;
  }
}

export default function Especialidad() {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const inView = useInView(root);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const bar = useRef<HTMLSpanElement | null>(null);
  const prog = useRef(0);
  const hover = useRef(false);
  const lastAct = useRef(-1e9);
  const pausedRef = useRef(false);

  /* parallax del ratón sobre la ventana */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 90, damping: 18 });
  const smy = useSpring(my, { stiffness: 90, damping: 18 });
  const rotY = useTransform(smx, [-0.5, 0.5], [-5, 5]);
  const rotX = useTransform(smy, [-0.5, 0.5], [4, -4]);
  const gridX = useTransform(smx, [-0.5, 0.5], [18, -18]);
  const gridY = useTransform(smy, [-0.5, 0.5], [12, -12]);
  const innerX = useTransform(smx, [-0.5, 0.5], [-5, 5]);
  const innerY = useTransform(smy, [-0.5, 0.5], [-4, 4]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-esp-title] span', {
        yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 75%', once: true },
      });
      gsap.from('[data-esp-row]', {
        opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: '[data-esp-list]', start: 'top 85%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  /* avance automático con barra de progreso; se pausa con hover/interacción y reanuda tras 10 s de calma */
  useEffect(() => {
    prog.current = 0;
    if (bar.current) bar.current.style.transform = 'scaleX(0)';
    if (reduced || !inView) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      const p = hover.current || now - lastAct.current < IDLE;
      if (p !== pausedRef.current) {
        pausedRef.current = p;
        setPaused(p);
      }
      if (!p) prog.current += dt;
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, prog.current / DURATION)})`;
      if (prog.current >= DURATION) {
        prog.current = 0;
        setActive((a) => (a + 1) % especialidades.length);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, inView, reduced]);

  const act = useCallback(() => {
    lastAct.current = performance.now();
  }, []);

  const pick = useCallback((i: number) => {
    lastAct.current = performance.now();
    setActive(i);
  }, []);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = especialidades.length;
    let next = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % n;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + n) % n;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = n - 1;
    if (next >= 0) {
      e.preventDefault();
      pick(next);
      tabRefs.current[next]?.focus();
    }
  };

  const onWindowMove = (e: React.PointerEvent<HTMLDivElement>) => {
    act();
    if (reduced || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onWindowLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const cur = especialidades[active];

  return (
    <section ref={root} id="especialidad" aria-labelledby="esp-title" className="rule relative py-24 md:py-40">
      <div className="wrap">
        <div className="flex items-end justify-between">
          <p className="mono text-muted">(02) ESPECIALIDAD</p>
          <p className="mono hidden text-muted md:block">04 ÁREAS</p>
        </div>
        <h2 id="esp-title" data-esp-title className="display mt-6 text-[clamp(4rem,15vw,15rem)] md:mt-10">
          <span className="block overflow-hidden"><span className="block">LO QUE</span></span>
          <span className="block overflow-hidden"><span className="block">DOMINO<span className="text-accent">.</span></span></span>
        </h2>

        <div
          className="mt-14 grid grid-cols-1 gap-10 md:mt-24 md:grid-cols-12 md:gap-8"
          onPointerEnter={() => { hover.current = true; }}
          onPointerLeave={() => { hover.current = false; act(); }}
          onPointerDown={act}
          onKeyDown={act}
        >
          <div data-esp-list role="tablist" aria-label="Áreas de especialidad" aria-orientation="vertical" className="md:col-span-5">
            {especialidades.map((e, i) => {
              const on = i === active;
              return (
                <div key={e.id} data-esp-row className="border-t border-line last:border-b">
                  <button
                    ref={(el) => { tabRefs.current[i] = el; }}
                    type="button"
                    role="tab"
                    id={`tab-${e.id}`}
                    aria-selected={on}
                    aria-controls={on ? `panel-${e.id}` : undefined}
                    tabIndex={on ? 0 : -1}
                    onClick={() => pick(i)}
                    onKeyDown={(ev) => onKey(ev, i)}
                    className="group relative flex w-full items-baseline gap-4 py-5 text-left md:gap-5"
                  >
                    <span className={`mono transition-colors ${on ? 'text-accent' : 'text-muted'}`}>{e.num}</span>
                    <span className={`display text-[clamp(2rem,4.6vw,3.6rem)] transition-colors duration-300 ${on ? 'text-ink' : 'text-muted group-hover:text-ink'}`}>
                      {e.label}
                    </span>
                    <span className={`ml-auto self-center text-xl text-accent transition-transform duration-300 ${on ? 'rotate-45' : ''}`} aria-hidden="true">+</span>
                    {on && (
                      <>
                        <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-accent/15" aria-hidden="true" />
                        <span
                          ref={bar}
                          className={`absolute bottom-[-1px] left-0 h-[2px] w-full origin-left bg-accent shadow-[0_0_10px_1px_rgba(255,107,26,0.65)] ${paused ? 'opacity-60' : ''}`}
                          style={{ transform: reduced ? 'scaleX(1)' : 'scaleX(0)' }}
                          aria-hidden="true"
                          role="presentation"
                        />
                      </>
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-7 pl-0 md:pl-10">
                          <p className="text-xl font-semibold leading-snug md:text-2xl">{e.headline}</p>
                          <p className="mt-3 max-w-[34rem] text-ink/75">{e.text}</p>
                          {e.lines && (
                            <ol className="mt-5 space-y-3">
                              {e.lines.map((l, li) => (
                                <li key={li} className="flex gap-3 text-[0.95rem] text-ink/80">
                                  <span className="mono mt-[3px] shrink-0 text-accent">{String(li + 1).padStart(2, '0')}</span>
                                  <span>{l}</span>
                                </li>
                              ))}
                            </ol>
                          )}
                          <p className="mono mt-5 !normal-case !tracking-[0.06em] text-muted">{e.tech.join(' / ')}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="md:col-span-7">
            <div className="md:sticky md:top-24">
              <div style={{ perspective: 1400 }} onPointerMove={onWindowMove} onPointerLeave={onWindowLeave}>
                <motion.div
                  style={reduced ? undefined : { rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
                  className="border border-line bg-surface shadow-[0_30px_80px_-40px_rgba(255,107,26,0.45)]"
                >
                  <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                    <span className="flex gap-1.5" aria-hidden="true">
                      <i className="block h-2 w-2 border border-muted" /><i className="block h-2 w-2 border border-muted" /><i className="block h-2 w-2 bg-accent shadow-[0_0_8px_1px_rgba(255,107,26,0.8)]" />
                    </span>
                    <span className="mono truncate !normal-case !tracking-[0.06em] text-muted">{cur.windowTitle}</span>
                    <span className="mono ml-auto flex items-center gap-2 text-muted">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
                      <span className="hidden sm:inline">EN VIVO</span>
                    </span>
                  </div>
                  <div role="tabpanel" id={`panel-${cur.id}`} aria-labelledby={`tab-${cur.id}`} className="relative min-h-[26rem] overflow-hidden md:min-h-[34rem]">
                    {!reduced && (
                      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
                        <motion.div className="demo-grid absolute -inset-8 [mask-image:radial-gradient(75%_75%_at_50%_45%,#000,transparent)]" style={{ x: gridX, y: gridY }} />
                        <div className="demo-scan absolute inset-x-0 top-0 h-1/4" />
                      </div>
                    )}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={cur.id}
                        className="relative z-10"
                        initial={reduced ? false : { clipPath: 'inset(0 100% 0 0)', rotateY: -16, x: -24, opacity: 0.4 }}
                        animate={{ clipPath: 'inset(0 0% 0 0)', rotateY: 0, x: 0, opacity: 1 }}
                        exit={reduced ? undefined : { clipPath: 'inset(0 0 0 100%)', rotateY: 12, x: 16, opacity: 0.3 }}
                        transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
                        style={{ transformOrigin: '50% 50%' }}
                      >
                        <motion.div style={reduced ? undefined : { x: innerX, y: innerY }}>
                          <Demo kind={cur.id} />
                        </motion.div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4">
                {cur.stats.map((st) => (
                  <div key={cur.id + st.label}>
                    <dt className="display text-[clamp(2.4rem,5vw,3.6rem)] text-ink">
                      <CountUp value={st.value} suffix={st.suffix} />
                    </dt>
                    <dd className="mono mt-1 !normal-case !tracking-[0.04em] text-muted">{st.label}</dd>
                  </div>
                ))}
              </dl>
              <p className="mono mt-4 text-muted" aria-live="off">
                {reduced ? 'Elige un área' : paused ? 'En pausa · se reanuda tras 10 s sin actividad' : 'Avanza solo — toca para elegir'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
