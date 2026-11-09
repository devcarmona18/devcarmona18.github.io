'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Copy, Check } from 'lucide-react';
import Magnetic from './Magnetic';
import { scrollToTarget } from '@/lib/scroll';

const EMAIL = 'devcarmona18@gmail.com';

function Row({ href, label, external = true, small = false, children }: { href: string; label: string; external?: boolean; small?: boolean; children?: React.ReactNode }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group relative flex items-center justify-between overflow-hidden border-t border-line py-5 md:py-8"
    >
      <span className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-y-100" aria-hidden="true" />
      <span className={`display relative z-10 px-0 ${small ? "text-[clamp(1.25rem,5.2vw,5.6rem)]" : "text-[clamp(1.7rem,6.2vw,5.6rem)]"} transition-all duration-500 group-hover:translate-x-3 group-hover:text-bg md:group-hover:translate-x-6`}>{label}</span>
      <span className="relative z-10 flex items-center gap-3 pr-1 transition-colors duration-300 group-hover:text-bg md:pr-4">
        {children}
        <ArrowUpRight className="h-6 w-6 transition-transform duration-500 group-hover:rotate-45 md:h-12 md:w-12" strokeWidth={1.5} />
      </span>
    </a>
  );
}

export default function Contacto() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-hb] span', {
        yPercent: 110, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: '[data-hb]', start: 'top 85%', once: true },
      });
      gsap.from('[data-wordmark]', {
        yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: '[data-wordmark]', start: 'top 100%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const t = document.createElement('textarea');
      t.value = EMAIL;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const strip = 'DISPONIBLE PARA NUEVOS RETOS — FULL STACK — IA — ';

  return (
    <section ref={root} id="contacto" aria-labelledby="hablemos" className="rule relative overflow-hidden pt-16 md:pt-28">
      <div className="mb-8 overflow-hidden border-y border-line py-3 md:mb-14" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <span key={k} className="mono flex shrink-0 whitespace-pre text-accent">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i}>{strip}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="wrap">
        <p className="mono text-muted">(05) CONTACTO</p>
        <h2 id="hablemos" data-hb className="display mt-4 overflow-hidden text-[min(22.6vw,24rem)] leading-[0.84]">
          <span className="block">HABLEMOS<span className="text-accent">.</span></span>
        </h2>
        <p className="mt-6 max-w-xl text-xl md:mt-10 md:text-2xl">
          ¿Tienes un proceso que todavía se hace a mano? Ese es exactamente mi tipo de problema.
        </p>

        <div className="mt-12 md:mt-20">
          <div className="relative">
            <Magnetic strength={0.06} className="!block w-full">
              <Row href={`mailto:${EMAIL}`} label={EMAIL} external={false} small>
                <button
                  type="button"
                  onClick={copy}
                  aria-label="Copiar correo al portapapeles"
                  className="mono relative z-20 flex items-center gap-2 border border-current px-2 py-1 !text-[11px] transition-colors hover:bg-bg hover:text-accent"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span aria-live="polite">{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </Row>
            </Magnetic>
          </div>
          <Magnetic strength={0.06} className="!block w-full"><Row href="https://www.linkedin.com/in/david-carmona-g" label="LinkedIn ↗" /></Magnetic>
          <div className="border-b border-line">
            <Magnetic strength={0.06} className="!block w-full"><Row href="https://github.com/devcarmona18" label="GitHub ↗" /></Magnetic>
          </div>
        </div>
      </div>

      <footer className="wrap mt-20 md:mt-32">
        <div className="mono flex flex-col gap-4 text-muted md:flex-row md:items-center md:justify-between">
          <p className="!normal-case !tracking-[0.04em]">© 2026 Michael Carmona — Diseñado y construido por mí. Next.js, GSAP, Three.js.</p>
          <a href="#" onClick={(e) => { e.preventDefault(); scrollToTarget(0); }} className="link-u self-start text-ink md:self-auto">Volver arriba ↑</a>
        </div>
        <p data-wordmark aria-hidden="true" className="display outline-text mt-6 select-none whitespace-nowrap pb-[4vw] text-center md:pb-0 text-[min(25vw,25rem)] leading-[0.78] md:mt-10">
          CARMONA
        </p>
      </footer>
    </section>
  );
}
