type CellStatus = 'o' | 't' | 'x';

const SAMPLE_CELLS = 'ootooooooxxo'.split('') as CellStatus[];

const cellColor: Record<CellStatus, string> = {
  o: 'bg-blue-400/80',
  t: 'bg-yellow-300/80',
  x: 'bg-muted',
};

export default function ComparisonSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        日単位じゃなく、時間帯で決める
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        既存の調整ツールは「○か△か✕か」を日単位で集めて終わり。Schedutchは30分単位の時間帯を候補にできるので、「その日の何時なら空いてる？」まで一度に決まります。
      </p>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <p className="font-mono text-xs tracking-widest text-muted-foreground">
            これまでの調整ツール
          </p>
          <div className="mt-4 overflow-hidden rounded-lg border">
            <table className="w-full text-center text-sm">
              <thead className="bg-muted text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 font-medium">日付</th>
                  <th className="py-2 font-medium">りょう</th>
                  <th className="py-2 font-medium">れおん</th>
                  <th className="py-2 font-medium">はな</th>
                </tr>
              </thead>
              <tbody className="text-foreground/70">
                <tr className="border-t">
                  <td className="py-2 font-mono text-xs">7/3</td>
                  <td>○</td>
                  <td>△</td>
                  <td>○</td>
                </tr>
                <tr className="border-t">
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

        <div className="rounded-2xl border-2 border-primary/30 bg-accent p-6">
          <p className="font-mono text-xs tracking-widest text-primary">Schedutch</p>
          <div className="mt-4 flex items-center gap-1 overflow-x-auto rounded-lg border border-primary/20 bg-card p-3">
            <span className="shrink-0 pr-2 font-mono text-xs text-muted-foreground">7/3</span>
            {SAMPLE_CELLS.map((s, i) => (
              <i key={i} className={`h-6 w-4 shrink-0 rounded-sm ${cellColor[s]}`} />
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground">
            30分刻みの時間帯で回答が集まるから、
            <span className="font-bold text-primary">「7/3の18:00〜20:00」</span>
            まで一度に決まる。
          </p>
        </div>
      </div>
    </section>
  );
}
