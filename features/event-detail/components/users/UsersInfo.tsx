"use client"

import { useState } from "react";
import { MessageCircle, Pencil, Trash2, UserCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeviceType } from "@/hooks/UseDeviceType";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@/features/event-detail/types";
import { useEvent } from "@/features/event-detail/hooks/useEvent";
import UsersEditPasswordDialog from "./UsersEditPasswordDialog";
import UsersEditDialog from "./UsersEditDialog";
import UserDeleteDialog from "./UserDeleteDialog";

interface UsersInfoProps {
  eventId: string;
}


// デバイスによってコメントの表示方法を変更
function UserComment({ comment }: { comment: string }) {
  const device = useDeviceType();
  
  if (!comment) return null;
  
  if (device === "mobile") {
    return (
      <Popover>
        <PopoverTrigger
         render={<Button variant="ghost"><MessageCircle className="h-4 w-4 text-accent-foreground"/></Button>}
        />
        <PopoverContent align="start">
          <PopoverHeader>
            <PopoverTitle>コメント</PopoverTitle>
            <PopoverDescription>{comment}</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    )
  }
  else {
    return (
      <span className="text-accent-foreground text-xs">{comment}</span>
    )
  }
}

function UsersInfo({ eventId }: UsersInfoProps) {
  const { data } = useEvent(eventId);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setPasswordOpen(true);
  };

  // onOpenChange はユーザーがキャンセルした時だけ呼ばれる（成功時は onConfirm 経由で親が閉じる）
  const handlePasswordOpenChange = (open: boolean) => {
    setPasswordOpen(open);
    if (!open) setEditingUser(null);
  };

  // 検証済みの平文パスワードを保持し、編集ダイアログでの再検証に渡す
  const handlePasswordConfirm = (password: string) => {
    setConfirmedPassword(password);
    setPasswordOpen(false);
    setEditOpen(true);
  };

  const handleEditOpenChange = (open: boolean) => {
    setEditOpen(open);
    if (!open) {
      setEditingUser(null);
      setConfirmedPassword("");
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setDeleteOpen(true);
  };

  const handleDeleteOpenChange = (open: boolean) => {
    setDeleteOpen(open);
    if (!open) setDeletingUser(null);
  };

  const getUserColor = (name: string) => {
    const colors = [
      "bg-red-50 text-red-500 hover:bg-red-500",
      "bg-orange-50 text-orange-500 hover:bg-orange-500",
      "bg-amber-50 text-amber-500 hover:bg-amber-500",
      "bg-emerald-50 text-emerald-500 hover:bg-emerald-500",
      "bg-blue-50 text-blue-500 hover:bg-blue-500",
      "bg-indigo-50 text-indigo-500 hover:bg-indigo-500",
      "bg-violet-50 text-violet-500 hover:bg-violet-500",
      "bg-rose-50 text-rose-500 hover:bg-rose-500",
    ];
    
    // 文字列の文字コードの合計からインデックスを計算
    const charCodeSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };
  
  if (!data) return null;

  // 参加者がまだいない場合の表示
  if (!data.users || data.users.length === 0) {
    return (
      <div className="text-center py-10 bg-muted/10 rounded-xl border-2 border-dashed">
        <p className="text-muted-foreground text-sm">まだ回答者がいません</p>
      </div>
    );
  }

  return (
    <Card className="shadow-md shadow-primary/10 ring-primary/20">
      <CardHeader>
        <div className="flex gap-4 items-center">
          <CardTitle className="text-xl font-black tracking-tight text-foreground">
            参加者一覧
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {data.users.length} 人が回答済み
          </CardDescription>
        </div>
      </CardHeader>
  
      <CardContent className="px-0">
        <div className="divide-y divide-border border-y border-border">
          {data.users.map((user) => (
            <div
              key={user.id}
              className="group flex justify-between items-center p-2 transition-all hover:bg-muted/40"
            >
              <div className="flex gap-4 items-center min-w-0">
                <div className={cn(
                  "p-2 rounded-full transition-colors shadow-sm",
                  getUserColor(user.name)
                )}>
                  <UserCircle className="h-5 w-5" />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground tracking-tight">
                    {user.name}
                  </span>
                  <UserComment comment={user.comment} />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick(user)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(user)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {editingUser && (
        <>
          <UsersEditPasswordDialog
            data={{ user: editingUser }}
            open={passwordOpen}
            onOpenChange={handlePasswordOpenChange}
            onConfirm={handlePasswordConfirm}
          />
          <UsersEditDialog
            eventId={eventId}
            data={{ user: editingUser, candidates: data.candidates }}
            password={confirmedPassword}
            open={editOpen}
            onOpenChange={handleEditOpenChange}
          />
        </>
      )}

      {deletingUser && (
        <UserDeleteDialog
          eventId={eventId}
          data={{ user: deletingUser }}
          open={deleteOpen}
          onOpenChange={handleDeleteOpenChange}
        />
      )}
    </Card>
  );
}

export default UsersInfo