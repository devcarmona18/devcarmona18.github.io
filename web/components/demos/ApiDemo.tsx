'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { sleep, usePrefersReducedMotion, useTween } from '@/lib/hooks';

type NodeKey = 'client' | 'api' | 'db' | 'wa';
const POS: Record<NodeKey, { x: number; y: number }> = {
  client: { x: 50, y: 70 },
  api: { x: 200, y: 70 },
  db: { x: 350, y: 70 },
  wa: { x: 200, y: 170 },
};
const NAMES: Record<NodeKey, string> = { client: 'CLIENTE', api: 'API', db: 'BASE DATOS', wa: 'WHATSAPP' };

interface Log {
  id: number;
  text: string;
  kind: 'ok' | 'bad' | 'fb';
}

const AMBIENT = [
  'GET  /api/catalogo 200 · 38ms',
  'GET  /api/clientes/FD-1009 200 · 52ms',
  'POST /api/webhook/whatsapp 202 · 61ms',
  'PATCH /api/pedidos/FD-1012 200 · 74ms',
  'GET  /health 200 · 4ms',
  'GET  /api/pedidos?estado=cotizado 200 · 47ms',
  'POST /api/auth/refresh 200 · 29ms',
];

const stamp = () => new Date().toLocaleTimeString('es-CO', { hour12: false });

