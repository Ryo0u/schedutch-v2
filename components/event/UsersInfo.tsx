interface UsersInfoProps {
  data: {
    users: {
      name: string
      comment: string
      password_digest: string
    }[]
  };
}

import { User, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

function UsersInfo({ data }: UsersInfoProps) {
  // 参加者がまだいない場合の表示
  if (!data.users || data.users.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/10 rounded-xl border-2 border-dashed">
        <p className="text-muted-foreground text-sm">まだ回答者がいません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-6">
      {data.users.map((user, index) => (
        <Card key={index} className="hover:border-primary/50 transition-colors shadow-sm">
          <CardContent className="p-4 flex gap-4 items-start">
            {/* 👤 ユーザーアイコン */}
            <Avatar className="h-10 w-10 border">
              <AvatarFallback className="bg-primary/5 text-primary">
                {user.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <p className="font-bold text-foreground truncate">{user.name}</p>
              </div>

              {user.comment && (
                <div className="flex gap-1.5 items-start text-muted-foreground mt-2 bg-muted/30 p-2 rounded-lg">
                  <MessageCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <p className="text-xs leading-relaxed italic">{user.comment}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default UsersInfo