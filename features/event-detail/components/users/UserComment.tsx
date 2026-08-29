'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDeviceType } from '@/hooks/useDeviceType';

interface UserCommentProps {
  comment: string;
}

// デバイスによってコメントの表示方法を変更
function UserComment({ comment }: UserCommentProps) {
  const device = useDeviceType();

  if (!comment) return null;

  // モバイルは一覧の幅が足りないためアイコンのみ。PCは1行に収まる分を表示し、
  // 溢れた分は同じPopoverで読ませる（コメントが長くても行が伸びず、操作ボタンを押し出さない）
  const trigger =
    device === 'mobile' ? (
      <Button variant="ghost">
        <MessageCircle className="text-accent-foreground h-4 w-4" />
      </Button>
    ) : (
      <button
        type="button"
        className="text-accent-foreground min-w-0 truncate text-left text-xs"
        aria-label="コメントを全文表示"
      >
        {comment}
      </button>
    );

  return (
    <Popover>
      <PopoverTrigger render={trigger} />
      <PopoverContent align="start">
        <PopoverHeader>
          <PopoverTitle>コメント</PopoverTitle>
          <PopoverDescription>{comment}</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}

export default UserComment;
