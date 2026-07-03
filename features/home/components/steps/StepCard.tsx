import BrowserFrame from './BrowserFrame';
import type { STEPS } from '../../constants';

interface StepCardProps {
  step: (typeof STEPS)[number];
  reversed: boolean;
}

export default function StepCard({ step, reversed }: StepCardProps) {
  return (
    <div
      className={`mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-10 ${
        reversed ? 'lg:flex-row-reverse' : ''
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
  );
}
