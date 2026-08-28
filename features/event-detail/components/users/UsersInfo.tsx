'use client';

import { Pencil, Trash2, UserCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEvent } from '@/features/event-detail/hooks/useEvent';
import { useUserDialogFlow } from '@/features/event-detail/hooks/useUserDialogFlow';
import UserComment from './UserComment';
import UserEditPasswordDialog from './UserEditPasswordDialog';
import UserEditDialog from './UserEditDialog';
import UserDeleteDialog from './UserDeleteDialog';

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
      <div className="bg-muted/10 rounded-xl border-2 border-dashed py-10 text-center">
        <p className="text-muted-foreground text-sm">まだ回答者がいません</p>
      </div>
    );
  }

  return (
    <Card className="shadow-primary/10 ring-primary/20 shadow-md">
      <CardHeader>
        <div className="flex items-center gap-4">
          <CardTitle className="text-foreground text-xl font-black tracking-tight">
            参加者一覧
          </CardTitle>
          <CardDescription className="text-muted-foreground bg-muted rounded-full px-2 py-1 text-xs">
            {data.users.length} 人が回答済み
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <div className="divide-border border-border divide-y border-y">
          {data.users.map((user) => (
            <div
              key={user.id}
              className="group hover:bg-muted/40 flex items-center justify-between p-2 transition-all"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="bg-muted text-muted-foreground shrink-0 rounded-full p-2 shadow-sm">
                  <UserCircle className="h-5 w-5" />
                </div>

                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-foreground shrink-0 text-sm font-bold tracking-tight">
                    {user.name}
                  </span>
                  <UserComment comment={user.comment} />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`${user.name}を編集`}
                  onClick={() => startEdit(user)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`${user.name}を削除`}
                  onClick={() => startDelete(user)}
                >
                  <Trash2 className="text-destructive h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {confirmPassword.user && (
        <>
          <UserEditPasswordDialog
            data={{ user: confirmPassword.user }}
            open={confirmPassword.open}
            onOpenChange={confirmPassword.onOpenChange}
            onConfirm={confirmPassword.onConfirm}
          />
          <UserEditDialog
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

export default UsersInfo;
