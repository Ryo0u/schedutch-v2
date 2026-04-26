"use client"

import { useState, useEffect, useCallback } from "react";
import EventInfo from "@/components/event/EventInfo";
import JoinButton from "@/components/event/JoinButton";
import MenuButton from "@/components/event/MenuBotton";
import UsersInfo from "@/components/event/UsersInfo";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/utils/supabase/client";
import ResponsesInfo from "./ResponsesInfo";

export default function EventClient({ eventId }: { eventId: string }) {
  const [data, setData] = useState<any>(null);
  const refresh = useCallback(async () => {
    const { data } = await supabase.from('events').select(`*, candidates (*), users (*, responses (*))`).eq('id', eventId).single();
    setData(data);
  }, [eventId]);

  useEffect(() => { refresh(); }, [refresh]);
  
  if (!data) {
    return <div>イベント情報を読み込めませんでした。</div>;
  }
  console.log(data)
  
  return (
    <div className="w-full max-w-6xl mx-auto px-3">
      <section className="flex flex-col sm:flex-row justify-between sm:items-end gap-8 mt-5 mb-8">
        <EventInfo data={data}/> 
        <div className="flex items-center gap-3">
          <MenuButton/>
          <JoinButton data={data} onSuccess={refresh}/>
        </div>
      </section>
      
      <Separator/>
      
      <section className="mt-5 mb-8">
        <UsersInfo data={data}/>
      </section>
      
      <section className="mb-8">
        <ResponsesInfo data={data}/>
      </section>
    </div>
  );
}
