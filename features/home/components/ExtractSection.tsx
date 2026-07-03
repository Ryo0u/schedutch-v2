const CONDITIONS = [
  'AさんとBさんが両方参加できる枠',
  '3人以上集まれる枠',
  '2時間以上連続して空いている枠',
  '▲（未定）も予定に含める',
  'この日付範囲だけ対象にする',
];

const EXTRACT_RESULT = `7/3
06:00 - 08:00 : A, B, C
15:30 - 20:00 : A, B(▲), C

7/4
06:00 - 07:30 : A, B, C
19:30 - 21:00 : A, B, C`;

export default function ExtractSection() {
  return (
    <section id="extract" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <span className="sticker font-mono text-xs tracking-widest text-primary">
          SCHEDUTCH独自の機能
        </span>
        <h2 className="font-heading mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          空き枠は、探さず<span className="marker">絞り込む</span>。
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          集まった回答を眺めて空きを探す必要はありません。条件を指定すれば、当てはまる時間帯だけを自動で一覧にします。
        </p>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-2">
          {/* 条件チップ */}
          <div>
            <p className="mb-4 text-sm font-bold text-foreground">たとえば、こんな条件で</p>
            <ul className="flex flex-wrap gap-2">
              {CONDITIONS.map((c, i) => (
                <li
                  key={c}
                  className={`rounded-full border-2 border-foreground/70 bg-secondary px-4 py-2 text-sm text-secondary-foreground shadow-[2px_2px_0_var(--shadow-ink)] dark:border-foreground/25 ${
                    i % 3 === 0 ? '-rotate-1' : i % 3 === 1 ? 'rotate-1' : ''
                  }`}
                >
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              結果はそのままコピーして、通知やカレンダーに貼れます。
            </p>
          </div>

          {/* 出力例 */}
          <div>
            <div className="card-pop bg-muted p-5">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>抽出結果</span>
                <span aria-hidden="true">⧉ コピー</span>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-primary sm:text-sm">
                {EXTRACT_RESULT}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
