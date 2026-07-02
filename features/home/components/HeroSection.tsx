import Link from 'next/link';
import HeroGrid from './HeroGrid';

export default function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:pt-20">
      <div>
        <p className="mb-4 font-mono text-xs font-medium tracking-widest text-primary">
          登録不要の日程調整ツール
        </p>
        <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl">
          「じゃあ、いつ
          <br className="sm:hidden" />
          集まれる？」に、
          <br />
          <span className="text-primary">自動で答えを。</span>
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
          Schedutchは30分単位で予定を集めて、全員が空いている時間帯を自動で抽出する日程調整ツール。URLを送るだけで、登録もログインも要りません。
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/new"
            className="rounded-xl bg-primary px-7 py-3 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            無料でイベントを作成
          </Link>
          <a
            href="#how"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            使い方を見る →
          </a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground/60">
          アカウント登録・メールアドレス不要／参加者側も同じく不要
        </p>
      </div>
      <HeroGrid />
    </section>
  );
}
