'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const lines = [
  'No hago páginas bonitas que nadie usa.',
  'Construyo sistemas que la gente abre todos los días.',
  'Del primer clic a la última fila de la base de datos.',
  'Y si algo se puede automatizar, lo automatizo.',
];

const counters = [
  { value: 48, suffix: '', caption: 'camas de diálisis por turno, sin una hoja de papel' },
  { value: 5, suffix: '', caption: 'productos construidos de punta a punta' },
  { value: 3, suffix: '', caption: 'en producción hoy' },
  { value: 0, suffix: '24/7', caption: 'un bot atendiendo clientes por WhatsApp' },
];

export default function Manifiesto() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      const nums = el.querySelectorAll<HTMLElement>('[data-count]');
      if (reduced) {
        el.querySelectorAll('[data-word]').forEach((w) => ((w as HTMLElement).style.color = 'var(--ink)'));
        return;
      }
      const words = el.querySelectorAll('[data-word]');
      gsap.set(words, { color: '#3a3836' });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: pin.current, start: 'top top', end: '+=170%', pin: true, scrub: 0.6, anticipatePin: 1 },
      });
      tl.to(words, { color: '#F2F0EB', stagger: 0.12, duration: 0.5, ease: 'none' });
      tl.to({}, { duration: 0.6 });

      nums.forEach((n) => {
        const target = Number(n.dataset.count);
        const o = { v: 0 };
        gsap.to(o, {
          v: target,
          duration: 1.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: n, start: 'top 88%', once: true },
          onUpdate: () => (n.textContent = String(Math.round(o.v))),
        });
      });
      gsap.from('[data-counter-item]', {
        y: 60, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '[data-counters]', start: 'top 85%', once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="manifiesto" aria-label="Manifiesto" className="relative">
      <div ref={pin} className="flex min-h-[100svh] items-center">
        <div className="wrap w-full py-20">
          <p className="mono mb-8 text-muted md:mb-12">(01) MANIFIESTO</p>
          <div className="display text-[clamp(2.4rem,7.6vw,8.2rem)] leading-[0.98] md:max-w-[92%]">
            {lines.map((line, li) => (
              <p key={li} className="mb-[0.22em]" aria-label={line}>
                {line.split(' ').map((w, wi) => (
                  <span key={wi} data-word aria-hidden="true" className="inline-block pr-[0.22em] text-ink">
                    {w}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div data-counters className="wrap rule pb-20 pt-10 md:pb-28 md:pt-14">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-x-10">
          {counters.map((c, i) => (
            <div key={i} data-counter-item className="border-t border-line pt-4">
              <dt className="display text-[clamp(4rem,11vw,10rem)] text-ink">
                {c.suffix ? (
                  <span>{c.suffix.split('/')[0]}<span className="text-accent">/</span>{c.suffix.split('/')[1]}</span>
                ) : (
                  <span data-count={c.value}>{c.value}</span>
                )}
              </dt>
              <dd className="mono mt-4 max-w-[16rem] !normal-case !tracking-[0.04em] leading-relaxed text-muted">{c.caption}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
