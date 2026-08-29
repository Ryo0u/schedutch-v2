'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MobileCtaBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`border-border bg-background/90 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-sm transition-transform duration-300 sm:hidden ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="px-4 pt-3">
        <Link
          href="/new"
          className="border-foreground bg-primary text-primary-foreground focus-visible:ring-ring dark:border-foreground/25 block w-full rounded-xl border-2 py-3.5 text-center text-base font-bold shadow-[3px_3px_0_var(--shadow-ink-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          無料でイベントを作成
        </Link>
      </div>
    </div>
  );
}
