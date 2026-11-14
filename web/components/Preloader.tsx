'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

declare global {
  interface Window {
    __mcReady?: boolean;
  }
}

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    const c = counter.current;
    if (!el || !c) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = () => {
      window.__mcReady = true;
      window.dispatchEvent(new Event('mc:ready'));
      setGone(true);
    };
    if (reduced) {
      finish();
      return;
    }
    document.documentElement.style.overflow = 'hidden';
    const state = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = '';
        finish();
      },
    });
    tl.to(state, {
      v: 100,
      duration: 1.1,
      ease: 'power2.inOut',
      onUpdate: () => {
        c.textContent = String(Math.round(state.v)).padStart(3, '0');
      },
    })
      .add(() => {
        window.__mcReady = true;
        window.dispatchEvent(new Event('mc:ready'));
      }, '>-0.05')
      .to(el, { yPercent: -100, duration: 0.65, ease: 'expo.inOut' }, '>');
    return () => {
      tl.kill();
      document.documentElement.style.overflow = '';
    };
  }, []);

  if (gone) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[95] flex flex-col justify-between bg-bg p-4 md:p-8" aria-hidden="true" role="presentation">
      <p className="mono text-muted">MICHAEL CARMONA — PORTAFOLIO 2026</p>
      <span ref={counter} className="display text-[22vw] leading-none text-ink md:text-[11vw]">000</span>
    </div>
  );
}
