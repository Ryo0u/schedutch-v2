'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const isLP = pathname === '/';

  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="focus-visible:ring-ring flex items-center gap-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <span className="flex gap-0.5" aria-hidden="true">
            <span className="h-3 w-3 rounded-[3px] bg-blue-400" />
            <span className="h-3 w-3 rounded-[3px] bg-amber-400" />
            <span className="bg-muted-foreground/40 h-3 w-3 rounded-[3px]" />
          </span>
          <span className="text-foreground text-sm font-bold tracking-tight">Schedutch</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isLP && (
            <div className="hidden items-center gap-5 sm:flex">
              <a
                href="#how"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                使い方
              </a>
              <a
                href="#extract"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                予定抽出
              </a>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">テーマ切り替え</span>
          </Button>

          <Link
            href="/new"
            className="border-foreground bg-primary text-primary-foreground focus-visible:ring-ring dark:border-foreground/25 rounded-lg border-2 px-4 py-2 text-sm font-bold shadow-[2px_2px_0_var(--shadow-ink-primary)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--shadow-ink-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            イベントを作成
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
