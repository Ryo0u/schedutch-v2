import { useEvent } from '@/features/event-detail/hooks/useEvent';
import { formatJSTDate } from '@/lib/datetime';

interface EventInfoProps {
  eventId: string;
}

function formatDateRange(startTimes: string[]): string | null {
  if (startTimes.length === 0) return null;
  const sorted = [...startTimes].sort();
  const fmt = (s: string) =>
    formatJSTDate(s, { month: 'numeric', day: 'numeric', weekday: 'short' });
  const first = fmt(sorted[0]!);
  const last = fmt(sorted[sorted.length - 1]!);
  return first === last ? first : `${first} 〜 ${last}`;
}

function EventInfo({ eventId }: EventInfoProps) {
  const { data } = useEvent(eventId);
  if (!data) return null;

  const dateRange = formatDateRange(data.candidates.map((c) => c.start_time));

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
    </div>
  );
}

export default EventInfo;
