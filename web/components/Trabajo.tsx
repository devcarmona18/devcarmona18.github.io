'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects, type Project } from '@/data/projects';
import LazyVideo from './LazyVideo';
import ProjectModal from './ProjectModal';

const SPAN: Record<string, string> = {
  renal: 'md:col-span-7 md:row-span-2 md:col-start-1 md:row-start-1',
  midia: 'md:col-span-5 md:row-span-3 md:col-start-8 md:row-start-1',
  fusion: 'md:col-span-7 md:row-start-3 md:col-start-1 md:flex-row',
  sigur: 'md:col-span-6 md:row-start-4 md:col-start-1 md:flex-row',
  ferrehogar: 'md:col-span-6 md:row-start-4 md:col-start-7 md:flex-row',
};
const WIDE = new Set(['fusion', 'sigur', 'ferrehogar']);

interface TileProps {
  p: Project;
  onOpen: (p: Project, t: number) => void;
}

function Tile({ p, onOpen }: TileProps) {
  const el = useRef<HTMLElement>(null);
  const vid = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const t = el.current;
    if (!t) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rx = gsap.quickTo(t, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(t, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    gsap.set(t, { transformPerspective: 1100 });
    const move = (e: PointerEvent) => {
      const r = t.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 3.5);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 3.5);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    t.addEventListener('pointermove', move);
    t.addEventListener('pointerleave', leave);
    return () => {
      t.removeEventListener('pointermove', move);
      t.removeEventListener('pointerleave', leave);
    };
  }, []);

  const open = () => onOpen(p, vid.current?.currentTime ?? 0);

  return (
    <article
      ref={el}
      data-tile
      data-cursor="VER"
      role="button"
      tabIndex={0}
      aria-label={`Abrir caso: ${p.name}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      className={`group flex flex-col border border-line bg-surface transition-colors duration-300 hover:border-accent/60 ${SPAN[p.id]}`}
    >
      <motion.div layoutId={`vid-${p.id}`} className={`relative aspect-[16/10] w-full overflow-hidden bg-surface2 md:aspect-auto md:min-h-0 ${WIDE.has(p.id) ? 'md:w-[56%] md:flex-none' : 'md:flex-1'}`}>
        <LazyVideo ref={vid} src={p.video} poster={p.poster} alt={p.posterAlt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
      </motion.div>
      <div className={`flex flex-col items-start gap-3 border-t border-line p-4 md:p-5 ${WIDE.has(p.id) ? 'md:min-w-0 md:flex-1 md:justify-between md:border-l md:border-t-0' : 'md:flex-row md:justify-between md:gap-4'}`}>
        <div className="min-w-0">
          <p className="mono text-muted">({p.num}) · {p.tag}</p>
          <h3 className={`display mt-2 ${WIDE.has(p.id) ? 'text-[clamp(2rem,2.6vw,2.8rem)]' : 'text-[clamp(2rem,3.6vw,3.4rem)]'}`}>{p.name}</h3>
          <p className="mt-2 max-w-[34rem] text-[0.95rem] text-ink/75">{p.hook}</p>
        </div>
        {p.live && <span className="mono shrink-0 pt-1 text-accent">● EN PRODUCCIÓN</span>}
      </div>
    </article>
  );
}

export default function Trabajo() {
  const root = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [viaTile, setViaTile] = useState(true);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-trab-title] span', {
        yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 75%', once: true },
      });
      gsap.utils.toArray<HTMLElement>('[data-tile]').forEach((t) => {
        gsap.from(t, {
          opacity: 0, y: 70, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: t, start: 'top 92%', once: true },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const idx = projects.findIndex((p) => p.id === openId);
  const current = idx >= 0 ? projects[idx] : null;
  const next = projects[(idx + 1 + projects.length) % projects.length];

  return (
    <section ref={root} id="trabajo" aria-labelledby="trab-title" className="rule relative py-24 md:py-40">
      <div className="wrap">
        <div className="flex items-end justify-between">
          <p className="mono text-muted">(04) TRABAJO</p>
          <p className="mono text-muted">5 PROYECTOS — 2025/2026</p>
        </div>
        <h2 id="trab-title" data-trab-title className="display mt-6 text-[clamp(3.6rem,12.4vw,13rem)] md:mt-10">
          <span className="block overflow-hidden"><span className="block">LO QUE HE</span></span>
          <span className="block overflow-hidden"><span className="block">CONSTRUIDO<span className="text-accent">.</span></span></span>
        </h2>

        <LayoutGroup>
          <div className="mt-12 grid grid-cols-1 gap-4 md:mt-20 md:grid-cols-12 md:gap-5 md:[grid-template-rows:repeat(3,minmax(280px,30vh))_minmax(300px,34vh)]">
            {projects.map((p) => (
              <Tile
                key={p.id}
                p={p}
                onOpen={(pr, t) => {
                  setViaTile(true);
                  setStartTime(t);
                  setOpenId(pr.id);
                }}
              />
            ))}
          </div>
          <AnimatePresence>
            {current && (
              <ProjectModal
                key="modal"
                project={current}
                next={next}
                viaTile={viaTile}
                startTime={startTime}
                onClose={() => setOpenId(null)}
                onNext={() => {
                  setViaTile(false);
                  setStartTime(0);
                  setOpenId(next.id);
                }}
              />
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  );
}
