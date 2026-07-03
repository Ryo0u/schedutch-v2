type CellStatus = 'o' | 't' | 'x';

const ROWS: { name: string; cells: CellStatus[] }[] = [
  { name: 'A', cells: ['o', 'o', 'x', 'x', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'] },
  { name: 'B', cells: ['x', 'x', 'o', 'o', 't', 't', 'o', 'o', 'o', 'o', 'x', 'x'] },
  { name: 'C', cells: ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'] },
];

const TIME_LABELS = ['15', '16', '17', '18', '19', '20'];

const cellColor: Record<CellStatus, string> = {
  o: 'bg-blue-400/80',
  t: 'bg-yellow-300/80',
  x: 'bg-muted',
};

export default function ComparisonSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          日単位じゃなく、時間帯で決める。
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          既存ツールは「○か△か✕か」を日単位で集めて終わり。Schedutchは30分単位の時間帯を候補にできるので、「その日の何時なら空いてる？」まで一度に決まります。
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* 従来ツール */}
          <div className="rounded-2xl border border-border p-6 opacity-70">
            <p className="font-mono text-xs tracking-widest text-muted-foreground">
              これまでの調整ツール
            </p>
            <div className="mt-4 overflow-hidden rounded-lg border border-border">
              <table className="w-full text-center text-sm">
                <thead className="bg-muted text-xs text-muted-foreground">
                  <tr>
                    <th className="py-2 font-medium">日付</th>
                    <th className="py-2 font-medium">Aさん</th>
                    <th className="py-2 font-medium">Bさん</th>
                    <th className="py-2 font-medium">Cさん</th>
                  </tr>
                </thead>
                <tbody className="text-foreground/70">
                  <tr className="border-t border-border">
                    <td className="py-2 font-mono text-xs">7/3</td>
                    <td>○</td>
                    <td>△</td>
                    <td>○</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="py-2 font-mono text-xs">7/4</td>
                    <td>△</td>
                    <td>○</td>
                    <td>✕</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              日は決まっても、「で、何時から？」の調整がもう一往復発生する。
            </p>
          </div>

          {/* Schedutch */}
          <div className="card-pop p-6">
            <span className="sticker font-mono text-xs tracking-widest text-primary">
              Schedutch
            </span>
            <div className="mt-4 overflow-x-auto rounded-lg border border-border p-3">
              {/* 時刻ラベル */}
              <div className="mb-1 flex pl-8">
                {TIME_LABELS.map((h) => (
                  <div
                    key={h}
                    className="text-center font-mono text-[10px] text-muted-foreground"
                    style={{ width: '44px' }}
                  >
                    {h}:00
                  </div>
                ))}
              </div>
              {/* セルグリッド */}
              {ROWS.map((row) => (
                <div key={row.name} className="mb-1 flex items-center gap-1">
                  <span className="w-7 shrink-0 text-right font-mono text-xs text-muted-foreground">
                    {row.name}
                  </span>
                  <div className="flex gap-0.5">
                    {row.cells.map((s, i) => (
                      <div
                        key={i}
                        className={`h-5 w-[20px] shrink-0 rounded-sm ${cellColor[s]}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground">
              30分刻みの時間帯で回答が集まるから、
              <span className="font-bold text-primary">「7/3の18:00〜20:00」</span>
              まで一度に決まる。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
