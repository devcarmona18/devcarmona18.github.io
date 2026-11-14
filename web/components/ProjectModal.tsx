'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';
import type { Project } from '@/data/projects';
import LazyVideo from './LazyVideo';
import { lockScroll } from '@/lib/scroll';

interface Props {
  project: Project;
  next: Project;
  viaTile: boolean;
  startTime: number;
  onClose: () => void;
  onNext: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ProjectModal({ project: p, next, viaTile, startTime, onClose, onNext }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const unlock = lockScroll();
    const prev = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>('[data-close]')?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const f = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      unlock();
      prev?.focus?.();
    };
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [p.id]);

  return (
    <motion.div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-title"
      className="fixed inset-0 z-[70]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.1 } }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-bg" />
      <div ref={scroller} data-lenis-prevent className="relative h-full overflow-y-auto overscroll-contain">
        <div className="wrap flex items-center justify-between py-4 md:py-6">
          <p className="mono text-muted">CASO ({p.num}/05)</p>
          <button type="button" data-close onClick={onClose} aria-label="Cerrar caso" className="mono flex items-center gap-2 border border-line px-3 py-2 transition-colors hover:border-accent hover:text-accent">
            CERRAR <X size={14} />
          </button>
        </div>

        <motion.div
          layoutId={viaTile ? `vid-${p.id}` : undefined}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 110 || info.velocity.y > 700) onClose();
          }}
          className="wrap"
          style={{ touchAction: 'pan-x' }}
          key={p.id}
          initial={viaTile ? undefined : { opacity: 0, y: 40 }}
          animate={viaTile ? undefined : { opacity: 1, y: 0 }}
        >
          <div className="relative aspect-[16/10] max-h-[62vh] w-full overflow-hidden border border-line bg-surface md:aspect-[16/7]">
            <LazyVideo src={p.video} poster={p.poster} alt={p.posterAlt} eager startTime={startTime} className="h-full w-full object-cover" />
            <span className="mono absolute bottom-3 right-3 bg-bg/80 px-2 py-1 text-muted md:hidden">↓ desliza para cerrar</span>
          </div>
        </motion.div>

        <motion.div
          key={`c-${p.id}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: viaTile ? 0.35 : 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="wrap grid grid-cols-1 gap-10 pb-16 pt-8 md:grid-cols-12 md:gap-10 md:pt-12"
        >
          <div className="md:col-span-5">
            <p className="mono text-muted">({p.num}) · {p.tag}</p>
            <h2 id="case-title" className="display mt-4 text-[clamp(2.2rem,4.8vw,4.5rem)] leading-[0.95]">{p.name}</h2>
            {p.live && <p className="mono mt-4 text-accent">● EN PRODUCCIÓN</p>}
            <p className="mt-5 text-xl font-semibold leading-snug">{p.hook}</p>
            {(p.demo || p.code) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {p.demo && (
                  <a href={p.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-accent px-5 py-3 font-semibold text-onAccent transition-colors hover:bg-accentHover">
                    Ver demo <ArrowUpRight size={16} />
                  </a>
                )}
                {p.code && (
                  <a href={p.code} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-ink/40 px-5 py-3 font-semibold transition-colors hover:border-accent hover:text-accent">
                    Código <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="space-y-9 md:col-span-6 md:col-start-7">
            <div>
              <h3 className="mono border-b border-line pb-2 text-accent">EL PROBLEMA</h3>
              <p className="mt-4 text-lg leading-relaxed text-ink/90">{p.problem}</p>
            </div>
            <div>
              <h3 className="mono border-b border-line pb-2 text-accent">LO QUE CONSTRUÍ</h3>
              <p className="mt-4 text-lg leading-relaxed text-ink/90">{p.built}</p>
            </div>
            <div>
              <h3 className="mono border-b border-line pb-2 text-accent">STACK</h3>
              <p className="mono mt-4 !normal-case !tracking-[0.05em] leading-8 text-ink">{p.stack.join(' / ')}</p>
            </div>
          </div>
        </motion.div>

        <button type="button" onClick={onNext} className="group block w-full border-t border-line text-left transition-colors hover:bg-accent hover:text-onAccent">
          <span className="wrap flex items-center justify-between py-8 md:py-12">
            <span>
              <span className="mono block text-muted group-hover:text-onAccent">SIGUIENTE PROYECTO</span>
              <span className="display mt-2 block text-[clamp(1.5rem,4vw,3.4rem)]">{next.name}</span>
            </span>
            <span className="display text-[clamp(1.5rem,4vw,3.4rem)]">→</span>
          </span>
        </button>
      </div>
    </motion.div>
  );
}
