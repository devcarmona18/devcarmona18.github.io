'use client';
import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { sleep, usePrefersReducedMotion } from '@/lib/hooks';

const Q = '¿Cómo ha variado la ganancia interdialítica del paciente de la cama 12 este mes?';
const A =
  'Subió de 2,1 kg a 3,4 kg en promedio en las últimas 3 semanas; 4 sesiones superaron el umbral de 4,5 kg (días 4, 11, 18 y 25). Te sugiero revisar con el médico tratante.';

const W = 300;
const H = 80;
const N = 16;
const STEP = W / (N - 1);
const TICK = 480;
const yOf = (v: number) => H - 6 - ((v - 1.5) / 4) * (H - 12);

/* serie ficticia determinista: base con ondas y picos ocasionales sobre el umbral */
function sample(k: number): number {
  const noise = Math.sin(k * 12.9898) * 43758.5453;
  const r = noise - Math.floor(noise);
  const spike = k % 7 === 3 ? 1.5 : 0;
  return Math.max(1.8, Math.min(5.2, 3.1 + Math.sin(k * 0.8) * 0.6 + (r - 0.5) * 1.1 + spike));
}

function Spark({ reduced }: { reduced: boolean }) {
  const [tick, setTick] = useState(0);
  const t0 = useRef(0);
  useEffect(() => {
    if (reduced) {
      setTick(1400);
      return;
    }
    t0.current = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      setTick(Math.max(0, now - t0.current));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const T = reduced ? 0 : tick / TICK;
  const k0 = Math.floor(T);
  const frac = T - k0;
  const reveal = Math.min(1, tick / 1500);
  const pts: [number, number][] = [];
  for (let j = 0; j <= N; j++) pts.push([(j - frac) * STEP, yOf(sample(k0 + j))]);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const headX = W * reveal;
  let headY = pts[0][1];
  let headV = sample(k0);
  for (let j = 0; j < pts.length - 1; j++) {
    if (headX >= pts[j][0] && headX <= pts[j + 1][0]) {
      const f = (headX - pts[j][0]) / (pts[j + 1][0] - pts[j][0] || 1);
      headY = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f;
      headV = sample(k0 + j) + (sample(k0 + j + 1) - sample(k0 + j)) * f;
    }
  }
  const hot = headV > 4.5;
  const thr = yOf(4.5);
  return (
    <div className="max-w-[92%]">
      <div className="mono mb-2 flex items-center justify-between text-muted">
        <span>Ganancia por sesión (kg) · en vivo</span>
        <span className={`tabular-nums ${hot ? 'text-accent' : 'text-ink'}`}>{headV.toFixed(1).replace('.', ',')} kg</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" role="img" aria-label="Línea en vivo con la ganancia interdialítica por sesión, con picos sobre 4,5 kg">
        <defs>
          <clipPath id="spark-clip"><rect x="0" y="-10" width={headX} height={H + 20} /></clipPath>
          <linearGradient id="spark-fade" x1="0" x2="1"><stop offset="0" stopColor="#F2F0EB" stopOpacity="0.15" /><stop offset="0.4" stopColor="#F2F0EB" stopOpacity="1" /></linearGradient>
        </defs>
        <line x1="0" x2={W} y1={thr} y2={thr} stroke="#FF6B1A" strokeDasharray="3 4" strokeWidth="1" opacity="0.6" />
        <g clipPath="url(#spark-clip)">
          <path d={d} fill="none" stroke="url(#spark-fade)" strokeWidth="1.7" strokeLinejoin="round" />
          {pts.map(([x, y], i) => (sample(k0 + i) > 4.5 && x > 0 && x < headX ? <circle key={i} cx={x} cy={y} r="2.4" fill="#FF6B1A" /> : null))}
        </g>
        <line x1={headX} x2={headX} y1="0" y2={H} stroke="#FF6B1A" strokeWidth="1" opacity="0.35" strokeDasharray="2 3" />
        <circle cx={headX} cy={headY} r="9" fill="#FF6B1A" opacity="0.18" />
        <circle cx={headX} cy={headY} r="3.6" fill="#FF6B1A" />
      </svg>
    </div>
  );
}

export default function ChatDemo() {
  const reduced = usePrefersReducedMotion();
  const [run, setRun] = useState(0);
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const [phase, setPhase] = useState<'q' | 'think' | 'a' | 'done'>('q');
  const live = useRef(true);

  useEffect(() => {
    live.current = true;
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
      await sleep(350);
      for (let i = 1; i <= Q.length; i++) {
        if (!live.current) return;
        setQ(Q.slice(0, i));
        await sleep(17);
      }
      setPhase('think');
      await sleep(700);
      setPhase('a');
      const words = A.split(' ');
      for (let i = 1; i <= words.length; i++) {
        if (!live.current) return;
        setA(words.slice(0, i).join(' '));
        await sleep(62);
      }
      setPhase('done');
    })();
    return () => {
      live.current = false;
    };
  }, [run, reduced]);

  return (
    <div className="flex flex-col p-5 md:p-7">
      <div className="min-h-[22rem] space-y-4 text-[0.95rem]">
        <div className="ml-auto max-w-[88%] border border-line bg-surface2 p-3">
          <p className="mono mb-1 text-muted">Tú</p>
          <p className={phase === 'q' ? 'caret' : ''}>{q}</p>
        </div>
        {(phase === 'think' || phase === 'a' || phase === 'done') && (
          <div className="max-w-[92%] border border-accent/50 p-3 shadow-[0_0_24px_-10px_rgba(255,107,26,0.55)]">
            <p className="mono mb-1 flex items-center gap-2 text-accent">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> Asistente · Claude
            </p>
            {phase === 'think' ? (
              <p className="mono text-muted caret">consultando historial</p>
            ) : (
              <p className={phase === 'a' ? 'caret' : ''}>{a}</p>
            )}
          </div>
        )}
        {phase === 'done' && <Spark key={run} reduced={reduced} />}
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
