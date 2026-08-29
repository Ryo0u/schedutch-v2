import Link from 'next/link';
import { SearchX, Home, Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function EventNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-3 text-center">
      <div className="bg-muted flex size-14 items-center justify-center rounded-full">
        <SearchX className="text-muted-foreground size-7" />
      </div>
      <div className="space-y-1">
        <p className="text-foreground text-lg font-medium">イベントが見つかりませんでした</p>
        <p className="text-muted-foreground text-sm">
          URL が間違っているか、イベントがすでに削除された可能性があります。
          <br />
          URL を再確認するか、新しいイベントを作成してください。
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-2 sm:flex-row">
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }), 'sm:flex-1')}>
          <Home />
          トップへ戻る
        </Link>
        <Link href="/new" className={cn(buttonVariants(), 'sm:flex-1')}>
          <Plus />
          イベントを作成する
        </Link>
      </div>
    </div>
  );
}
