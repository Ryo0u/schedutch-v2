"use client"

import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function JoinButton({ eventId }: { eventId: string }) {
  const router = useRouter();

  const handleAddUser = async () => {
    // 実際にはここで Drawer や Dialog を開いて、回答と情報を入力
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          name: "のむら", 
          comment: "楽しみにしてます！", 
          password_digest: "test1234", 
          event_id: eventId 
        },
      ]);

    if (error) {
      alert("エラーが発生しました: " + error.message);
    } else {
      router.refresh();
    }
  };

  return (
    <Button 
      size="lg" 
      className="rounded-full px-8 font-bold" 
      onClick={handleAddUser}
    >
      予定を回答する
    </Button>
  );
}