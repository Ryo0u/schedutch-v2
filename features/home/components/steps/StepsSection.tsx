import ScrollReveal from '../ScrollReveal';
import StepCard from './StepCard';
import { STEPS } from '../../constants';

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
        {STEPS.map((step, i) => (
          <ScrollReveal key={step.n}>
            <StepCard step={step} reversed={i % 2 === 1} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
