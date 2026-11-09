import type Lenis from 'lenis';

let instance: Lenis | null = null;
let locks = 0;

export function setLenis(l: Lenis | null): void {
  instance = l;
}

export function getLenis(): Lenis | null {
  return instance;
}

/** Bloquea el scroll del body (modales, menú) y pausa Lenis. Devuelve la función que desbloquea. */
export function lockScroll(): () => void {
  locks += 1;
  instance?.stop();
  document.documentElement.style.overflow = 'hidden';
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) {
      instance?.start();
      document.documentElement.style.overflow = '';
    }
  };
}

export function scrollToTarget(target: string | number, offset = 0): void {
  if (instance) {
    instance.scrollTo(target, { offset, duration: 1.4 });
    return;
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' });
    return;
  }
  document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
}
