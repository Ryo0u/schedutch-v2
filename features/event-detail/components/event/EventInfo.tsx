import { useEvent } from '@/features/event-detail/hooks/useEvent';
import { getEventDeletionInfo } from '@/features/event-detail/lib/deletion';
import { formatJSTDate } from '@/lib/datetime';

interface EventInfoProps {
  eventId: string;
}

// 残りがこの日数以下なら日付を出さず「まもなく」とだけ表示する
// （cron 未実行で期限を過ぎている場合も含む）
const DELETION_SOON_THRESHOLD_DAYS = 3;

function formatDateRange(startTimes: string[]): string | null {
  if (startTimes.length === 0) return null;
  const sorted = [...startTimes].sort();
  const fmt = (s: string) =>
    formatJSTDate(s, { month: 'numeric', day: 'numeric', weekday: 'short' });
  const first = fmt(sorted[0]!);
  const last = fmt(sorted[sorted.length - 1]!);
  return first === last ? first : `${first} 〜 ${last}`;
}

function formatDeletionNotice(deletionDate: Date, daysLeft: number): string {
  if (daysLeft <= DELETION_SOON_THRESHOLD_DAYS) {
    return 'まもなく自動的に削除されます';
  }
  const date = formatJSTDate(deletionDate, { month: 'numeric', day: 'numeric' });
  return `${date}ごろ（あと${daysLeft}日）に自動的に削除されます`;
}

function EventInfo({ eventId }: EventInfoProps) {
  const { data } = useEvent(eventId);
  if (!data) return null;

  const dateRange = formatDateRange(data.candidates.map((c) => c.start_time));
  const deletionInfo = getEventDeletionInfo({
    createdAt: data.created_at,
    userUpdatedAts: data.users.map((u) => u.updated_at),
  });

  return (
    <div className="mt-5 flex flex-col gap-2">
      <h1 className="text-foreground border-primary border-l-[3px] pl-4 text-4xl leading-tight font-black tracking-tight">
        {data.title}
      </h1>
      {data.comment && (
        <p className="text-muted-foreground pl-4 text-sm leading-relaxed">{data.comment}</p>
      )}
      <p className="text-muted-foreground/70 mt-1 flex items-center gap-2 pl-4 text-xs">
        {dateRange && <span>{dateRange}</span>}
        {dateRange && <span aria-hidden>·</span>}
        <span>候補日 {data.candidates.length}件</span>
        <span aria-hidden>·</span>
        <span>回答済み {data.users.length}人</span>
      </p>
      {deletionInfo && (
        <p className="text-muted-foreground/60 pl-4 text-xs">
          {formatDeletionNotice(deletionInfo.deletionDate, deletionInfo.daysLeft)}
        </p>
      )}
    </div>
  );
}

export default EventInfo;
