'use client';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

interface Props {
  src: string;
  poster: string;
  alt: string;
  className?: string;
  startTime?: number;
  /** reproducir de inmediato (modal) */
  eager?: boolean;
}

/** Video mudo en bucle que solo reproduce cuando es visible. */
const LazyVideo = forwardRef<HTMLVideoElement | null, Props>(function LazyVideo({ src, poster, alt, className = '', startTime = 0, eager = false }, ref) {
  const el = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => el.current as HTMLVideoElement);

  useEffect(() => {
    const v = el.current;
    if (!v) return;
    if (startTime > 0) {
      const seek = () => {
        try {
          v.currentTime = startTime;
        } catch {
          /* sin metadatos todavía */
        }
      };
      if (v.readyState >= 1) seek();
      else v.addEventListener('loadedmetadata', seek, { once: true });
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    if (eager) {
      void v.play().catch(() => undefined);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void v.play().catch(() => undefined);
        else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [eager, startTime]);

  return (
    <video
      ref={el}
      className={className}
      muted
      playsInline
      loop
      preload={eager ? 'auto' : 'none'}
      poster={poster}
      aria-label={alt}
      tabIndex={-1}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
});

export default LazyVideo;
