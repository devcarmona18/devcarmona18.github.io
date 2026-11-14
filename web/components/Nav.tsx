'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { lockScroll, scrollToTarget } from '@/lib/scroll';

const links = [
  { label: 'Trabajo', href: '#trabajo' },
  { label: 'Especialidad', href: '#especialidad' },
  { label: 'Arsenal', href: '#arsenal' },
  { label: 'Contacto', href: '#contacto' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const unlock = lockScroll();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      unlock();
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    window.setTimeout(() => scrollToTarget(href), open ? 350 : 0);
  };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 bg-bg/80 text-ink backdrop-blur-md">
        <nav aria-label="Principal" className="wrap pointer-events-auto flex items-center justify-between py-4 md:py-6">
          <a href="#" onClick={(e) => { e.preventDefault(); scrollToTarget(0); }} className="mono !text-[13px] !tracking-[0.18em]" aria-label="Michael Carmona, inicio">
            MC®
          </a>
          <ul className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={(e) => { e.preventDefault(); go(l.href); }} className="mono link-u">
                  {l.label}
                </a>
              </li>
            ))}
            <li aria-hidden="true" className="w-[118px]" />
          </ul>
          <button type="button" onClick={() => setOpen(true)} className="mono md:hidden" aria-expanded={open} aria-controls="menu-overlay">
            MENÚ
          </button>
        </nav>
      </header>
      <div className="pointer-events-none fixed right-0 top-0 z-[51] hidden md:block">
        <div className="wrap flex items-center gap-2 py-6">
          <span className="h-2 w-2 rounded-full bg-accent" style={{ animation: 'pulse-dot 1.8s ease-in-out infinite' }} />
          <span className="mono text-ink">Disponible</span>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[60] flex flex-col bg-bg px-4 pb-8 pt-4"
          >
            <div className="flex items-center justify-between">
              <span className="mono !text-[13px] !tracking-[0.18em]">MC®</span>
              <button type="button" onClick={() => setOpen(false)} className="mono" autoFocus>CERRAR ✕</button>
            </div>
            <ul className="mt-auto flex flex-col gap-1">
              {links.map((l, i) => (
                <li key={l.href} className="overflow-hidden border-b border-line">
                  <motion.a
                    href={l.href}
                    onClick={(e) => { e.preventDefault(); go(l.href); }}
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="display flex items-baseline justify-between py-3 text-[10.5vw]"
                  >
                    {l.label}
                    <span className="mono text-muted">(0{i + 1})</span>
                  </motion.a>
                </li>
              ))}
            </ul>
            <p className="mono mt-6 flex items-center gap-2 text-muted"><span className="h-2 w-2 rounded-full bg-accent" /> Disponible para nuevos retos</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
