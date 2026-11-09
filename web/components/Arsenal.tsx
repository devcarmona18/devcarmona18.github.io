'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tools, toolRows, usedInList, type Tool } from '@/data/arsenal';
import { useInView } from '@/lib/hooks';

const byId = new Map<string, Tool>(tools.map((t) => [t.id, t]));
const ROW_ROT = [-0.5, 0.35, -0.25, 0.5];

function Terminal({ tool, runKey }: { tool: Tool; runKey: number }) {
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
  }, [full, runKey]);
  const done = shown.length >= full.length;
  return (
    <div className="border border-line bg-surface">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <i className="block h-2 w-2 border border-muted" /><i className="block h-2 w-2 border border-muted" /><i className="block h-2 w-2 bg-accent" />
        </span>
        <span className="mono truncate !normal-case !tracking-[0.04em] text-muted">{tool.file}</span>
      </div>
      <pre className={`mono min-h-[10.5rem] overflow-x-auto whitespace-pre !normal-case !tracking-[0.01em] p-4 text-[11.5px] leading-[1.65] text-ink md:text-[13px] ${done ? '' : 'caret'}`} aria-label={`Fragmento de código real de ${tool.label}`}>
        {shown}
      </pre>
    </div>
  );
}

export default function Arsenal() {
  const root = useRef<HTMLElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const inView = useInView(root, '-10% 0px');
  const [sel, setSel] = useState<string>('postgresql');
  const [pressed, setPressed] = useState<string | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [wave, setWave] = useState(false);
  const pressTimer = useRef<number | undefined>(undefined);

  const tool = byId.get(sel) ?? tools[0];

  const press = (id: string) => {
    setSel(id);
    setRunKey((n) => n + 1);
    setPressed(id);
    window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => setPressed(null), 170);
  };

  // teclado físico: primera letra, repite para recorrer coincidencias
  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const ch = e.key.toLowerCase();
      if (!/[a-z]/.test(ch)) return;
      const matches = tools.filter((x) => x.label.toLowerCase().startsWith(ch));
      if (!matches.length) return;
      const idx = matches.findIndex((m) => m.id === sel);
      press(matches[(idx + 1) % matches.length].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, sel]);

  // ola ocasional
  useEffect(() => {
    if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let off: number | undefined;
    const id = window.setInterval(() => {
      setWave(true);
      off = window.setTimeout(() => setWave(false), 1700);
    }, 5200);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(off);
    };
  }, [inView]);

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
        rotateX: 70, y: 80, opacity: 0, duration: 1.3, ease: 'expo.out',
        scrollTrigger: { trigger: board.current, start: 'top 90%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const order = useMemo(() => {
    let n = 0;
    return toolRows.map((r) => r.map((id) => ({ id, i: n++ })));
  }, []);

  return (
    <section ref={root} id="arsenal" aria-labelledby="ars-title" className="rule relative overflow-hidden py-24 md:py-40">
      <div className="wrap">
        <p className="mono text-muted">(03) ARSENAL</p>
        <h2 id="ars-title" data-ars-title className="display mt-6 text-[clamp(3rem,9.4vw,10rem)] md:mt-10">
          <span className="block overflow-hidden"><span className="block">LAS HERRAMIENTAS</span></span>
          <span className="block overflow-hidden"><span className="block">CON LAS QUE <span className="text-accent">ENTREGO</span></span></span>
        </h2>
        <p className="mt-6 max-w-xl text-lg text-ink/80 md:mt-10 md:text-xl">No te explico qué es cada una. Te muestro dónde la usé.</p>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10">
          {/* teclado */}
          <div className="lg:col-span-8" style={{ perspective: '1500px' }}>
            <div
              ref={board}
              className="relative border border-line bg-[#0d0d0d] p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] md:p-6 lg:[transform:rotateX(20deg)_rotateZ(-1.5deg)]"
              style={{ transformStyle: 'preserve-3d', transformOrigin: '50% 60%', backgroundImage: 'radial-gradient(80% 60% at 50% 0%, rgba(255,107,26,0.07), transparent 70%)' }}
              role="group"
              aria-label="Teclado de herramientas. Pulsa una tecla o escribe su primera letra"
            >
              <div className="grid grid-cols-4 gap-x-2 gap-y-4 lg:block lg:space-y-4">
                {order.map((row, ri) => (
                  <div key={ri} className="contents lg:flex lg:flex-wrap lg:gap-x-3 lg:[transform:rotate(var(--rot))]" style={{ ['--rot' as string]: `${ROW_ROT[ri]}deg` }}>
                    {row.map(({ id, i }) => {
                      const t = byId.get(id);
                      if (!t) return null;
                      const on = sel === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => press(id)}
                          aria-pressed={on}
                          data-pressed={pressed === id || undefined}
                          style={{ ['--i' as string]: i % 11 + Math.floor(i / 6) }}
                          className={`keycap mono !normal-case !tracking-[0.02em] flex h-[62px] items-center justify-center px-1 text-center text-[11px] leading-tight lg:h-[84px] lg:w-[calc((100%-3.75rem)/6)] lg:text-[13px] ${wave ? 'wave' : ''} ${on ? '!text-accent' : ''}`}
                        >
                          <span className="relative z-10">{t.label}</span>
                          {on && <span className="absolute inset-x-3 bottom-2 z-10 h-px bg-accent" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <p className="mono mt-8 hidden text-muted lg:block">Escribe la primera letra o haz clic · repite para recorrer</p>
          </div>

          {/* usado en */}
          <div className="lg:col-span-4">
            <p className="mono text-muted">USADO EN</p>
            <div className="display mt-3 text-[clamp(2.4rem,4vw,3.4rem)] text-accent" aria-live="polite">{tool.label}</div>
            <ul className="mt-5 border-t border-line">
              {usedInList.map((p) => {
                const used = tool.usedIn.includes(p.id);
                return (
                  <li key={p.id} className={`flex items-center justify-between border-b border-line py-3 transition-colors duration-300 ${used ? 'text-ink' : 'text-muted/50'}`}>
                    <span className="text-lg">{p.name}</span>
                    <span className={`mono ${used ? 'text-accent' : ''}`}>{used ? '● USADO' : '—'}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 lg:mt-16"><Terminal tool={tool} runKey={runKey} /></div>
      </div>
    </section>
  );
}
