'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { InputEventInfo, InputEventCandidates, CandidatesList, CreateEvent } from '@/features/new';
import { formSchema } from '@/features/new/schema';
import { Badge } from '@/components/ui/badge';

export default function New() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      password: '',
      comment: '',
      candidates: [],
    },
  });
  
  const { isSubmitting } = form.formState;

  return (
    <form>
      <fieldset disabled={isSubmitting}>
        <div className="flex flex-col sm:flex-row justify-center items-end gap-8 w-full max-w-6xl mx-auto mt-5 mb-8">
          <section className="flex-1 max-w-xl shrink-0 px-3">
            <div className="p-4 mb-3 space-y-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" className="h-10 w-10" />
                <h1 className="text-xl font-extrabold tracking-tight text-primary">
                  SCHEDUTCH
                </h1>
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  日程調整を、もっとシンプルに。
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  schedutch（スケダッチ）は、面倒な予定調整をスムーズにするツールです。
                  候補日を選んで URL を送るだけ。ログイン不要で、誰でもすぐに回答できます。
                </p>
              </div>
              
              <div className='flex flex-wrap gap-2 '>
                <Badge className='py-3'>
                  ログイン不要
                </Badge>
                <Badge className='py-3'>
                    全機能が無料
                </Badge>
              </div>
            </div>
            
            <InputEventInfo control={form.control} />
          </section>
          
          <section className="flex-1 max-w-xl px-3">
            <InputEventCandidates control={form.control} />
          </section>
        </div>
        
        <section className='flex-row justify-center w-full max-w-6xl mx-auto px-3'>
          <CandidatesList control={form.control}/>
        </section>
        
        <section className='max-w-6xl mx-auto px-3 mb-5'>
          <CreateEvent form={form}/>
        </section>
      </fieldset>
    </form>
  );
}
