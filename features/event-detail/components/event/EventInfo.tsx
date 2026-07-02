import { useEvent } from "@/features/event-detail/hooks/useEvent";
import { formatJSTDate } from "@/lib/utils";

interface EventInfoProps {
  eventId: string;
}

function formatDateRange(startTimes: string[]): string | null {
  if (startTimes.length === 0) return null;
  const sorted = [...startTimes].sort();
  const fmt = (s: string) =>
    formatJSTDate(s, { month: "numeric", day: "numeric", weekday: "short" });
  const first = fmt(sorted[0]!);
  const last = fmt(sorted[sorted.length - 1]!);
  return first === last ? first : `${first} 〜 ${last}`;
}

function EventInfo({ eventId }: EventInfoProps) {
  const { data } = useEvent(eventId);
  if (!data) return null;

  const dateRange = formatDateRange(data.candidates.map((c) => c.start_time));

  return (
    <div className="flex flex-col gap-2 mt-5">
      <h1 className="text-4xl font-black tracking-tight text-foreground leading-tight border-l-[3px] border-primary pl-4">
        {data.title}
      </h1>
      {data.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed pl-4">
          {data.comment}
        </p>
      )}
      <p className="text-xs text-muted-foreground/70 pl-4 mt-1 flex items-center gap-2">
        {dateRange && <span>{dateRange}</span>}
        {dateRange && <span aria-hidden>·</span>}
        <span>候補日 {data.candidates.length}件</span>
        <span aria-hidden>·</span>
        <span>回答済み {data.users.length}人</span>
      </p>
    </div>
  );
}

export default EventInfo