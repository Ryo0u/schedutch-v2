import { CalendarClock } from 'lucide-react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

function EmptyList() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarClock />
        </EmptyMedia>
        <EmptyTitle>候補日一覧</EmptyTitle>
        <EmptyDescription>候補日がまだ追加されていません</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export default EmptyList;
