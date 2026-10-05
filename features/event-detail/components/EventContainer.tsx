'use client';

import { notFound } from 'next/navigation';
import EventInfo from '@/features/event-detail/components/event/EventInfo';
import JoinButton from '@/features/event-detail/components/responses/JoinButton';
import MenuButton from '@/features/event-detail/components/event/MenuButton';
import UsersInfo from '@/features/event-detail/components/users/UsersInfo';
import { Separator } from '@/components/ui/separator';
import EventSkeleton from '@/features/event-detail/components/EventSkeleton';
import { useEvent } from '@/features/event-detail/hooks/useEvent';
import { isNotFoundError } from '@/lib/rpcErrors';
import ResponsesInfo from './responses/ResponsesInfo';
import ExtractPanel from './extract/ExtractPanel';
import PlanSection from './plan/PlanSection';
import { ExtractSlotsProvider } from './extract/ExtractSlotsContext';
import EventSideNav from './sidebar/EventSideNav';
import { SECTION_IDS } from '@/features/event-detail/lib/anchors';

export default function EventContainer({ eventId }: { eventId: string }) {
  const { data, isLoading, isError, error } = useEvent(eventId);

  if (isLoading) {
    return <EventSkeleton />;
  }

  if (isError) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  if (!data) {
    notFound();
  }

  return (
    <div className="flex w-full gap-10 px-3">
      <aside className="hidden w-64 shrink-0 lg:block">
        <EventSideNav eventId={eventId} />
      </aside>

      <div className="max-w-6xl min-w-0 flex-1">
        <section
          id={SECTION_IDS.eventInfo}
          className="mt-5 mb-8 flex scroll-mt-20 flex-col justify-between gap-8 sm:flex-row sm:items-end"
        >
          <EventInfo eventId={eventId} />
          <div className="flex items-center gap-3">
            <MenuButton eventId={eventId} />
            <JoinButton eventId={eventId} />
          </div>
        </section>

        <Separator />

        <section id={SECTION_IDS.usersInfo} className="mt-5 mb-8 scroll-mt-20">
          <UsersInfo eventId={eventId} />
        </section>

        <ExtractSlotsProvider eventId={eventId}>
          <section id={SECTION_IDS.responsesInfo} className="mb-8 scroll-mt-20">
            <ResponsesInfo eventId={eventId} />
          </section>

          <section id={SECTION_IDS.extractResponses} className="mb-8 scroll-mt-20">
            <ExtractPanel eventId={eventId} />
          </section>

          {/* ExtractBlockList が抽出結果を読むため、Provider の内側に置く */}
          <section id={SECTION_IDS.plansInfo} className="mb-8 scroll-mt-20">
            <PlanSection eventId={eventId} />
          </section>
        </ExtractSlotsProvider>
      </div>
    </div>
  );
}
