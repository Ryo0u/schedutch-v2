"use client"

import { ChevronDown, Edit, Share2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import EventEditDialog from "./EventEditDialog"
import EventDeleteDialog from "./EventDeleteDialog"
import SelectUserDeleteDialog from "../users/SelectUserDeleteDialog"
import EventShareDialog from "./EventShareDialog"
import { useEvent } from "@/features/event-detail/hooks/useEvent";

interface MenuProps {
  eventId: string;
}

function MenuButton({ eventId }: MenuProps) {
  const { data } = useEvent(eventId);
  const [ isOpen, setIsOpen ] = useState(false); // パスワード承認画面
  const [ actionType, setActionType ] = useState<"eventEdit" | "eventShare" | "eventDelete" | "usersDelete" | null>(null)

  if (!data) return null;

  const handleMenuClick = (action: "eventEdit" | "eventShare" | "eventDelete" | "usersDelete") => {
    setActionType(action);
    setIsOpen(true);
  }
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button size="sm" variant="ghost"><ChevronDown/>幹事用メニュー</Button>}
        />
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Event</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleMenuClick("eventEdit")}>
              <Edit/>編集
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMenuClick("eventShare")}>
              <Share2/>共有
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMenuClick("eventDelete")} variant="destructive">
              <Trash2/>削除
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator/>
          
          <DropdownMenuGroup>
            <DropdownMenuLabel>Users</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleMenuClick("usersDelete")} variant="destructive">
              <Trash2/>削除
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    
      {actionType === "eventEdit" && (
        <EventEditDialog eventId={eventId} data={data} open={isOpen} onOpenChange={setIsOpen} />
      )}
      {actionType === "eventShare" && (
        <EventShareDialog open={isOpen} onOpenChange={setIsOpen}/>
      )}
      {actionType === "eventDelete" && (
        <EventDeleteDialog data={data} open={isOpen} onOpenChange={setIsOpen} />
      )}
      {actionType === "usersDelete" && (
        <SelectUserDeleteDialog eventId={eventId} data={data} open={isOpen} onOpenChange={setIsOpen} />
      )}
    
    </>
  )
}

export default MenuButton