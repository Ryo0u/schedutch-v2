import Link from 'next/link';

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 80%)',
          opacity: 0.35,
        }}
      />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-heading text-foreground text-3xl font-black tracking-tight sm:text-4xl">
          次の集まり、<span className="marker text-primary">30秒</span>で作れます
        </h2>
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
          候補日を選んでURLを送るだけ。登録もログインも要りません。
        </p>
        <Link
          href="/new"
          className="border-foreground bg-primary text-primary-foreground focus-visible:ring-ring dark:border-foreground/25 mt-8 inline-block rounded-xl border-2 px-10 py-4 text-base font-bold shadow-[5px_5px_0_var(--shadow-ink-primary)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--shadow-ink-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          無料でイベントを作成
        </Link>
      </div>
    </section>
  );
}
