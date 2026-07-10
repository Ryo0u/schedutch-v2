'use client';

import { useState, useEffect } from 'react';
import { usePrefersReducedMotion } from '@/features/home/hooks/usePrefersReducedMotion';

const CELL_W = 1.5;
const GAP = 0.25;
const PITCH = CELL_W + GAP;
const NAME_W = 3.5;
const GRID_LEFT = NAME_W + GAP;

const SLOT_LABELS = ['15', '16', '17', '18', '19', '20'];

const MEMBERS = [
  { name: 'Aさん', cells: 'oooxxooooooo' },
  { name: 'Bさん', cells: 'xxoottooooxx' },
  { name: 'Cさん', cells: 'oooooooooooo' },
];

const HL_START = 6;
const HL_END = 9;

const RESULT_TEXT = '7/3  18:00 - 20:00 : Aさん, Bさん, Cさん';

type CellStatus = 'o' | 't' | 'x';

function Cell({
  status,
  delay,
  dimmed,
}: {
  status: CellStatus;
  delay: number;
  dimmed: boolean;
}) {
  const styles: Record<CellStatus, string> = {
    o: 'bg-blue-400/80 text-white',
    t: 'bg-yellow-300/80 text-yellow-900',
    x: 'bg-muted text-muted-foreground',
  };
  const marks: Record<CellStatus, string> = { o: '○', t: '▲', x: '✕' };
  return (
    <div
      className={`cell-in flex h-8 w-6 shrink-0 items-center justify-center rounded-sm font-bold transition-opacity duration-500 ${styles[status]} ${dimmed ? 'opacity-25' : 'opacity-100'}`}
      style={{ animationDelay: `${delay}ms`, fontSize: '10px' }}
    >
      {marks[status]}
    </div>
  );
}

export default function HeroGrid() {
  const [animatedPhase, setAnimatedPhase] = useState(0);
  const [animatedText, setAnimatedText] = useState('');
  const prefersReducedMotion = usePrefersReducedMotion();
  // reduced-motion 時はアニメーションを走らせず、最初から完了状態を表示する
  const phase = prefersReducedMotion ? 2 : animatedPhase;
  const typed = prefersReducedMotion ? RESULT_TEXT : animatedText;

  useEffect(() => {
    if (prefersReducedMotion) return;
    const t1 = setTimeout(() => setAnimatedPhase(1), 2300);
    const t2 = setTimeout(() => setAnimatedPhase(2), 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (phase !== 2 || prefersReducedMotion) return;
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setAnimatedText(RESULT_TEXT.slice(0, i));
      if (i >= RESULT_TEXT.length) clearInterval(iv);
    }, 28);
    return () => clearInterval(iv);
  }, [phase, prefersReducedMotion]);

  return (
    <div className="card-pop w-full p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-md bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
          4月1日(月)
        </span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-400/80" />
            参加できる
          </span>
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-sm bg-yellow-300/80" />
            未定
          </span>
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-sm bg-muted-foreground/30" />
            参加できない
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div style={{ width: 'fit-content' }}>
          <div
            className="mb-1 flex font-mono text-muted-foreground"
            style={{ paddingLeft: `${GRID_LEFT}rem`, fontSize: '10px' }}
          >
            {SLOT_LABELS.map((h) => (
              <div key={h} style={{ width: `${PITCH * 2}rem` }}>
                {h}:00
              </div>
            ))}
          </div>

          <div className="relative">
            {MEMBERS.map((m, row) => (
              <div key={m.name} className="mb-1 flex items-center gap-1">
                <div className="w-14 shrink-0 truncate text-right text-xs font-medium text-foreground/70">
                  {m.name}
                </div>
                <div className="flex gap-1">
                  {(m.cells.split('') as CellStatus[]).map((s, col) => (
                    <Cell
                      key={col}
                      status={s}
                      delay={row * 250 + col * 90}
                      dimmed={phase >= 1 && (col < HL_START || col > HL_END)}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div
              className={`pointer-events-none absolute rounded-lg border-2 border-primary transition-opacity duration-700 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}
              style={{
                top: '-0.25rem',
                left: `${GRID_LEFT + HL_START * PITCH - 0.125}rem`,
                width: `${(HL_END - HL_START + 1) * PITCH}rem`,
                height: 'calc(100% + 0.25rem)',
              }}
            />
          </div>
        </div>
      </div>

      <div
        className={`card-pop mt-4 bg-muted p-5 transition-all duration-500 ${phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
      >
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>抽出結果</span>
          <span aria-hidden="true">⧉ コピー</span>
        </div>
        <p className="font-mono text-xs text-primary sm:text-sm">
          {typed}
          <span className="animate-pulse">▍</span>
        </p>
      </div>
    </div>
  );
}
