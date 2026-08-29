import { CONDITIONS, EXTRACT_RESULT } from '../../constants';

export default function ExtractSection() {
  return (
    <section id="extract" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <span className="sticker text-primary font-mono text-xs tracking-widest">
          SCHEDUTCH独自の機能
        </span>
        <h2 className="font-heading text-foreground mt-4 text-3xl font-black tracking-tight sm:text-4xl">
          空き枠は、探さず<span className="marker">絞り込む</span>。
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
          集まった回答を眺めて空きを探す必要はありません。条件を指定すれば、当てはまる時間帯だけを自動で一覧にします。
        </p>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-2">
          {/* 条件チップ */}
          <div>
            <p className="text-foreground mb-4 text-sm font-bold">たとえば、こんな条件で</p>
            <ul className="flex flex-wrap gap-2">
              {CONDITIONS.map((c, i) => (
                <li
                  key={c}
                  className={`border-foreground/70 bg-secondary text-secondary-foreground dark:border-foreground/25 rounded-full border-2 px-4 py-2 text-sm shadow-[2px_2px_0_var(--shadow-ink)] ${
                    i % 3 === 0 ? '-rotate-1' : i % 3 === 1 ? 'rotate-1' : ''
                  }`}
                >
                  {c}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
              結果はそのままコピーして、通知やカレンダーに貼れます。
            </p>
          </div>

          {/* 出力例 */}
          <div>
            <div className="card-pop bg-muted p-5">
              <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs">
                <span>抽出結果</span>
                <span aria-hidden="true">⧉ コピー</span>
              </div>
              <pre className="text-primary overflow-x-auto font-mono text-xs leading-relaxed whitespace-pre-wrap sm:text-sm">
                {EXTRACT_RESULT}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
