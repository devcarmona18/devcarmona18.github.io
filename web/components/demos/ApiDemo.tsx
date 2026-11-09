'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

type NodeKey = 'client' | 'api' | 'db' | 'wa';
const POS: Record<NodeKey, { x: number; y: number }> = {
  client: { x: 50, y: 70 },
  api: { x: 200, y: 70 },
  db: { x: 350, y: 70 },
  wa: { x: 200, y: 170 },
};
const NAMES: Record<NodeKey, string> = { client: 'CLIENTE', api: 'API', db: 'BASE DE DATOS', wa: 'WHATSAPP' };

interface Log {
  id: number;
  text: string;
  bad?: boolean;
}

const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

export default function ApiDemo() {
  const [down, setDown] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>(POS.client);
  const [packet, setPacket] = useState(true);
  const [fail, setFail] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const downRef = useRef(down);
  downRef.current = down;
  const id = useRef(0);

  useEffect(() => {
    let dead = false;
    const log = (text: string, bad = false) => setLogs((l) => [...l.slice(-4), { id: id.current++, text, bad }]);
    const go = async (k: NodeKey, ms = 650) => {
      setPos(POS[k]);
      await sleep(ms);
    };
    (async () => {
      while (!dead) {
        setFail(false);
        setPacket(true);
        setPos(POS.client);
        await sleep(400);
        if (dead) return;
        await go('api');
        if (dead) return;
        if (!downRef.current) {
          log('POST /api/pedidos 201 · 84ms');
          await go('db');
          if (dead) return;
          await go('api', 550);
          await go('client', 650);
          log('{"codigo":"FD-1013"}');
        } else {
          setFail(true);
          log('POST /api/pedidos 503 · timeout', true);
          await sleep(650);
          if (dead) return;
          await go('wa', 700);
          log('fallback: pedido enviado por WhatsApp ✓');
        }
        await sleep(1600);
      }
    })();
    return () => {
      dead = true;
    };
  }, []);

  return (
    <div className="p-5 md:p-7">
      <svg viewBox="0 0 400 210" className="w-full" role="img" aria-label="Diagrama: cliente, API y base de datos; con la API caída el pedido se desvía a WhatsApp">
        <g stroke="#2e2e2e" strokeWidth="1" strokeDasharray="3 4">
          <line x1="50" y1="70" x2="350" y2="70" />
          <line x1="200" y1="70" x2="200" y2="170" />
        </g>
        {(Object.keys(POS) as NodeKey[]).map((k) => {
          const p = POS[k];
          const isApi = k === 'api';
          const dead = isApi && fail;
          return (
            <g key={k}>
              <rect x={p.x - 38} y={p.y - 22} width="76" height="44" fill="#0A0A0A" stroke={dead ? '#FF3B30' : k === 'wa' && down ? '#FF6B1A' : '#3a3a3a'} strokeWidth="1" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontFamily="var(--font-mono), JetBrains Mono, monospace" fontSize="9" letterSpacing="1" fill={dead ? '#FF3B30' : '#F2F0EB'}>
                {NAMES[k] === 'BASE DE DATOS' ? 'BASE DATOS' : NAMES[k]}
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
        {packet && (
          <>
            <motion.circle r="14" fill="#FF6B1A" opacity="0.18" animate={{ cx: pos.x, cy: pos.y }} initial={false} transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }} />
            <motion.circle r="5" fill="#FF6B1A" animate={{ cx: pos.x, cy: pos.y }} initial={false} transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }} />
          </>
        )}
      </svg>
      <div className="mono mt-3 h-[7.5rem] overflow-hidden border border-line bg-bg p-3 !normal-case !tracking-[0.02em] text-[11px] leading-6" aria-live="polite">
        {logs.map((l) => (
          <motion.p key={l.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={l.bad ? 'text-[#FF3B30]' : l.text.startsWith('fallback') ? 'text-accent' : 'text-muted'}>
            <span className="text-line">&gt; </span>{l.text}
          </motion.p>
        ))}
      </div>
      <label className="mono mt-4 flex cursor-pointer items-center gap-3">
        <input type="checkbox" checked={down} onChange={(e) => setDown(e.target.checked)} className="peer sr-only" />
        <span className="relative h-5 w-9 border border-line bg-bg transition-colors peer-checked:border-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent after:absolute after:left-[3px] after:top-[3px] after:h-3 after:w-3 after:bg-muted after:transition-all peer-checked:after:left-[19px] peer-checked:after:bg-accent" />
        Simular caída de la API
      </label>
    </div>
  );
}
