"use client"

import { useState, useEffect, useCallback } from "react";
import EventInfo from "@/features/event/components/EventInfo";
import JoinButton from "@/features/event/components/JoinButton";
import MenuButton from "@/features/event/components/MenuButton";
import UsersInfo from "@/features/event/components/UsersInfo";
import { Separator } from "@/components/ui/separator";
import EventSkeleton from "@/features/event/components/EventSkeleton";
import { supabase } from "@/utils/supabase/client";
import ResponsesInfo from "./ResponsesInfo";
import ExtractResponses from "./ExtractResponses";
import type { EventData } from "@/features/event/types";

export default function EventClient({ eventId }: { eventId: string }) {
  const [data, setData] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await supabase.from('events').select(`*, candidates (*), users (*, responses (*))`).eq('id', eventId).single();
      setData(data);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => { refresh(); }, [refresh]);

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
          <MenuButton data={data} onSuccess={refresh}/>
          <JoinButton data={data} onSuccess={refresh}/>
        </div>
      </section>
      
      <Separator/>
      
      <section className="mt-5 mb-8">
        <UsersInfo data={data} onSuccess={refresh}/>
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
