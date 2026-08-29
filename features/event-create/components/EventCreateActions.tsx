import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Eraser, Plus } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface EventCreateActionsProps {
  isSubmitting: boolean;
  onReset: () => void;
}

function EventCreateActions({ isSubmitting, onReset }: EventCreateActionsProps) {
  return (
    <div>
      <Separator className="my-8" />

      <div className="bg-card border-primary/20 shadow-primary/10 flex flex-col items-center justify-between gap-3 rounded-xl border p-4 shadow-md sm:flex-row">
        <p className="text-muted-foreground ml-2 text-sm">入力内容を確認して送信してください</p>
        <div className="flex gap-3">
          <Button
            className="hover:bg-destructive/10 hover:text-destructive"
            variant="ghost"
            type="button"
            onClick={onReset}
          >
            <Eraser />
            リセット
          </Button>
          <Button className="px-12 font-bold" size="lg" type="submit">
            {isSubmitting ? (
              <>
                <Spinner />
                作成中...
              </>
            ) : (
              <>
                <Plus />
                作成する
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EventCreateActions;
