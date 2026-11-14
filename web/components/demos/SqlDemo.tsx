'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { sleep, usePrefersReducedMotion, useTween } from '@/lib/hooks';

const MONTHS = ['01', '04', '07', '10'];
const query = (m: string) => `SELECT c.nombre AS categoria,
       SUM(d.subtotal)  AS ventas
FROM detalle_venta d
JOIN producto  p ON p.id_producto  = d.id_producto
JOIN categoria c ON c.id_categoria = p.id_categoria
WHERE d.fecha >= DATE '2026-${m}-01'
GROUP BY c.nombre
ORDER BY ventas DESC;`;

/* Datos ficticios: un conjunto por periodo */
const DATA: Record<string, number>[] = [
  { Herramientas: 4820, Eléctricos: 3640, Pinturas: 2910, Plomería: 2275, Jardín: 1380 },
  { Herramientas: 3980, Eléctricos: 4410, Pinturas: 1860, Plomería: 3120, Jardín: 2240 },
  { Herramientas: 5230, Eléctricos: 2790, Pinturas: 3480, Plomería: 1930, Jardín: 2960 },
  { Herramientas: 4210, Eléctricos: 3350, Pinturas: 4090, Plomería: 2640, Jardín: 1520 },
];
const MAX = 5500;

function Row({ name, v, shown }: { name: string; v: number; shown: boolean }) {
  const n = useTween(v, 800);
  return (
    <motion.li layout transition={{ type: 'spring', stiffness: 260, damping: 28 }} className="relative grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-[7px]" style={{ opacity: shown ? 1 : 0 }}>
      <span className="relative z-10 text-sm">{name}</span>
      <span className="mono relative z-10 !tracking-[0.04em] tabular-nums text-ink">{Math.round(n).toLocaleString('es-CO')}</span>
      <motion.span
        className="absolute inset-y-[3px] left-0 bg-accent/25 shadow-[0_0_16px_-4px_rgb(var(--accent)/0.6)]"
        initial={{ width: 0 }}
        animate={{ width: shown ? `${(v / MAX) * 100}%` : 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.li>
  );
}

export default function SqlDemo() {
  const reduced = usePrefersReducedMotion();
  const [pi, setPi] = useState(0);
  const [typed, setTyped] = useState('');
  const [rows, setRows] = useState(0);
  const [busy, setBusy] = useState(true);
  const [flash, setFlash] = useState(0);
  const kick = useRef(false);

  useEffect(() => {
    if (reduced) {
      setTyped(query(MONTHS[0]));
      setRows(5);
      setBusy(false);
      return;
    }
    let dead = false;
    const nap = async (ms: number) => {
      const t0 = Date.now();
      while (!dead && !kick.current && Date.now() - t0 < ms) await sleep(120);
    };
    (async () => {
      const q0 = query(MONTHS[0]);
      for (let i = 1; i <= q0.length && !dead; i += 2) {
        setTyped(q0.slice(0, i));
        await sleep(11);
      }
      setTyped(q0);
      let p = 0;
      while (!dead) {
        setBusy(true);
        await sleep(450);
        if (dead) return;
        if (p === 0) {
          for (let r = 1; r <= 5 && !dead; r++) {
            setRows(r);
            await sleep(230);
          }
        } else setRows(5);
        setBusy(false);
        await nap(4200);
        if (dead) return;
        kick.current = false;
        p = (p + 1) % MONTHS.length;
        setPi(p);
        setTyped(query(MONTHS[p]));
        setFlash((f) => f + 1);
        await sleep(350);
      }
    })();
    return () => {
      dead = true;
    };
  }, [reduced]);

  const vals = Object.entries(DATA[pi]).sort((a, b) => b[1] - a[1]);
  const total = useTween(rows > 0 ? vals.reduce((s, [, v]) => s + v, 0) : 0, 900);

  return (
    <div className="p-5 md:p-7">
      <pre className={`mono !normal-case !tracking-[0.02em] min-h-[11.2rem] overflow-x-auto whitespace-pre border bg-bg p-3 text-[11px] leading-[1.45rem] text-ink transition-colors duration-500 md:text-xs ${busy ? 'border-accent/60' : 'border-line'} ${busy && typed.length < query(MONTHS[0]).length ? 'caret' : ''}`}>
        {typed.split('\n').map((ln, i) => (
          <span key={i} className={`block ${ln.startsWith('WHERE') ? 'text-accent' : ''}`} data-f={ln.startsWith('WHERE') ? flash : undefined}>
            {ln || ' '}
          </span>
        ))}
      </pre>
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => { kick.current = true; }}
          className="mono inline-flex items-center gap-2 border border-accent px-3 py-2 text-accent transition-colors hover:bg-accent hover:text-onAccent"
        >
          {busy ? 'Ejecutando' : 'Ejecutar'} <Play size={12} fill="currentColor" className={busy ? 'animate-pulse' : ''} />
        </button>
        <span className="mono tabular-nums text-muted">{rows > 0 ? `${rows} filas · ${busy ? '…' : '12 ms'}` : '—'}</span>
      </div>
      <div className="relative mt-4 overflow-hidden border border-line">
        {busy && !reduced && <span className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px animate-pulse bg-accent shadow-[0_0_12px_2px_rgb(var(--accent)/0.7)]" />}
        <div className="mono grid grid-cols-[1fr_auto] border-b border-line px-3 py-2 text-muted"><span>categoria</span><span>ventas (COP miles)</span></div>
        <ul className="min-h-[9rem]">
          {vals.map(([name, v], i) => (
            <Row key={name} name={name} v={v} shown={i < rows} />
          ))}
        </ul>
        <div className="mono grid grid-cols-[1fr_auto] border-t border-line px-3 py-2 text-muted">
          <span>total</span>
          <span className="tabular-nums text-accent">{Math.round(total).toLocaleString('es-CO')}</span>
        </div>
      </div>
      <p className="mono mt-3 text-muted">Datos ficticios · periodo desde 2026-{MONTHS[pi]}.</p>
    </div>
  );
}
