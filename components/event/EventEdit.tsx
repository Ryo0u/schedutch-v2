"use client"

import { ChevronDown, Edit, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useState } from "react"
import EventAuthPass from "./EventAuthPass"


function EventEdit() {
  const [ isOpen, setIsOpen ] = useState(false); // パスワード承認画面
  const [ actionType, setActionType ] = useState<"eventEdit" | "eventDelete" | "usersDelete" | null>(null)
  
  const handleMenuClick = (action: "eventEdit" | "eventDelete" | "usersDelete") => {
    setActionType(action);
    setIsOpen(true);
  }
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button size="lg"><ChevronDown/>幹事用メニュー</Button>}
        />
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Event</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleMenuClick("eventEdit")}>
              <Edit/>編集
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
    
      <EventAuthPass
        open={isOpen}
        onOpenChange={setIsOpen}
        action={actionType}
      />
    
    </>
  )
}

export default EventEdit