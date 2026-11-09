'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus } from 'lucide-react';

function Field({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(value.toFixed(1));
  useEffect(() => setText(value.toFixed(1)), [value]);
  const step = (d: number) => onChange(Math.max(30, Math.min(150, Math.round((value + d) * 10) / 10)));
  return (
    <div>
      <label htmlFor={id} className="mono mb-2 block text-muted">{label}</label>
      <div className="flex items-stretch border border-line bg-bg">
        <button type="button" aria-label={`Restar 0,1 a ${label}`} onClick={() => step(-0.1)} className="px-3 text-muted transition-colors hover:bg-accent hover:text-bg">
          <Minus size={16} />
        </button>
        <input
          id={id}
          inputMode="decimal"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const n = parseFloat(e.target.value.replace(',', '.'));
            if (!Number.isNaN(n) && n >= 30 && n <= 150) onChange(n);
          }}
          onBlur={() => setText(value.toFixed(1))}
          className="min-w-0 flex-1 bg-transparent px-2 py-3 text-center font-mono text-xl tabular-nums text-ink outline-none"
        />
        <button type="button" aria-label={`Sumar 0,1 a ${label}`} onClick={() => step(0.1)} className="px-3 text-muted transition-colors hover:bg-accent hover:text-bg">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function InterfacesDemo() {
  const [seco, setSeco] = useState(62.0);
  const [entrada, setEntrada] = useState(65.0);
  const [toast, setToast] = useState(false);
  const first = useRef(true);
  const gain = Math.round((entrada - seco) * 10) / 10;
  const alert = gain > 4.5;
  const pct = Math.max(0, Math.min(1, gain / 6));

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const a = window.setTimeout(() => setToast(true), 350);
    const b = window.setTimeout(() => setToast(false), 1900);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [seco, entrada]);

  return (
    <div className="relative p-5 md:p-7">
      <div className="mono flex items-center justify-between text-muted">
        <span>CAMA 12 · TURNO M</span>
        <AnimatePresence>
          {toast && (
            <motion.span initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-ink">
              Guardado ✓
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <Field id="peso-seco" label="Peso seco" value={seco} onChange={setSeco} />
        <Field id="peso-entrada" label="Peso entrada" value={entrada} onChange={setEntrada} />
      </div>
      <div className={`mt-6 border p-4 transition-colors duration-300 ${alert ? 'border-accent bg-accent/10' : 'border-line'}`}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="mono text-muted">Ganancia interdialítica</p>
            <p className={`display mt-2 text-[clamp(3.5rem,9vw,5.5rem)] tabular-nums ${alert ? 'text-accent' : 'text-ink'}`} aria-live="polite">
              {gain.toFixed(1).replace('.', ',')}<span className="ml-1 text-[0.35em] text-muted">kg</span>
            </p>
          </div>
          <span className={`mono border px-2 py-1 ${alert ? 'border-accent bg-accent text-bg' : 'border-line text-muted'}`}>
            {alert ? 'ALERTA' : 'NORMAL'}
          </span>
        </div>
        <div className="relative mt-5 h-[6px] bg-line">
          <motion.div className={`absolute inset-y-0 left-0 ${alert ? 'bg-accent' : 'bg-ink'}`} animate={{ width: `${pct * 100}%` }} transition={{ type: 'spring', stiffness: 220, damping: 26 }} />
          <div className="absolute -top-1 bottom-[-4px] w-px bg-accent" style={{ left: `${(4.5 / 6) * 100}%` }} />
        </div>
        <div className="mono relative mt-2 h-4 text-[10px] text-muted"><span className="absolute left-0">0</span><span className="absolute -translate-x-1/2 text-accent" style={{ left: `${(4.5 / 6) * 100}%` }}>umbral 4,5</span><span className="absolute right-0">6 kg</span></div>
      </div>
      <p className="mono mt-4 text-muted">Prueba: sube el peso de entrada por encima de 66,5.</p>
    </div>
  );
}
