import EventInfo from "@/components/event/EventInfo";
import MenuButton from "@/components/event/MenuBotton";
import UsersInfo from "@/components/event/UsersInfo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
      <section className="flex flex-col sm:flex-row justify-between sm:items-end gap-8 mt-5 mb-8">
        <EventInfo data={data}/> 
        <div className="flex items-center gap-3">
          <MenuButton/>
          <Button size="lg" className="rounded-full px-8 font-bold">
            予定を回答する {/* 回答フォームを開く処理を追記 */}
          </Button>
        </div>
      </section>
      
      <Separator/>
      
      <section className="mt-5 mb-8">
        <UsersInfo data={data}/>
      </section>
    </div>
  );
}
