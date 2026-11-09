'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';

const Q = '¿Cómo ha variado la ganancia interdialítica del paciente de la cama 12 este mes?';
const A =
  'Subió de 2,1 kg a 3,4 kg en promedio en las últimas 3 semanas; 4 sesiones superaron el umbral de 4,5 kg (días 4, 11, 18 y 25). Te sugiero revisar con el médico tratante.';
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

const POINTS = [2.1, 2.4, 2.2, 4.7, 2.9, 3.1, 4.8, 3.3, 3.5, 4.9, 3.2, 3.6, 4.6, 3.4];
function spark(): string {
  const w = 300;
  const h = 70;
  return POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i / (POINTS.length - 1)) * w},${h - ((p - 1.5) / 4) * h}`).join(' ');
}

export default function ChatDemo() {
  const [run, setRun] = useState(0);
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const [phase, setPhase] = useState<'q' | 'think' | 'a' | 'done'>('q');
  const live = useRef(true);

  useEffect(() => {
    live.current = true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    (async () => {
      setQ('');
      setA('');
      setPhase('q');
      if (reduced) {
        setQ(Q);
        setA(A);
        setPhase('done');
        return;
      }
      for (let i = 1; i <= Q.length; i++) {
        if (!live.current) return;
        setQ(Q.slice(0, i));
        await sleep(20);
      }
      setPhase('think');
      await sleep(750);
      setPhase('a');
      const words = A.split(' ');
      for (let i = 1; i <= words.length; i++) {
        if (!live.current) return;
        setA(words.slice(0, i).join(' '));
        await sleep(70);
      }
      setPhase('done');
    })();
    return () => {
      live.current = false;
    };
  }, [run]);

  return (
    <div className="flex flex-col p-5 md:p-7">
      <div className="min-h-[19rem] space-y-4 text-[0.95rem]">
        <div className="ml-auto max-w-[88%] border border-line bg-surface2 p-3">
          <p className="mono mb-1 text-muted">Tú</p>
          <p className={phase === 'q' ? 'caret' : ''}>{q}</p>
        </div>
        {(phase === 'think' || phase === 'a' || phase === 'done') && (
          <div className="max-w-[92%] border border-accent/50 p-3">
            <p className="mono mb-1 text-accent">Asistente · Claude</p>
            {phase === 'think' ? (
              <p className="mono text-muted caret">consultando historial</p>
            ) : (
              <p className={phase === 'a' ? 'caret' : ''}>{a}</p>
            )}
          </div>
        )}
        {phase === 'done' && (
          <div className="max-w-[92%]">
            <p className="mono mb-2 text-muted">Ganancia por sesión (kg)</p>
            <svg viewBox="0 0 300 80" className="w-full" role="img" aria-label="Línea con la ganancia interdialítica por sesión durante el mes, con picos sobre 4,5 kg">
              <line x1="0" x2="300" y1={70 - ((4.5 - 1.5) / 4) * 70} y2={70 - ((4.5 - 1.5) / 4) * 70} stroke="#FF6B1A" strokeDasharray="3 4" strokeWidth="1" opacity="0.6" />
              <motion.path d={spark()} fill="none" stroke="#F2F0EB" strokeWidth="1.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.3, ease: 'easeInOut' }} />
            </svg>
          </div>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <p className="mono text-muted">Demo con datos ficticios.</p>
        <button type="button" onClick={() => setRun((n) => n + 1)} className="mono inline-flex items-center gap-2 border border-accent px-3 py-2 text-accent transition-colors hover:bg-accent hover:text-bg">
          Preguntar otra vez <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
}
