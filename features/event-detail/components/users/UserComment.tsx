"use client"

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { useDeviceType } from "@/hooks/useDeviceType";

interface UserCommentProps {
  comment: string;
}

// デバイスによってコメントの表示方法を変更
function UserComment({ comment }: UserCommentProps) {
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

  return (
    <span className="text-accent-foreground text-xs">{comment}</span>
  )
}

export default UserComment;
