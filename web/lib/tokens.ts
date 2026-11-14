/**
 * Lee un token de color de globals.css (formato "R G B") y lo devuelve como rgba(),
 * para las animaciones JS (GSAP) que no pueden interpolar var(). Se resuelve en el
 * ámbito de `el`, así respeta las ventanas oscuras (.panel-dark).
 */
export function tokenRgba(name: string, alpha = 1, el: Element = document.documentElement): string {
  const ch = getComputedStyle(el).getPropertyValue(name).trim().split(/[\s,]+/).map(Number);
  if (ch.length < 3 || ch.some((n) => Number.isNaN(n))) return `rgba(0,0,0,${alpha})`;
  return `rgba(${ch[0]},${ch[1]},${ch[2]},${alpha})`;
}
