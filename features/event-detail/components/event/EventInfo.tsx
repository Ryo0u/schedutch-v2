import { useEvent } from "@/features/event-detail/hooks/useEvent";

interface EventInfoProps {
  eventId: string;
}

function EventInfo({ eventId }: EventInfoProps) {
  const { data } = useEvent(eventId);
  if (!data) return null;

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
    </div>
  );
}

export default EventInfo