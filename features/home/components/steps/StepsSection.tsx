import ScrollReveal from '../ScrollReveal';
import StepCard from './StepCard';
import { STEPS } from '../../constants';

export default function StepsSection() {
  return (
    <section id="how" className="pt-24 pb-32 sm:pt-32 sm:pb-40">
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
      <div className="relative mx-auto mt-16 max-w-7xl px-4 sm:mt-20 sm:px-6">
        {/* マーカーレール（各ステップの番号バッジの中心を貫通する太さ・位置に揃えている） */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 left-7 w-3 rounded-full bg-accent"
          aria-hidden="true"
        />

        <div className="space-y-24 sm:space-y-32 lg:space-y-40">
          {STEPS.map((step) => (
            <ScrollReveal key={step.n}>
              <StepCard step={step} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
