import Link from 'next/link';
import HeroGrid from './HeroGrid';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90svh]">
      {/* 方眼グリッド背景 */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 120% 80% at 50% 0%, black 40%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 120% 80% at 50% 0%, black 40%, transparent 85%)',
          opacity: 0.35,
        }}
      />

      <div className="relative mx-auto flex min-h-[90svh] max-w-7xl flex-col gap-12 px-4 pt-16 pb-12 sm:px-6 lg:flex-row lg:items-center lg:gap-8 lg:py-0">
        {/* キャッチコピー */}
        <div className="flex-1 lg:py-24">
          <h1 className="font-heading leading-none font-black tracking-tight">
            <span
              className="hero-line text-foreground block"
              style={{
                fontSize: 'clamp(2.4rem, 5.5vw, 5rem)',
                animationDelay: '0ms',
              }}
            >
              いつ集まれる？を、
            </span>
            <span
              className="hero-line text-primary block"
              style={{
                fontSize: 'clamp(3rem, 8vw, 7rem)',
                animationDelay: '150ms',
              }}
            >
              自動で。
            </span>
          </h1>

          <p
            className="hero-line text-muted-foreground mt-6 max-w-md text-base leading-relaxed sm:text-lg"
            style={{ animationDelay: '280ms' }}
          >
            30分単位の日程調整ツール。登録もログインも要りません。
          </p>

          <div
            className="hero-line mt-8 flex flex-wrap items-center gap-3"
            style={{ animationDelay: '380ms' }}
          >
            <Link
              href="/new"
              className="border-foreground bg-primary text-primary-foreground focus-visible:ring-ring dark:border-foreground/25 inline-flex items-center gap-2 rounded-xl border-2 px-8 py-3.5 text-base font-bold shadow-[4px_4px_0_var(--shadow-ink-primary)] transition-all duration-100 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--shadow-ink-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--shadow-ink-primary)]"
            >
              無料でイベントを作成
            </Link>
            <a
              href="#how"
              className="text-muted-foreground hover:text-foreground text-sm font-medium underline-offset-4 hover:underline"
            >
              使い方を見る
            </a>
          </div>

          <ul className="text-muted-foreground mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            {['会員登録なし', 'ずっと無料', '30秒でイベント作成'].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <svg
                  className="text-primary h-3.5 w-3.5 shrink-0"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                    clipRule="evenodd"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* アニメーショングリッド */}
        <div className="w-full shrink-0 lg:w-[52%]">
          <div className="transition-transform duration-300 lg:rotate-1 lg:hover:rotate-0">
            <HeroGrid />
          </div>
        </div>
      </div>
    </section>
  );
}
