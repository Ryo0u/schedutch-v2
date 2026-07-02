const FEATURES = [
  {
    title: '登録なし・ログインなし',
    body: 'URLだけで作成から回答まで完結。参加者に負担をかけません。',
  },
  {
    title: 'パスワード保護',
    body: 'イベント・参加者それぞれにパスワードを設定でき、編集や削除を守れます。',
  },
  {
    title: '30分単位の候補日',
    body: '「6/10の14:00〜18:00」のように、日付だけでなく時間帯まで指定できます。',
  },
  {
    title: 'コピペできる抽出結果',
    body: '抽出した空き枠はテキストで出力。そのまま通知やカレンダーに貼れます。',
  },
];

export default function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        気軽に使えて、ちゃんと守れる
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border bg-card p-6">
            <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
