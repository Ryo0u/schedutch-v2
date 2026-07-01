import { Badge } from '@/components/ui/badge';
import { CircleCheck } from 'lucide-react';

export default function NewHero() {
  return (
    <div className="relative mb-3 p-4 space-y-4">

      {/* Logo + Brand name */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div
            className="absolute inset-0 rounded-xl bg-primary/30 blur-md"
            aria-hidden="true"
          />
          <img src="/logo.png" className="relative h-10 w-10 rounded-xl" />
        </div>
        <h1 className="bg-linear-to-r from-primary via-violet-500 to-primary bg-clip-text text-xl font-black tracking-[0.12em] text-transparent">
          SCHEDUTCH
        </h1>
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <p className="text-lg font-bold text-foreground">
          日程調整を、もっとシンプルに。
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          SCHEDUTCHは、面倒な予定調整をスムーズにするツールです。
          候補日を選んで URL を送るだけ。ログイン不要で、誰でもすぐに回答できます。
        </p>
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className="gap-1.5 py-3 border-primary/30 bg-primary/6 text-primary"
        >
          <CircleCheck />
          ログイン不要
        </Badge>
        <Badge
          variant="outline"
          className="gap-1.5 py-3 border-primary/30 bg-primary/6 text-primary"
        >
          <CircleCheck />
          全機能が無料
        </Badge>
      </div>
    </div>
  );
}
