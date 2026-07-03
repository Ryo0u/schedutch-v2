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
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-sm transition-transform duration-300 sm:hidden ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="px-4 pt-3">
        <Link
          href="/new"
          className="block w-full rounded-xl border-2 border-foreground bg-primary py-3.5 text-center text-base font-bold text-primary-foreground shadow-[3px_3px_0_var(--shadow-ink-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-foreground/25"
        >
          無料でイベントを作成
        </Link>
      </div>
    </div>
  );
}
