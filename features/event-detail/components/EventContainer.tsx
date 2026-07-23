"use client"

import { notFound } from "next/navigation";
import EventInfo from "@/features/event-detail/components/event/EventInfo";
import JoinButton from "@/features/event-detail/components/responses/JoinButton";
import MenuButton from "@/features/event-detail/components/event/MenuButton";
import UsersInfo from "@/features/event-detail/components/users/UsersInfo";
import { Separator } from "@/components/ui/separator";
import EventSkeleton from "@/features/event-detail/components/EventSkeleton";
import { useEvent } from "@/features/event-detail/hooks/useEvent";
import { isEventNotFoundError } from "@/features/event-detail/api/errors";
import ResponsesInfo from "./responses/ResponsesInfo";
import ExtractPanel from "./extract/ExtractPanel";
import { ExtractSlotsProvider } from "./extract/ExtractSlotsContext";
import EventSideNav from "./sidebar/EventSideNav";
import { SECTION_IDS } from "@/features/event-detail/lib/anchors";

export default function EventContainer({ eventId }: { eventId: string }) {
  const { data, isLoading, isError, error } = useEvent(eventId);

  if (isLoading) {
    return <EventSkeleton />;
  }

  if (isError) {
    if (isEventNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  if (!data) {
    notFound();
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3">
      <aside className="hidden 2xl:block">
        <EventSideNav eventId={eventId} />
      </aside>

      <section id={SECTION_IDS.eventInfo} className="flex flex-col sm:flex-row justify-between sm:items-end gap-8 mt-5 mb-8 scroll-mt-20">
        <EventInfo eventId={eventId}/>
        <div className="flex items-center gap-3">
          <MenuButton eventId={eventId}/>
          <JoinButton eventId={eventId}/>
        </div>
      </section>

      <Separator/>

      <section id={SECTION_IDS.usersInfo} className="mt-5 mb-8 scroll-mt-20">
        <UsersInfo eventId={eventId}/>
      </section>

      <ExtractSlotsProvider eventId={eventId}>
        <section id={SECTION_IDS.responsesInfo} className="mb-8 scroll-mt-20">
          <ResponsesInfo eventId={eventId}/>
        </section>

        <section id={SECTION_IDS.extractResponses} className="mb-8 scroll-mt-20">
          <ExtractPanel eventId={eventId}/>
        </section>
      </ExtractSlotsProvider>
    </div>
  );
}
