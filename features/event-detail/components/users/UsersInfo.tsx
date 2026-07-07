"use client"

import { Pencil, Trash2, UserCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEvent } from "@/features/event-detail/hooks/useEvent";
import { useUserDialogFlow } from "@/features/event-detail/hooks/useUserDialogFlow";
import UserComment from "./UserComment";
import UsersEditPasswordDialog from "./UsersEditPasswordDialog";
import UsersEditDialog from "./UsersEditDialog";
import UserDeleteDialog from "./UserDeleteDialog";

interface UsersInfoProps {
  eventId: string;
}

function UsersInfo({ eventId }: UsersInfoProps) {
  const { data } = useEvent(eventId);
  const { confirmPassword, editUser, deleteUser, startEdit, startDelete } = useUserDialogFlow();

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
                <div className="p-2 rounded-full bg-muted text-muted-foreground shadow-sm">
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
                  onClick={() => startEdit(user)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startDelete(user)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {confirmPassword.user && (
        <>
          <UsersEditPasswordDialog
            data={{ user: confirmPassword.user }}
            open={confirmPassword.open}
            onOpenChange={confirmPassword.onOpenChange}
            onConfirm={confirmPassword.onConfirm}
          />
          <UsersEditDialog
            eventId={eventId}
            data={{ user: confirmPassword.user, candidates: data.candidates }}
            password={editUser.password}
            open={editUser.open}
            onOpenChange={editUser.onOpenChange}
          />
        </>
      )}

      {deleteUser.user && (
        <UserDeleteDialog
          eventId={eventId}
          data={{ user: deleteUser.user }}
          open={deleteUser.open}
          onOpenChange={deleteUser.onOpenChange}
        />
      )}
    </Card>
  );
}

export default UsersInfo