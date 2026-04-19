import EventEdit from "@/components/event/EventEdit";
import EventInfo from "@/components/event/EventInfo";
import { supabase } from "@/utils/supabase/client";

const EventFetch = async (id: string) => {
    try {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single()
      
      if (error) throw error
      
      return data;
    } catch (error) {
      console.log("イベントの取得に失敗しました", error)
      return null;
    }
  }

export default async function Event({ params }: { params: Promise<{ id: string }> }) {
  const eventId = (await params).id
  const data = await EventFetch(eventId);
  
  if (!data) {
    return <div>イベント情報を読み込めませんでした。</div>;
  }
  
  return (
    <div className="w-full max-w-6xl mx-auto px-3">
      <div className="flex flex-col sm:flex-row justify-center sm:items-end gap-8 mt-5 mb-8">
        <section className="flex-3">
          <EventInfo data={data}/> 
        </section>
        <section className="flex-1">
          <EventEdit/>
        </section>
      </div>
    </div>
  );
}
