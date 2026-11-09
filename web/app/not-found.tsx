import Link from 'next/link';
import './globals.css';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col justify-between px-4 py-8 md:px-8">
      <p className="mono text-muted">ERROR 404</p>
      <h1 className="display text-[19vw] md:text-[14vw]">
        ESTA PÁGINA<br />NO EXISTE<span className="text-accent">.</span><br />
        <span className="outline-text">TODAVÍA.</span>
      </h1>
      <Link href="/" className="mono inline-flex w-fit items-center gap-2 bg-accent px-6 py-4 !text-[13px] font-bold text-bg transition-colors hover:bg-accentHover">
        ← Volver al inicio
      </Link>
    </main>
  );
}
