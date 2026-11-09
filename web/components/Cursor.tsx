'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const d = dot.current;
    const r = ring.current;
    const l = label.current;
    if (!d || !r || !l) return;
    document.documentElement.classList.add('has-cursor');
    gsap.set([d, r], { xPercent: -50, yPercent: -50, opacity: 0 });
    const dx = gsap.quickTo(d, 'x', { duration: 0.08, ease: 'none' });
    const dy = gsap.quickTo(d, 'y', { duration: 0.08, ease: 'none' });
    const rx = gsap.quickTo(r, 'x', { duration: 0.45, ease: 'power3.out' });
    const ry = gsap.quickTo(r, 'y', { duration: 0.45, ease: 'power3.out' });
    let shown = false;

    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([d, r], { opacity: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t || !t.closest) return;
      const tagged = t.closest<HTMLElement>('[data-cursor]');
      const interactive = t.closest('a, button, [role="tab"], input, label, summary');
      if (tagged && tagged.dataset.cursor) {
        l.textContent = tagged.dataset.cursor;
        gsap.to(r, { width: 84, height: 84, backgroundColor: 'rgba(255,107,26,1)', borderColor: 'rgba(255,107,26,1)', duration: 0.35, ease: 'power3.out' });
        gsap.to(l, { opacity: 1, duration: 0.2 });
        gsap.to(d, { scale: 0, duration: 0.2 });
      } else if (interactive) {
        l.textContent = '';
        gsap.to(r, { width: 56, height: 56, backgroundColor: 'rgba(255,107,26,0)', borderColor: 'rgba(255,107,26,1)', duration: 0.35, ease: 'power3.out' });
        gsap.to(l, { opacity: 0, duration: 0.1 });
        gsap.to(d, { scale: 1, duration: 0.2 });
      } else {
        l.textContent = '';
        gsap.to(r, { width: 32, height: 32, backgroundColor: 'rgba(255,107,26,0)', borderColor: 'rgba(242,240,235,0.5)', duration: 0.35, ease: 'power3.out' });
        gsap.to(l, { opacity: 0, duration: 0.1 });
        gsap.to(d, { scale: 1, duration: 0.2 });
      }
    };
    const leave = () => gsap.to([d, r], { opacity: 0, duration: 0.2 });
    const enter = () => gsap.to([d, r], { opacity: 1, duration: 0.2 });
    window.addEventListener('pointermove', move);
    document.addEventListener('pointerover', over);
    document.documentElement.addEventListener('pointerleave', leave);
    document.documentElement.addEventListener('pointerenter', enter);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.documentElement.removeEventListener('pointerenter', enter);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[100] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
      <div ref={ring} className="fixed left-0 top-0 flex items-center justify-center rounded-full border" style={{ width: 32, height: 32, borderColor: 'rgba(242,240,235,0.5)' }}>
        <span ref={label} className="mono !text-[11px] !tracking-[0.1em] text-[#0a0a0a] opacity-0" />
      </div>
      <div ref={dot} className="fixed left-0 top-0 h-[6px] w-[6px] rounded-full bg-ink mix-blend-difference" />
    </div>
  );
}
