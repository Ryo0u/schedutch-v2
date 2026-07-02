import Link from 'next/link';

export default function CtaSection() {
  return (
    <section className="border-t bg-card py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          次の集まり、<span className="text-primary">30秒</span>で作れます
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          候補日を選んでURLを送るだけ。登録もログインも要りません。
        </p>
        <Link
          href="/new"
          className="mt-8 inline-block rounded-xl bg-primary px-10 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          無料でイベントを作成
        </Link>
      </div>
    </section>
  );
}
