const STEPS = [
  {
    n: '1',
    title: 'イベントを作る',
    body: 'タイトルと候補日・時間帯を選ぶだけでURLを発行。会員登録は不要です。',
  },
  {
    n: '2',
    title: 'URLを共有する',
    body: '参加者にリンクを送るだけ。相手側もアカウントは要りません。',
  },
  {
    n: '3',
    title: 'みんなが回答する',
    body: '各候補について「参加できる・未定・参加できない」を30分単位で答えます。',
  },
  {
    n: '4',
    title: '一覧で確認する',
    body: '全員の回答がタイムラインで可視化。空いている時間帯がひと目でわかります。',
  },
];

export default function StepsSection() {
  return (
    <section id="how" className="border-y bg-card py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          使い方は4ステップ
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          作る人も答える人も、やることは最小限。URLひとつで全員の予定が集まります。
        </p>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl border bg-background p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-mono text-sm font-bold text-primary-foreground">
                {s.n}
              </span>
              <h3 className="mt-4 text-lg font-bold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
