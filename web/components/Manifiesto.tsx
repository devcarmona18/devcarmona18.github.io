'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tokenRgba } from '@/lib/tokens';

/** Las 3 C: la letra inicial viaja desde la derecha y de ella se despliega la frase. */
const frases = ['Creo software', 'Construyo soluciones', 'Convierto ideas en realidad'];
const FINAL = ['Desde', 'el', 'inicio', 'hasta', 'el', 'fin'];

export default function Manifiesto() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      const cs = gsap.utils.toArray<HTMLElement>('[data-c]', el);
      const phrases = gsap.utils.toArray<HTMLElement>('[data-phrase]', el);
      const finalWords = gsap.utils.toArray<HTMLElement>('[data-fw]', el);
      if (reduced) {
        el.querySelectorAll<HTMLElement>('[data-word], [data-fw]').forEach((w) => (w.style.color = 'rgb(var(--ink))'));
        cs.forEach((c) => (c.style.color = 'rgb(var(--accent))'));
        return;
      }
      const dim = tokenRgba('--dim');
      const ink = tokenRgba('--ink');
      const accent = tokenRgba('--accent');
      gsap.set(el.querySelectorAll('[data-word], [data-fw]'), { color: dim });
      gsap.set(cs, { x: () => window.innerWidth, color: tokenRgba('--accent', 0) });
      gsap.set(phrases, { clipPath: 'inset(0 100% 0 0)' });
      gsap.set('[data-final]', { opacity: 0, y: 30 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: pin.current, start: 'top top', end: '+=330%', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
      });
      cs.forEach((c, i) => {
        const at = i * 2.6;
        tl.to(c, { x: 0, duration: 1.5, ease: 'power3.out' }, at)
          .to(c, { color: accent, duration: 0.5 }, at + 1.2)
          .to(phrases[i], { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power2.out' }, at + 1.2)
          .to(phrases[i].querySelectorAll('[data-word]'), { color: ink, duration: 0.5, stagger: 0.28 }, at + 1.3);
      });
      const f = 3 * 2.6 - 0.2;
      tl.to('[data-final]', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, f)
        .to(finalWords, { color: ink, duration: 0.4, stagger: 0.18 }, f + 0.2)
        .to({}, { duration: 1.2 });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="manifiesto" aria-label="Manifiesto" className="relative">
      <div ref={pin} className="relative flex min-h-[100svh] items-center overflow-hidden">
        <div className="wrap w-full py-16 md:py-20">
          <p className="mono mb-6 text-muted md:mb-8">(01) MANIFIESTO</p>
          <div className="space-y-[3.6vh] md:space-y-[3.2vh]">
            {frases.map((f) => {
              const rest = f.slice(1).split(' ');
              return (
                <div key={f} className="flex items-end gap-[0.6vw]">
                  <span className="sr-only">{f}</span>
                  <span
                    data-c
                    aria-hidden="true"
                    className="display shrink-0 text-[19vw] leading-[0.8] [-webkit-text-stroke:2px_rgb(var(--accent))] md:text-[min(19.5vh,11vw)] md:[-webkit-text-stroke:3px_rgb(var(--accent))]"
                  >
                    C
                  </span>
                  <p data-phrase aria-hidden="true" className="display min-w-0 pb-[0.4vw] text-[6.4vw] leading-[0.95] md:pb-[0.5vh] md:text-[min(8.8vh,5.9vw)] md:leading-[0.9]">
                    {rest.map((w, wi) => (
                      <span key={wi} data-word className="inline-block pr-[0.2em] text-ink">
                        {w}
                      </span>
                    ))}
                  </p>
                </div>
              );
            })}
          </div>
          <p data-final className="display mt-[3.5vh] text-[clamp(1.4rem,4.6vw,3.7rem)] leading-[0.95]" aria-label="Desde el inicio hasta el fin.">
            {FINAL.map((w, i) => (
              <span key={i} data-fw aria-hidden="true" className="inline-block pr-[0.22em] text-ink">
                {i === FINAL.length - 1 ? (
                  <>
                    {w}
                    <span className="period" />
                  </>
                ) : (
                  w
                )}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
