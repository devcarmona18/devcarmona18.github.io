'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

export function useInView<T extends Element>(ref: RefObject<T>, margin = '0px'): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}

/** Escribe `text` carácter a carácter. Reinicia cuando cambia `runKey`. */
export function useTypewriter(text: string, active: boolean, runKey: number, speed = 18): string {
  const [out, setOut] = useState('');
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (!active) {
      setOut('');
      return;
    }
    if (reduced) {
      setOut(text);
      return;
    }
    let i = 0;
    setOut('');
    const id = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, active, runKey, speed, reduced]);
  return out;
}

export function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/** Anima un número hasta `target` (rAF). Con movimiento reducido salta directo. */
export function useTween(target: number, ms = 700): number {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced) {
      cur.current = target;
      setV(target);
      return;
    }
    const from = cur.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      cur.current = from + (target - from) * e;
      setV(cur.current);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduced]);
  return v;
}

export const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
