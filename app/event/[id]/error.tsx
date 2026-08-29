'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCw } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function EventError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-3 text-center">
      <div className="bg-destructive/10 flex size-14 items-center justify-center rounded-full">
        <AlertTriangle className="text-destructive size-7" />
      </div>
      <div className="space-y-1">
        <p className="text-foreground text-lg font-medium">読み込みに失敗しました</p>
        <p className="text-muted-foreground text-sm">
          通信状況が不安定な可能性があります。
          <br />
          時間をおいて再度お試しください。
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-2 sm:flex-row">
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }), 'sm:flex-1')}>
          <Home />
          トップへ戻る
        </Link>
        <Button onClick={reset} className="sm:flex-1">
          <RotateCw />
          再試行
        </Button>
      </div>
    </div>
  );
}