export default function ApiDemo() {
  const reduced = usePrefersReducedMotion();
  const [manualDown, setManualDown] = useState(false);
  const [autoDown, setAutoDown] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>(POS.client);
  const [fail, setFail] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [rps, setRps] = useState(128);
  const [p95, setP95] = useState(84);
  const manualRef = useRef(manualDown);
  manualRef.current = manualDown;
  const id = useRef(0);
  const shownRps = useTween(rps, 600);
  const shownP95 = useTween(p95, 600);
  const down = manualDown || autoDown;

  useEffect(() => {
    if (reduced) {
      setLogs([
        { id: 0, kind: 'ok', text: `${stamp()}  POST /api/pedidos 201 · 84ms` },
        { id: 1, kind: 'bad', text: `${stamp()}  POST /api/pedidos 503 · timeout` },
        { id: 2, kind: 'fb', text: `${stamp()}  fallback: pedido enviado por WhatsApp ✓` },
      ]);
      return;
    }
    let dead = false;
    const log = (text: string, kind: Log['kind'] = 'ok') => setLogs((l) => [...l.slice(-6), { id: id.current++, text: `${stamp()}  ${text}`, kind }]);
    const go = async (k: NodeKey, ms = 650) => {
      setPos(POS[k]);
      await sleep(ms);
    };
    const amb = window.setInterval(() => log(AMBIENT[Math.floor(Math.random() * AMBIENT.length)]), 900);
    const nums = window.setInterval(() => {
      setRps((v) => Math.max(90, Math.min(190, Math.round(v + (Math.random() - 0.5) * 36))));
      setP95((v) => Math.max(52, Math.min(130, Math.round(v + (Math.random() - 0.5) * 22))));
    }, 1300);
    (async () => {
      let cycle = 0;
      while (!dead) {
        const simulate = cycle % 3 === 2;
        setAutoDown(simulate);
        setFail(false);
        setPos(POS.client);
        await sleep(500);
        if (dead) return;
        await go('api');
        if (dead) return;
        if (!simulate && !manualRef.current) {
          log('POST /api/pedidos 201 · 84ms');
          await go('db');
          if (dead) return;
          await go('api', 550);
          await go('client', 650);
          log('{"codigo":"FD-10' + (13 + cycle) + '"}');
        } else {
          setFail(true);
          log('POST /api/pedidos 503 · timeout', 'bad');
          await sleep(700);
          if (dead) return;
          await go('wa', 700);
          log('fallback: pedido enviado por WhatsApp ✓', 'fb');
        }
        await sleep(1500);
        cycle += 1;
      }
    })();
    return () => {
      dead = true;
      window.clearInterval(amb);
      window.clearInterval(nums);
    };
  }, [reduced]);

  return (
    <div className="p-5 md:p-7">
      <div className="mono mb-3 flex items-center justify-between gap-3 text-muted">
        <span className="flex gap-4 tabular-nums">
          <span><span className="text-ink">{Math.round(shownRps)}</span> req/s</span>
          <span>p95 <span className="text-ink">{Math.round(shownP95)}</span>ms</span>
        </span>
        <span className={`border px-2 py-0.5 transition-colors ${fail ? 'animate-pulse border-[#FF3B30] text-[#FF3B30]' : 'border-line text-accent'}`}>
          {fail ? 'FALLO · PLAN B' : 'EN LÍNEA'}
        </span>
      </div>
      <svg viewBox="0 0 400 210" className="mx-auto w-full max-w-[30rem]" role="img" aria-label="Diagrama: cliente, API y base de datos; con la API caída el pedido se desvía a WhatsApp">
        <g stroke="#2e2e2e" strokeWidth="1" strokeDasharray="3 4">
          <line x1="50" y1="70" x2="350" y2="70" />
          <line x1="200" y1="70" x2="200" y2="170" />
        </g>
        {!reduced && (
          <g fill="#F2F0EB" opacity="0.55">
            {[0, 1.1, 2.2].map((b) => (
              <circle key={b} r="2" cy="0" cx="0">
                <animateMotion dur="3.3s" begin={`${b}s`} repeatCount="indefinite" path="M50,70 L350,70" />
              </circle>
            ))}
            {[0.4, 1.9].map((b) => (
              <circle key={b} r="2">
                <animateMotion dur="2.4s" begin={`${b}s`} repeatCount="indefinite" path="M350,70 L50,70" />
              </circle>
            ))}
            <circle r="2" fill="#FF6B1A">
              <animateMotion dur="2.8s" begin="0.7s" repeatCount="indefinite" path="M200,70 L200,170" />
            </circle>
          </g>
        )}
        {(Object.keys(POS) as NodeKey[]).map((k) => {
          const p = POS[k];
          const dead = k === 'api' && fail;
          const live = k === 'wa' && down;
          return (
            <g key={k}>
              <rect x={p.x - 40} y={p.y - 22} width="80" height="44" fill="#0A0A0A" stroke={dead ? '#FF3B30' : live ? '#FF6B1A' : '#3a3a3a'} strokeWidth="1" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10.5" letterSpacing="0.5" fill={dead ? '#FF3B30' : '#F2F0EB'}>
                {NAMES[k]}
              </text>
              {dead && (
                <g stroke="#FF3B30" strokeWidth="3" strokeLinecap="square">
                  <line x1={p.x + 22} y1={p.y - 34} x2={p.x + 36} y2={p.y - 20} />
                  <line x1={p.x + 36} y1={p.y - 34} x2={p.x + 22} y2={p.y - 20} />
                </g>
              )}
            </g>
          );
        })}
        {!reduced && (
          <>
            <motion.circle r="14" fill="#FF6B1A" opacity="0.2" animate={{ cx: pos.x, cy: pos.y }} initial={false} transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }} />
            <motion.circle r="5" fill={fail ? '#FF3B30' : '#FF6B1A'} animate={{ cx: pos.x, cy: pos.y }} initial={false} transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }} />
          </>
        )}
      </svg>
      <div className="mono mt-3 flex h-[8rem] flex-col justify-end overflow-hidden border border-line bg-bg p-3 !normal-case !tracking-[0.02em] text-[11px] leading-6" aria-hidden="true">
        {logs.slice(-6).map((l) => (
          <motion.p key={l.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`truncate ${l.kind === 'bad' ? 'text-[#FF3B30]' : l.kind === 'fb' ? 'text-accent' : 'text-muted'}`}>
            <span className="text-line">&gt; </span>{l.text}
          </motion.p>
        ))}
      </div>
      <label className="mono mt-4 flex cursor-pointer items-center gap-3">
        <input type="checkbox" checked={manualDown} onChange={(e) => setManualDown(e.target.checked)} className="peer sr-only" />
        <span className="relative h-5 w-9 border border-line bg-bg transition-colors peer-checked:border-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent after:absolute after:left-[3px] after:top-[3px] after:h-3 after:w-3 after:bg-muted after:transition-all peer-checked:after:left-[19px] peer-checked:after:bg-accent" />
        Forzar caída de la API
      </label>
    </div>
  );
}
