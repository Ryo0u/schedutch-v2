import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Eraser, Plus } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '@/features/event-create/schema';
import { toast } from "sonner"
import { useState } from 'react';
import CreatedDialog from './CreatedDialog';
import { Spinner } from '@/components/ui/spinner';
import { jstWallTimeToISO } from '@/lib/utils';
import { hashPassword } from '@/lib/password';
import { useCreateEvent } from '@/features/event-create/hooks/useCreateEvent';

interface CreateEventActionProps {
  form: UseFormReturn<FormData>;
}

function CreateEvent({ form }: CreateEventActionProps) {
  const { isSubmitting } = form.formState;
  const [showDialog, setShowDialog] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const createEvent = useCreateEvent();
	
  const onSubmit = async (values: FormData) => {
      try {
        const hashedPassword = await hashPassword(values.password);

        // 候補日データをUTC instant（ISO文字列）に整形
        // jstWallTimeToISO でカレンダー日付+時刻をJST壁時計として扱い正しいUTCに変換する
        const candidatesToInsert = values.candidates.map((c, index) => ({
          start_time: jstWallTimeToISO(c.date, c.startTime),
          end_time: jstWallTimeToISO(c.date, c.endTime),
          index_number: index,
        }));
        
        // supabase内でトランザクションを実装している
        const eventId = await createEvent.mutateAsync({
          title: values.title,
          passwordDigest: hashedPassword,
          comment: values.comment,
          candidates: candidatesToInsert,
        });

        // ダイアログを表示
        setCreatedEventId(eventId);
        setShowDialog(true);

      } catch (error) {
        console.error('Failed to create event:', error);
        toast.error('イベント作成に失敗しました', {position: 'top-center'})
      }
    };
	
  return (
    <div>
			<Separator className="my-8" />
      
      <div className='flex flex-col sm:flex-row gap-3 justify-between items-center bg-card p-4 rounded-xl border border-primary/20 shadow-md shadow-primary/10'>
        <p className="text-sm text-muted-foreground ml-2">
          入力内容を確認して送信してください
        </p>
        <div className='flex gap-3'>
          <Button className="hover:bg-destructive/10 hover:text-destructive " variant="ghost" type="button" onClick={() => form.reset()}>
            <Eraser/>リセット
          </Button>
          <Button className='px-12 font-bold' size="lg" onClick={form.handleSubmit(onSubmit)}>
            {isSubmitting ?  
              <>
                <Spinner/>作成中...
              </> : 
              <>
                <Plus/>作成する
              </>
            }
          </Button>
        </div>
      </div>
        
      <CreatedDialog
        open={showDialog}
        onChangeOpen={setShowDialog}
        eventId={createdEventId}
      />
		</div>
  )
}

export default CreateEvent