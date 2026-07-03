import LegacyToolCard from './LegacyToolCard';
import PreviewCard from './PreviewCard';

export default function ComparisonSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          日単位じゃなく、時間帯で決める。
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          既存ツールは「○か△か✕か」を日単位で集めて終わり。Schedutchは30分単位の時間帯を候補にできるので、「その日の何時なら空いてる？」まで一度に決まります。
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <LegacyToolCard />
          <PreviewCard />
        </div>
      </div>
    </section>
  );
}
