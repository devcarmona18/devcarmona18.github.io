'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus } from 'lucide-react';
import { sleep, usePrefersReducedMotion, useTween } from '@/lib/hooks';

interface Scene {
  cama: string;
  seco: number;
  from: number;
  to: number;
}

/* Datos ficticios que la demo recorre sola */
const SCENES: Scene[] = [
  { cama: '12', seco: 62.0, from: 64.1, to: 66.9 },
  { cama: '07', seco: 71.5, from: 73.0, to: 75.2 },
  { cama: '21', seco: 58.8, from: 60.1, to: 63.9 },
  { cama: '12', seco: 62.0, from: 64.6, to: 66.2 },
];

const fmt = (n: number) => n.toFixed(1).replace('.', ',');

function Field({ id, label, value, typing, onChange }: { id: string; label: string; value: number; typing: string | null; onChange: (v: number) => void }) {
  const [text, setText] = useState(fmt(value));
  useEffect(() => setText(fmt(value)), [value]);
  const step = (d: number) => onChange(Math.max(30, Math.min(150, Math.round((value + d) * 10) / 10)));
  const typingNow = typing !== null;
  return (
    <div>
      <label htmlFor={id} className="mono mb-2 block text-muted">{label}</label>
      <div className={`flex items-stretch border bg-bg transition-[border-color,box-shadow] duration-300 ${typingNow ? 'border-accent shadow-[0_0_18px_-4px_rgba(255,107,26,0.6)]' : 'border-line'}`}>
        <button type="button" aria-label={`Restar 0,1 a ${label}`} onClick={() => step(-0.1)} className="px-3 text-muted transition-colors hover:bg-accent hover:text-bg">
          <Minus size={16} />
        </button>
        <input
          id={id}
          inputMode="decimal"
          value={typingNow ? typing : text}
          readOnly={typingNow}
          onChange={(e) => {
            setText(e.target.value);
            const n = parseFloat(e.target.value.replace(',', '.'));
            if (!Number.isNaN(n) && n >= 30 && n <= 150) onChange(n);
          }}
          onBlur={() => setText(fmt(value))}
          className={`min-w-0 flex-1 bg-transparent px-2 py-3 text-center font-mono text-xl tabular-nums text-ink outline-none ${typingNow ? 'caret' : ''}`}
        />
        <button type="button" aria-label={`Sumar 0,1 a ${label}`} onClick={() => step(0.1)} className="px-3 text-muted transition-colors hover:bg-accent hover:text-bg">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function InterfacesDemo() {
  const reduced = usePrefersReducedMotion();
  const [cama, setCama] = useState('12');
  const [seco, setSeco] = useState(62.0);
  const [entrada, setEntrada] = useState(65.0);
  const [typing, setTyping] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [saved, setSaved] = useState(37);
  const lastUser = useRef(0);
  const gain = Math.round((entrada - seco) * 10) / 10;
  const alert = gain > 4.5;
  const pct = Math.max(0, Math.min(1, gain / 6));
  const shownGain = useTween(gain, 520);
  const shownSaved = useTween(saved, 400);

  /* guion automático: cambia de cama, escribe el peso y salta la alerta */
  useEffect(() => {
    if (reduced) return;
    let dead = false;
    const gate = async () => {
      while (!dead && Date.now() - lastUser.current < 8000) await sleep(500);
    };
    const flash = async () => {
      setToast(true);
      setSaved((n) => n + 1);
      await sleep(1300);
      setToast(false);
    };
    (async () => {
      let i = 0;
      await sleep(900);
      while (!dead) {
        const sc = SCENES[i % SCENES.length];
        await gate();
        if (dead) return;
        setCama(sc.cama);
        setSeco(sc.seco);
        setEntrada(sc.from);
        await sleep(900);
        await gate();
        const target = fmt(sc.to);
        for (let k = 1; k <= target.length && !dead; k++) {
          setTyping(target.slice(0, k));
          await sleep(190);
        }
        await sleep(260);
        if (dead) return;
        setEntrada(sc.to);
        setTyping(null);
        void flash();
        await sleep(3000);
        i += 1;
      }
    })();
    return () => {
      dead = true;
    };
  }, [reduced]);

  const touch = () => {
    lastUser.current = Date.now();
  };

  useEffect(() => {
    if (!reduced) return;
    setEntrada(66.9);
  }, [reduced]);

  return (
    <div className="relative p-5 md:p-7" onPointerDown={touch} onKeyDown={touch}>
      <div className="mono flex items-center justify-between text-muted">
        <span>
          CAMA <span key={cama} className="inline-block text-ink">{cama}</span> · TURNO M
        </span>
        <span className="flex items-center gap-3">
          <AnimatePresence>
            {toast && (
              <motion.span initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-accent">
                Guardado ✓
              </motion.span>
            )}
          </AnimatePresence>
          <span className="tabular-nums">HOY {String(Math.round(shownSaved)).padStart(2, '0')}</span>
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <Field id="peso-seco" label="Peso seco" value={seco} typing={null} onChange={(v) => { touch(); setSeco(v); }} />
        <Field id="peso-entrada" label="Peso entrada" value={entrada} typing={typing} onChange={(v) => { touch(); setEntrada(v); }} />
      </div>
      <motion.div
        animate={alert && !reduced ? { boxShadow: ['0 0 0 0 rgba(255,107,26,0)', '0 0 28px -4px rgba(255,107,26,0.55)', '0 0 0 0 rgba(255,107,26,0)'] } : { boxShadow: '0 0 0 0 rgba(255,107,26,0)' }}
        transition={alert ? { duration: 1.8, repeat: Infinity } : { duration: 0.3 }}
        className={`mt-6 border p-4 transition-colors duration-300 ${alert ? 'border-accent bg-accent/10' : 'border-line bg-bg/60'}`}
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="mono text-muted">Ganancia interdialítica</p>
            <p className={`display mt-2 text-[clamp(3.5rem,9vw,5.5rem)] tabular-nums ${alert ? 'text-accent' : 'text-ink'}`} aria-live="off">
              {fmt(shownGain)}<span className="ml-1 text-[0.35em] text-muted">kg</span>
            </p>
          </div>
          <span className={`mono border px-2 py-1 transition-colors ${alert ? 'border-accent bg-accent text-bg' : 'border-line text-muted'}`}>
            {alert ? 'ALERTA' : 'NORMAL'}
          </span>
        </div>
        <div className="relative mt-5 h-[6px] bg-line">
          <motion.div className={`absolute inset-y-0 left-0 ${alert ? 'bg-accent' : 'bg-ink'}`} animate={{ width: `${pct * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
          <div className="absolute -top-1 bottom-[-4px] w-px bg-accent" style={{ left: `${(4.5 / 6) * 100}%` }} />
        </div>
        <div className="mono relative mt-2 h-4 text-[10px] text-muted"><span className="absolute left-0">0</span><span className="absolute -translate-x-1/2 text-accent" style={{ left: `${(4.5 / 6) * 100}%` }}>umbral 4,5</span><span className="absolute right-0">6 kg</span></div>
      </motion.div>
      <p className="mono mt-4 text-muted">Se llena sola · toca los campos para probar tú.</p>
    </div>
  );
}
