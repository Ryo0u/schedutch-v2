"use client"

import EventInfo from "@/features/event-detail/components/event/EventInfo";
import JoinButton from "@/features/event-detail/components/responses/JoinButton";
import MenuButton from "@/features/event-detail/components/event/MenuButton";
import UsersInfo from "@/features/event-detail/components/users/UsersInfo";
import { Separator } from "@/components/ui/separator";
import EventSkeleton from "@/features/event-detail/components/EventSkeleton";
import { useEvent } from "@/features/event-detail/hooks/useEvent";
import ResponsesInfo from "./responses/ResponsesInfo";
import ExtractResponses from "./extract/ExtractResponses";
import EventSideNav from "./EventSideNav";

export default function EventContainer({ eventId }: { eventId: string }) {
  const { data, isLoading } = useEvent(eventId);

  if (isLoading) {
    return <EventSkeleton />;
  }

  if (!data) {
    return <div className="flex justify-center items-center min-h-64 text-muted-foreground">イベント情報を読み込めませんでした。</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3">
      <aside className="hidden 2xl:block">
        <EventSideNav eventId={eventId} />
      </aside>

      <section id="event-info" className="flex flex-col sm:flex-row justify-between sm:items-end gap-8 mt-5 mb-8 scroll-mt-20">
        <EventInfo eventId={eventId}/>
        <div className="flex items-center gap-3">
          <MenuButton eventId={eventId}/>
          <JoinButton eventId={eventId}/>
        </div>
      </section>

      <Separator/>

      <section id="users-info" className="mt-5 mb-8 scroll-mt-20">
        <UsersInfo eventId={eventId}/>
      </section>

      <section id="responses-info" className="mb-8 scroll-mt-20">
        <ResponsesInfo eventId={eventId}/>
      </section>

      <section id="extract-responses" className="mb-8 scroll-mt-20">
        <ExtractResponses eventId={eventId}/>
      </section>
    </div>
  );
}
