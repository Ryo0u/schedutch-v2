import Image from 'next/image';
import type { STEPS } from '../../constants';

interface StepCardProps {
  step: (typeof STEPS)[number];
}

export default function StepCard({ step }: StepCardProps) {
  return (
    <div className="relative flex items-start lg:items-center">
      {/* レール上のステップ番号説明タイトルと縦位置を揃える */}
      <span className="relative z-20 mt-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-accent font-mono text-base font-bold text-accent-foreground shadow-[4px_4px_0_var(--shadow-ink)] dark:border-foreground/25 lg:mt-0">
        {step.n}
      </span>

      <div className="card-pop relative z-10 flex flex-1 flex-col gap-1 px-6 pt-6 pb-0 -ml-7 pl-14 lg:flex-row lg:items-center lg:gap-8 lg:px-8 lg:pt-0 lg:pb-5">
        {/* モック（モバイル: 中程度のサイズで中央寄せ、下端をはみ出す。PC: 下端をカードに揃えつつ上端だけはみ出す＝変更なし） */}
        <div className="order-2 mx-auto -mb-18 w-full shrink-0 sm:-mb-21 sm:w-[86%] lg:mx-0 lg:mb-0 lg:w-[52%] lg:-mt-16">
          <div className="relative aspect-9/16 overflow-hidden rounded-2xl lg:hidden">
            <Image
              src={step.srcMobile}
              alt={step.alt}
              fill
              sizes="60vw"
              className="object-contain"
            />
          </div>
          <div className="relative hidden aspect-16/10 overflow-hidden rounded-2xl lg:block">
            <Image
              src={step.srcDesktop}
              alt={step.alt}
              fill
              sizes="60vw"
              className="object-cover object-top"
            />
          </div>
        </div>

        {/* 説明（モバイル・PCともカードの縦中央に配置） */}
        <div className="order-1 lg:flex-1">
          <h3 className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {step.title}
          </h3>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {step.body}
          </p>
        </div>
      </div>
    </div>
  );
}
