import Image from 'next/image';
import type { STEPS } from '../../constants';

interface StepCardProps {
  step: (typeof STEPS)[number];
}

export default function StepCard({ step }: StepCardProps) {
  return (
    <div className="relative flex items-start lg:items-center">
      {/* レール上のステップ番号説明タイトルと縦位置を揃える */}
      <span className="border-foreground bg-accent text-accent-foreground dark:border-foreground/25 relative z-20 mt-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 font-mono text-base font-bold shadow-[4px_4px_0_var(--shadow-ink)] lg:mt-0">
        {step.n}
      </span>

      <div className="card-pop relative z-10 -ml-7 flex flex-1 flex-col gap-1 px-6 pt-6 pb-0 pl-14 lg:flex-row lg:items-center lg:gap-8 lg:px-8 lg:pt-0 lg:pb-5">
        {/* モック（モバイル: 中程度のサイズで中央寄せ、下端をはみ出す。PC: 下端をカードに揃えつつ上端だけはみ出す＝変更なし） */}
        <div className="order-2 mx-auto -mb-18 w-full shrink-0 sm:-mb-21 sm:w-[86%] lg:mx-0 lg:-mt-16 lg:mb-0 lg:w-[52%]">
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
          <h3 className="font-heading text-foreground text-2xl font-black tracking-tight sm:text-3xl">
            {step.title}
          </h3>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
            {step.body}
          </p>
        </div>
      </div>
    </div>
  );
}
