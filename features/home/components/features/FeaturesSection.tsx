import { FEATURES } from '../../constants';

export default function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
      <h2 className="font-heading text-foreground text-2xl font-black tracking-tight sm:text-3xl">
        気軽に使えて、<span className="marker">ちゃんと守れる</span>
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="card-pop card-pop-interactive p-6">
            <span className={`inline-block h-2.5 w-2.5 rounded-sm ${f.chip}`} aria-hidden="true" />
            <h3 className="text-foreground mt-3 text-lg font-bold">{f.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
