'use client';

import { ChevronDown, Edit, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import EventEditDialog from './EventEditDialog';
import EventDeleteDialog from './EventDeleteDialog';
import UserDeletePickerDialog from '../users/UserDeletePickerDialog';
import EventShareDialog from './EventShareDialog';
import { useEvent } from '@/features/event-detail/hooks/useEvent';

/** 幹事用メニューから開けるダイアログの種別 */
type EventMenuAction = 'eventEdit' | 'eventShare' | 'eventDelete' | 'usersDelete';

interface MenuProps {
  eventId: string;
}

function MenuButton({ eventId }: MenuProps) {
  const { data } = useEvent(eventId);
  // 「今どのダイアログが開いているか」を単一の状態で持つ（null は全て閉じている）
  const [openDialog, setOpenDialog] = useState<EventMenuAction | null>(null);

  if (!data) return null;

  /** ダイアログ側から閉じられたときに選択を解除する */
  const closeDialog = (open: boolean) => {
    if (!open) setOpenDialog(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size="sm" variant="ghost">
              <ChevronDown />
              幹事用メニュー
            </Button>
          }
        />
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Event</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setOpenDialog('eventEdit')}>
              <Edit />
              編集
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenDialog('eventShare')}>
              <Share2 />
              共有
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenDialog('eventDelete')} variant="destructive">
              <Trash2 />
              削除
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel>Users</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setOpenDialog('usersDelete')} variant="destructive">
              <Trash2 />
              削除
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <EventEditDialog
        eventId={eventId}
        data={data}
        open={openDialog === 'eventEdit'}
        onOpenChange={closeDialog}
      />
      <EventShareDialog open={openDialog === 'eventShare'} onOpenChange={closeDialog} />
      <EventDeleteDialog
        data={data}
        open={openDialog === 'eventDelete'}
        onOpenChange={closeDialog}
      />
      <UserDeletePickerDialog
        eventId={eventId}
        data={data}
        open={openDialog === 'usersDelete'}
        onOpenChange={closeDialog}
      />
    </>
  );
}

export default MenuButton;
