import EventInfo from "@/components/event/EventInfo";
import JoinButton from "@/components/event/JoinButton";
import MenuButton from "@/components/event/MenuBotton";
import UsersInfo from "@/components/event/UsersInfo";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/utils/supabase/client";

const EventFetch = async (id: string) => {
  try {
    const { data, error } = await supabase.from('events').select(`*, candidates (*), users (*)`).eq('id', id).single()
    
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
      <section className="flex flex-col sm:flex-row justify-between sm:items-end gap-8 mt-5 mb-8">
        <EventInfo data={data}/> 
        <div className="flex items-center gap-3">
          <MenuButton/>
          <JoinButton data={data}/>
        </div>
      </section>
      
      <Separator/>
      
      <section className="mt-5 mb-8">
        <UsersInfo data={data}/>
      </section>
    </div>
  );
}
