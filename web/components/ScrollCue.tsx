'use client';
import { useEffect, useState } from 'react';
import { scrollToTarget } from '@/lib/scroll';

/** Indicador de scroll: mouse con rueda animada + tres chevrones en cascada. Se oculta al empezar a desplazarse. */
export default function ScrollCue() {
  const [away, setAway] = useState(false);

  useEffect(() => {
    const on = () => setAway(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <div
      className={`cue-in pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-3 transition-[opacity,transform] duration-500 ease-out md:static md:z-auto md:block md:p-0 ${away ? 'translate-y-3 opacity-0' : 'opacity-100'}`}
    >
      <button
        type="button"
        onClick={() => scrollToTarget('#manifiesto')}
        aria-label="Deslizar hacia el manifiesto"
        tabIndex={away ? -1 : 0}
        className={`group flex items-center gap-5 bg-bg/85 px-4 py-2 backdrop-blur-sm md:bg-transparent md:p-0 md:backdrop-blur-none ${away ? 'pointer-events-none' : 'pointer-events-auto'}`}
      >
        <span className="flex flex-col items-center gap-1" aria-hidden="true">
          <span className="relative block h-[40px] w-[25px] rounded-[13px] border-[1.5px] border-ink/80 transition-colors group-hover:border-accent md:h-[46px] md:w-[28px] md:rounded-[14px]">
            <span className="cue-wheel absolute left-1/2 top-[7px] block h-[7px] w-[3px] -translate-x-1/2 rounded-full bg-accent" />
          </span>
          <span className="mt-1 flex flex-col items-center">
            {[0, 1, 2].map((i) => (
              <svg key={i} className="cue-chev -mt-[5px] block" style={{ animationDelay: `${i * 0.18}s` }} width="16" height="9" viewBox="0 0 16 9" fill="none">
                <path d="M1.5 1.5 8 7.5l6.5-6" stroke="#FF6B1A" strokeWidth="1.6" strokeLinecap="square" />
              </svg>
            ))}
          </span>
        </span>
        <span className="mono text-left text-muted transition-colors group-hover:text-ink">
          DESLIZA PARA
          <br />
          DESCUBRIR
        </span>
      </button>
    </div>
  );
}
