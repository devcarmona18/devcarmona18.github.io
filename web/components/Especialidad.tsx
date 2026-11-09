'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { especialidades, type DemoKind } from '@/data/especialidad';
import InterfacesDemo from './demos/InterfacesDemo';
import ApiDemo from './demos/ApiDemo';
import SqlDemo from './demos/SqlDemo';
import ChatDemo from './demos/ChatDemo';
import { useInView } from '@/lib/hooks';

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
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const inView = useInView(root);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  useEffect(() => {
    if (touched || !inView) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % especialidades.length), 7000);
    return () => window.clearTimeout(id);
  }, [active, touched, inView]);

  const pick = useCallback((i: number) => {
    setTouched(true);
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

        <div className="mt-14 grid grid-cols-1 gap-10 md:mt-24 md:grid-cols-12 md:gap-8">
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
                    {on && !touched && inView && (
                      <motion.span
                        key={`bar-${active}`}
                        className="absolute bottom-[-1px] left-0 h-px bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 7, ease: 'linear' }}
                      />
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
              <div className="border border-line bg-surface">
                <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <i className="block h-2 w-2 border border-muted" /><i className="block h-2 w-2 border border-muted" /><i className="block h-2 w-2 bg-accent" />
                  </span>
                  <span className="mono truncate !normal-case !tracking-[0.06em] text-muted">{cur.windowTitle}</span>
                  <span className="mono ml-auto hidden text-muted sm:inline">EN VIVO</span>
                </div>
                <div role="tabpanel" id={`panel-${cur.id}`} aria-labelledby={`tab-${cur.id}`} className="relative overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={cur.id}
                      initial={{ clipPath: 'inset(0 0 100% 0)', scale: 1.05 }}
                      animate={{ clipPath: 'inset(0 0 0% 0)', scale: 1 }}
                      exit={{ clipPath: 'inset(100% 0 0 0)', scale: 0.98 }}
                      transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <Demo kind={cur.id} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <p className="mono mt-3 text-muted">{touched ? 'Elige un área' : 'Avanza solo cada 7 s — toca para elegir'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
