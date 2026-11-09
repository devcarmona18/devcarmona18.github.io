'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';

const QUERY = `SELECT c.nombre AS categoria,
       SUM(d.subtotal)  AS ventas
FROM detalle_venta d
JOIN producto  p ON p.id_producto  = d.id_producto
JOIN categoria c ON c.id_categoria = p.id_categoria
GROUP BY c.nombre
ORDER BY ventas DESC;`;

const ROWS: [string, number][] = [
  ['Herramientas', 4820],
  ['Eléctricos', 3640],
  ['Pinturas', 2910],
  ['Plomería', 2275],
  ['Jardín', 1380],
];
const MAX = 4820;
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

export default function SqlDemo() {
  const [typed, setTyped] = useState('');
  const [rows, setRows] = useState(0);
  const [run, setRun] = useState(0);
  const [busy, setBusy] = useState(true);
  const live = useRef(true);

  useEffect(() => {
    live.current = true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    (async () => {
      setBusy(true);
      setRows(0);
      setTyped('');
      if (reduced) {
        setTyped(QUERY);
        setRows(ROWS.length);
        setBusy(false);
        return;
      }
      for (let i = 1; i <= QUERY.length; i += 2) {
        if (!live.current) return;
        setTyped(QUERY.slice(0, i));
        await sleep(11);
      }
      setTyped(QUERY);
      await sleep(350);
      for (let r = 1; r <= ROWS.length; r++) {
        if (!live.current) return;
        setRows(r);
        await sleep(240);
      }
      setBusy(false);
    })();
    return () => {
      live.current = false;
    };
  }, [run]);

  return (
    <div className="p-5 md:p-7">
      <pre className={`mono !normal-case !tracking-[0.02em] min-h-[9.6rem] overflow-x-auto whitespace-pre border border-line bg-bg p-3 text-[11px] leading-[1.45rem] text-ink md:text-xs ${busy && typed.length < QUERY.length ? 'caret' : ''}`}>
        {typed}
      </pre>
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setRun((n) => n + 1)}
          disabled={busy && rows < ROWS.length && typed.length < QUERY.length}
          className="mono inline-flex items-center gap-2 border border-accent px-3 py-2 text-accent transition-colors hover:bg-accent hover:text-bg disabled:opacity-40"
        >
          Ejecutar <Play size={12} fill="currentColor" />
        </button>
        <span className="mono text-muted">{rows > 0 ? `${rows} filas` : '—'}</span>
      </div>
      <div className="mt-4 border border-line">
        <div className="mono grid grid-cols-[1fr_auto] border-b border-line px-3 py-2 text-muted"><span>categoria</span><span>ventas (COP miles)</span></div>
        <ul className="min-h-[9rem]">
          {ROWS.slice(0, rows).map(([name, v]) => (
            <motion.li key={name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-[7px]">
              <span className="relative z-10 text-sm">{name}</span>
              <span className="mono relative z-10 !tracking-[0.04em] text-ink">{v.toLocaleString('es-CO')}</span>
              <motion.span
                className="absolute inset-y-[3px] left-0 bg-accent/25"
                initial={{ width: 0 }}
                animate={{ width: `${(v / MAX) * 100}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              />
            </motion.li>
          ))}
        </ul>
      </div>
      <p className="mono mt-3 text-muted">Datos ficticios.</p>
    </div>
  );
}
