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
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="flex gap-0.5" aria-hidden="true">
            <span className="h-3 w-3 rounded-[3px] bg-blue-400" />
            <span className="h-3 w-3 rounded-[3px] bg-amber-400" />
            <span className="h-3 w-3 rounded-[3px] bg-muted-foreground/40" />
          </span>
          <span className="text-sm font-bold tracking-tight text-foreground">Schedutch</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isLP && (
            <div className="hidden items-center gap-5 sm:flex">
              <a
                href="#how"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                使い方
              </a>
              <a
                href="#extract"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
            className="rounded-lg border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[2px_2px_0_var(--shadow-ink-primary)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--shadow-ink-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-foreground/25"
          >
            イベントを作成
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
