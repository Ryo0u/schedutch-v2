import { COMPARISON_ROWS, COMPARISON_TIME_LABELS, type CellStatus } from '../../constants';

const cellColor: Record<CellStatus, string> = {
  o: 'bg-blue-400/80',
  t: 'bg-yellow-300/80',
  x: 'bg-muted',
};

export default function PreviewCard() {
  return (
    <div className="card-pop min-w-0 p-6">
      <span className="sticker text-primary font-mono text-xs tracking-widest">Schedutch</span>
      <div className="border-border mt-4 overflow-x-auto rounded-lg border p-3">
        {/* 時刻ラベル */}
        <div className="mb-1 flex pl-8">
          {COMPARISON_TIME_LABELS.map((h) => (
            <div
              key={h}
              className="text-muted-foreground text-center font-mono text-[10px]"
              style={{ width: '44px' }}
            >
              {h}:00
            </div>
          ))}
        </div>
        {/* セルグリッド */}
        {COMPARISON_ROWS.map((row) => (
          <div key={row.name} className="mb-1 flex items-center gap-1">
            <span className="text-muted-foreground w-7 shrink-0 text-right font-mono text-xs">
              {row.name}
            </span>
            <div className="flex gap-0.5">
              {row.cells.map((s, i) => (
                <div key={i} className={`h-5 w-5 shrink-0 rounded-sm ${cellColor[s]}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-foreground mt-4 text-sm leading-relaxed">
        30分刻みの時間帯で回答が集まるから、
        <span className="text-primary font-bold">「7/3の18:00〜20:00」</span>
        まで一度に決まる。
      </p>
    </div>
  );
}
