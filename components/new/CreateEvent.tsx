import { supabase } from '@/utils/supabase/client';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Eraser, Plus } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '@/app/new/page';
import { toast } from "sonner"
import { useState } from 'react';
import CreatedDialog from './CreatedDiaolg';
import { Spinner } from '../ui/spinner';
import bcrypt from 'bcryptjs';

interface CreateEventActionProps {
  form: UseFormReturn<FormData>;
}

function CreateEvent({ form }: CreateEventActionProps) {
  const { isSubmitting } = form.formState;
  const [showDialog, setShowDialog] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
	
  const onSubmit = async (values: FormData) => {
      try {
        // パスワードのハッシュ化
        const salt = await bcrypt.genSalt(10);
        const hashedPassward = await bcrypt.hash(values.password, salt);
        
        // 候補日データをTIMESTAMP形式に整形
        const candidatesToInsert = values.candidates.map((c, index) => {
          const dateStr = c.date.toISOString().split('T')[0];
          return {
            start_time: `${dateStr}T${c.startTime}:00`,
            end_time: `${dateStr}T${c.endTime}:00`,
            index_number: index,
          };
        });
        
        // supabase内でトランザクションを実装している
        const { data: eventId, error } = await supabase.rpc('create_event_with_candidates', {
          p_title: values.title,
          p_password_digest: hashedPassward,
          p_comment: values.comment,
          p_candidates: candidatesToInsert,
        });
        
        if (error) throw error;
        
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
      
      <div className='flex flex-col sm:flex-row gap-3 justify-between items-center bg-muted/30 p-4 rounded-xl border border-border'>
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