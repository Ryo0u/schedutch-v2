const FEATURES = [
  {
    title: '登録なし・ログインなし',
    body: 'URLだけで作成から回答まで完結。参加者に負担をかけません。',
    chip: 'bg-blue-400/80',
  },
  {
    title: 'パスワード保護',
    body: 'イベント・参加者それぞれにパスワードを設定でき、編集や削除を守れます。',
    chip: 'bg-yellow-300/80',
  },
  {
    title: '30分単位の候補日',
    body: '「6/10の14:00〜18:00」のように、日付だけでなく時間帯まで指定できます。',
    chip: 'bg-blue-400/80',
  },
  {
    title: 'コピペできる抽出結果',
    body: '抽出した空き枠はテキストで出力。そのまま通知やカレンダーに貼れます。',
    chip: 'bg-yellow-300/80',
  },
];

export default function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
      <h2 className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        気軽に使えて、<span className="marker">ちゃんと守れる</span>
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={"card-pop card-pop-interactive p-6"}
          >
            <span className={`inline-block h-2.5 w-2.5 rounded-sm ${f.chip}`} aria-hidden="true" />
            <h3 className="mt-3 text-lg font-bold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
