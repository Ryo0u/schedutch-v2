'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formSchema } from '@/features/event-create/schema';
import NewHero from './NewHero';
import InputEventInfo from './InputEventInfo';
import InputEventCandidates from './candidates/InputEventCandidates';
import CandidatesList from './candidates/CandidatesList';
import CreateEvent from './CreateEvent';

export default function CreateEventContainer() {
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
            <NewHero />
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
