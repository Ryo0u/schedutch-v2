import Image from 'next/image';

interface BrowserFrameProps {
  src?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  filename?: string;
  url?: string;
}

export default function BrowserFrame({
  src,
  alt,
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority,
  className,
  filename,
  url = 'schedutch.app/event/...',
}: BrowserFrameProps) {
  return (
    <div className={`card-pop overflow-hidden ${className ?? ''}`}>
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-border bg-muted px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden rounded-md bg-background px-3 py-1 text-center font-mono text-xs text-muted-foreground">
          {url}
        </div>
      </div>

      {/* Screenshot or placeholder */}
      <div className="relative" style={{ aspectRatio: '16/10' }}>
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
            <div
              className="absolute inset-0"
              aria-hidden="true"
              style={{
                backgroundImage:
                  'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <span className="relative rounded bg-background/80 px-3 py-1.5 font-mono text-sm text-muted-foreground">
              {filename ?? alt}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
