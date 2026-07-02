const CONDITIONS = [
  'りょうとれおんが両方参加できる枠',
  '3人以上集まれる枠',
  '2時間以上連続して空いている枠',
  '▲（未定）も予定に含める',
  'この日付範囲だけ対象にする',
];

const EXTRACT_RESULT = `7/3
06:00 - 08:00 : りょう, れおん, はな
15:30 - 20:00 : りょう, れおん(▲), はな

7/4
06:00 - 07:30 : りょう, れおん, はな
19:30 - 21:00 : りょう, れおん, はな`;

export default function ExtractSection() {
  return (
    <section id="extract" className="border-y bg-foreground py-20 text-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-xs tracking-widest text-primary">SCHEDUTCH独自の機能</p>
        <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
          予定抽出 — 空き枠は、探さず絞り込む
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background/70">
          集まった回答を眺めて空きを探す必要はありません。条件を指定すれば、当てはまる時間帯だけを自動で一覧にします。
        </p>
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-bold text-background/90">たとえば、こんな条件で</p>
            <ul className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-background/20 bg-background/10 px-4 py-2 text-sm text-background/80"
                >
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-background/60">
              結果はそのままコピーできるテキスト形式。「日程が決まったら参加者に連絡する」までの手間を最小化します。
            </p>
          </div>
          <div className="rounded-2xl border border-background/10 bg-background/5 p-5">
            <div className="mb-3 flex items-center justify-between text-xs text-background/40">
              <span>抽出結果</span>
              <span>⧉ コピー</span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-emerald-400 sm:text-sm">
              {EXTRACT_RESULT}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
