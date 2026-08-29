'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { eventCreateFormSchema, type EventCreateFormData } from '@/features/event-create/schema';
import { useCreateEvent } from '@/features/event-create/hooks/useCreateEvent';
import { jstWallTimeToISO } from '@/lib/datetime';
import NewHero from './NewHero';
import EventInfoFields from './EventInfoFields';
import CandidatesFields from './candidates/CandidatesFields';
import CandidateList from './candidates/CandidateList';
import EventCreateActions from './EventCreateActions';
import EventCreatedDialog from './EventCreatedDialog';

export default function CreateEventContainer() {
  const form = useForm<EventCreateFormData>({
    resolver: zodResolver(eventCreateFormSchema),
    defaultValues: {
      title: '',
      password: '',
      comment: '',
      candidates: [],
    },
  });

  // 候補日の field array は同じ name で複数持つと fields が同期しないため、ここで1つだけ生成して配布する
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'candidates' });

  const [showDialog, setShowDialog] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const createEvent = useCreateEvent();

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: EventCreateFormData) => {
    try {
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
        password: values.password,
        comment: values.comment,
        candidates: candidatesToInsert,
      });

      // ダイアログを表示
      setCreatedEventId(eventId);
      setShowDialog(true);
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('イベント作成に失敗しました', { position: 'top-center' });
    }
  };

  return (
    // onSubmit を form 側で受けないと、入力欄での Enter がネイティブ送信になりページがリロードされる
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <fieldset disabled={isSubmitting}>
        <div className="mx-auto mt-5 mb-8 flex w-full max-w-6xl flex-col items-end justify-center gap-8 sm:flex-row">
          <section className="max-w-xl flex-1 shrink-0 px-3">
            <NewHero />
            <EventInfoFields control={form.control} />
          </section>

          <section className="max-w-xl flex-1 px-3">
            <CandidatesFields control={form.control} fields={fields} append={append} />
          </section>
        </div>

        <section className="mx-auto w-full max-w-6xl flex-row justify-center px-3">
          <CandidateList control={form.control} fields={fields} remove={remove} />
        </section>

        <section className="mx-auto mb-5 max-w-6xl px-3">
          <EventCreateActions isSubmitting={isSubmitting} onReset={() => form.reset()} />
        </section>
      </fieldset>

      <EventCreatedDialog open={showDialog} onChangeOpen={setShowDialog} eventId={createdEventId} />
    </form>
  );
}
