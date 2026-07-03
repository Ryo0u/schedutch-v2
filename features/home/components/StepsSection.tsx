import BrowserFrame from './BrowserFrame';
import ScrollReveal from './ScrollReveal';

const STEPS = [
  {
    n: '01',
    title: 'イベントを作る',
    body: 'タイトルと候補日・時間帯を選ぶだけ。カレンダーから日付を選び、開始・終了時刻を指定できます。',
    src: '/lp/step-1.png',
    alt: 'Schedutchのイベント作成画面。イベント名と候補日を入力している状態',
    filename: 'step-1.png — イベント作成画面',
    url: 'schedutch.app/new',
  },
  {
    n: '02',
    title: 'URLを共有する',
    body: '発行されたURLを参加者に送るだけ。相手側もアカウント登録は要りません。',
    src: '/lp/step-2.png',
    alt: 'SchedutchのURL発行画面。イベントURLが表示されている',
    filename: 'step-2.png — URL共有画面',
    url: 'schedutch.app/event/...',
  },
  {
    n: '03',
    title: 'みんなが回答する',
    body: '各候補日に「参加できる○・未定▲・参加できない✕」を30分単位で選んで回答。',
    src: '/lp/step-3.png',
    alt: '参加者の回答入力画面。時間帯ごとに○▲✕が色分けされたセルが並んでいる',
    filename: 'step-3.png — 回答入力画面',
    url: 'schedutch.app/event/...',
  },
  {
    n: '04',
    title: '一覧で確認する',
    body: '全員の回答がタイムラインで可視化。誰がいつ空いているか、ひと目でわかります。',
    src: '/lp/step-4.png',
    alt: 'イベント詳細の予定一覧グリッド。複数人の回答が色で表示されている',
    filename: 'step-4.png — 予定一覧グリッド',
    url: 'schedutch.app/event/...',
  },
] as const;

export default function StepsSection() {
  return (
    <section id="how" className="bg-muted pt-24 pb-32 sm:pt-32 sm:pb-40">
      {/* セクションヘッダー */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          使い方は、4ステップ。
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          アカウント登録不要。URLを共有するだけで、全員の予定が揃います。
        </p>
      </div>

      {/* ステップ一覧 */}
      <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-20">
        {STEPS.map((step, i) => {
          const isEven = i % 2 === 1;
          return (
            <ScrollReveal key={step.n}>
              <div
                className={`mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-10 ${
                  isEven ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* スクリーンショット */}
                <div className="w-full lg:w-[55%]">
                  <BrowserFrame
                    src={step.src}
                    alt={step.alt}
                    filename={step.filename}
                    url={step.url}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                  />
                </div>

                {/* テキストカード */}
                <div className="card-pop flex-1 p-8">
                  <span className="sticker font-mono text-sm font-bold text-primary">
                    STEP {step.n}
                  </span>
                  <h3 className="font-heading mt-4 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {step.body}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
