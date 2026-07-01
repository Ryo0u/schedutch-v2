import { Badge } from '@/components/ui/badge';

export default function NewHero() {
  return (
    <div className="p-4 mb-3 space-y-4">
      <div className="flex items-center gap-3">
        <img src="/logo.png" className="h-10 w-10" />
        <h1 className="text-xl font-extrabold tracking-tight text-primary">
          SCHEDUTCH
        </h1>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold text-foreground">
          日程調整を、もっとシンプルに。
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          schedutch（スケダッチ）は、面倒な予定調整をスムーズにするツールです。
          候補日を選んで URL を送るだけ。ログイン不要で、誰でもすぐに回答できます。
        </p>
      </div>

      <div className='flex flex-wrap gap-2 '>
        <Badge className='py-3'>
          ログイン不要
        </Badge>
        <Badge className='py-3'>
            全機能が無料
        </Badge>
      </div>
    </div>
  );
}
