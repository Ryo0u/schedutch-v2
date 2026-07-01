"use client"

import EventInfo from "@/features/event/components/EventInfo";
import JoinButton from "@/features/event/components/JoinButton";
import MenuButton from "@/features/event/components/MenuButton";
import UsersInfo from "@/features/event/components/UsersInfo";
import { Separator } from "@/components/ui/separator";
import EventSkeleton from "@/features/event/components/EventSkeleton";
import { useEvent } from "@/features/event/hooks/useEvent";
import ResponsesInfo from "./ResponsesInfo";
import ExtractResponses from "./ExtractResponses";

export default function EventClient({ eventId }: { eventId: string }) {
  const { data, isLoading } = useEvent(eventId);

  if (isLoading) {
    return <EventSkeleton />;
  }

  if (!data) {
    return <div className="flex justify-center items-center min-h-64 text-muted-foreground">イベント情報を読み込めませんでした。</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3">
      <section className="flex flex-col sm:flex-row justify-between sm:items-end gap-8 mt-5 mb-8">
        <EventInfo data={data}/>
        <div className="flex items-center gap-3">
          <MenuButton data={data}/>
          <JoinButton data={data}/>
        </div>
      </section>

      <Separator/>

      <section className="mt-5 mb-8">
        <UsersInfo data={data}/>
      </section>
      
      <section className="mb-8">
        <ResponsesInfo data={data}/>
      </section>
      
      <section className="mb-8">
        <ExtractResponses data={data}/>
      </section>
    </div>
  );
}
