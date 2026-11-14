import Link from 'next/link';
import './globals.css';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col justify-between px-4 py-8 md:px-8">
      <p className="mono text-muted">ERROR 404</p>
      <h1 className="display text-[12vw] leading-[1.02] md:text-[9vw]">
        ESTA PÁGINA<br />NO EXISTE<span className="period" aria-hidden="true" /><br />
        <span className="outline-text">TODAVÍA.</span>
      </h1>
      <Link href="/" className="mono inline-flex w-fit items-center gap-2 bg-accent px-6 py-4 !text-[13px] font-bold text-onAccent transition-colors hover:bg-accentHover">
        ← Volver al inicio
      </Link>
    </main>
  );
}
