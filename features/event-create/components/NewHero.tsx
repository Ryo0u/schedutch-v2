export default function NewHero() {
  const steps = [
    { n: 1, label: '基本情報を入力', sub: 'イベント名・パスワード' },
    { n: 2, label: '候補日を選択', sub: '日付と時間帯を追加' },
    { n: 3, label: 'URL を共有', sub: '参加者に送るだけ' },
  ];

  return (
    <div className="mb-6 space-y-5 px-1 pt-2">
      {/* Title */}
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
          New Event
        </p>
        <h2 className="text-2xl font-bold tracking-tight">イベントを作成</h2>
        <p className="text-sm text-muted-foreground">
          候補日を選んで URL を送るだけで完了します。
        </p>
      </div>

      {/* Step track */}
      <div className="relative flex items-start justify-between">
        {/* Gradient connecting line behind circles */}
        <div
          className="absolute left-3.5 right-3.5 top-3.5 h-px bg-linear-to-r from-primary/60 via-violet-400/40 to-violet-400/20"
          aria-hidden="true"
        />
        {steps.map((step) => (
          <div key={step.n} className="relative flex flex-1 flex-col items-center">
            <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {step.n}
            </div>
            <div className="mt-2 px-1 text-center">
              <p className="text-xs font-semibold leading-snug text-foreground">
                {step.label}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {step.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
