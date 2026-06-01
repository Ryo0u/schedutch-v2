"use client"

import { ChevronDown, Edit, Share2, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useState } from "react"
import EventEditDialog from "./EventEditDialog"
import EventDeleteDialog from "./EventDeleteDialog"
import UsersDeleteDialog from "./UsersDeleteDialog"
import EventShareDialog from "./EventShareDialog"
import type { EventData } from "@/lib/types";

interface MenuProps {
  data: EventData;
  onSuccess: () => void;
}

function MenuButton({ data, onSuccess }: MenuProps) {
  const [ isOpen, setIsOpen ] = useState(false); // パスワード承認画面
  const [ actionType, setActionType ] = useState<"eventEdit" | "eventShare" | "eventDelete" | "usersDelete" | null>(null)
  
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
        <EventEditDialog open={isOpen} onOpenChange={setIsOpen} />
      )}
      {actionType === "eventShare" && (
        <EventShareDialog open={isOpen} onOpenChange={setIsOpen}/>
      )}
      {actionType === "eventDelete" && (
        <EventDeleteDialog data={data} open={isOpen} onOpenChange={setIsOpen} />
      )}
      {actionType === "usersDelete" && (
        <UsersDeleteDialog data={data} open={isOpen} onOpenChange={setIsOpen} onSuccess={onSuccess} />
      )}
    
    </>
  )
}

export default MenuButton