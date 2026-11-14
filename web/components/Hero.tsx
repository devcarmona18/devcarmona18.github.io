'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Magnetic from './Magnetic';
import { CubePoster } from './CubePoster';
import { scrollToTarget } from '@/lib/scroll';
import ScrollCue from './ScrollCue';

const Cube = dynamic(() => import('./Cube'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center p-[10%]">
      <CubePoster />
    </div>
  ),
});

function useBogotaClock(): string {
  const [t, setT] = useState('--:-- --');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: true });
    const tick = () => setT(fmt.format(new Date()).replace(/\s?([AP])M/, ' $1M').replace(/^(\d):/, '0$1:'));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}

function Caption({ text }: { text: string }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(text);
      return;
    }
    let i = 0;
    setShown('');
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [text]);
  return (
    <p className="mono caret min-h-[1.2em] text-center text-muted" aria-live="off">
      {shown}
    </p>
  );
}

function Line({ text, accentLast = false }: { text: string; accentLast?: boolean }) {
  const chars = Array.from(text);
  return (
    <span className="block overflow-hidden pb-[0.16em] pt-[0.24em] -mb-[0.16em] -mt-[0.24em]" aria-hidden="true">
      {chars.map((c, i) =>
        accentLast && i === chars.length - 1 && c === '.' ? (
          <span key={i} data-char className="inline-block">
            <span className="period" />
          </span>
        ) : (
          <span
            key={i}
            data-char
            className={`inline-block ${accentLast && i === chars.length - 1 ? 'text-accent' : ''}`}
            style={{ whiteSpace: 'pre' }}
          >
            {c}
          </span>
        ),
      )}
    </span>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const scrollProg = useRef(0);
  const [caption, setCaption] = useState('');
  const clock = useBogotaClock();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      const chars = el.querySelectorAll('[data-char]');
      const rest = el.querySelectorAll('[data-in]');
      if (!reduced) {
        gsap.set(chars, { yPercent: 115 });
        gsap.set(rest, { opacity: 0, y: 24 });
        const play = () => {
          gsap.to(chars, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.035 });
          gsap.to(rest, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.25 });
        };
        if (window.__mcReady) play();
        else window.addEventListener('mc:ready', play, { once: true });

        gsap.to(scrollProg, {
          current: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
        });
        gsap.to('[data-hero-title]', {
          yPercent: -18,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
        });
      }
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="inicio" className="relative flex min-h-[100svh] flex-col overflow-hidden pb-6 pt-20 md:pt-24" aria-labelledby="hero-title">
      <div data-in className="wrap mono flex flex-wrap justify-between gap-x-6 gap-y-1 text-muted">
        <span>FULL STACK DEVELOPER CON IA</span>
        <span>PALMIRA, COLOMBIA</span>
        <span className="text-ink" suppressHydrationWarning>COL {clock}</span>
      </div>
      <div className="wrap rule mt-3 w-full" />

      <div className="wrap relative mt-6 flex flex-1 flex-col md:mt-10 md:justify-center">
        <h1 id="hero-title" data-hero-title className="display relative z-10 text-[15.4vw] md:text-[min(8.9vw,11.6rem)]">
          <span className="sr-only">Código que resuelve.</span>
          <Line text="CÓDIGO QUE" />
          <span className="block mt-[0.02em]"><Line text="RESUELVE." accentLast /></span>
        </h1>

        <div className="relative z-20 mx-auto mt-2 aspect-square w-[74vw] max-w-[460px] md:absolute md:right-[-3vw] md:top-1/2 md:mt-0 md:w-[48vw] md:max-w-[780px] md:-translate-y-[46%]">
          <Cube scrollRef={scrollProg} onCaption={setCaption} bleedRef={root} className="h-full w-full" />
          <div className="absolute inset-x-0 -bottom-1 md:-bottom-4">
            <Caption text={caption} />
          </div>
        </div>

        <div data-in className="relative z-10 mt-6 max-w-[34rem] md:mt-10">
          <p className="text-[1.0625rem] leading-relaxed text-ink/90 md:text-lg">
            Construyo, transformo y automatizo sistemas para la eficiencia y eficacia de los proyectos a realizar.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Magnetic>
              <a
                href="#trabajo"
                onClick={(e) => { e.preventDefault(); scrollToTarget('#trabajo'); }}
                className="inline-flex items-center gap-3 bg-accent px-6 py-4 text-[0.95rem] font-semibold text-onAccent transition-colors hover:bg-accentHover"
              >
                Ver lo que he construido <span aria-hidden="true">↓</span>
              </a>
            </Magnetic>
            <a href="#contacto" onClick={(e) => { e.preventDefault(); scrollToTarget('#contacto'); }} className="link-u text-[0.95rem] font-medium">
              Hablemos →
            </a>
          </div>
        </div>
      </div>

      <div className="wrap mt-8 h-[88px] md:mt-8 md:h-auto">
        <ScrollCue />
      </div>
    </section>
  );
}
