'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, type EventCreateFormData } from '@/features/event-create/schema';
import NewHero from './NewHero';
import EventInfoFields from './EventInfoFields';
import CandidatesFields from './candidates/CandidatesFields';
import CandidateList from './candidates/CandidateList';
import EventCreateActions from './EventCreateActions';

export default function CreateEventContainer() {
  const form = useForm<EventCreateFormData>({
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
            <EventInfoFields control={form.control} />
          </section>

          <section className="flex-1 max-w-xl px-3">
            <CandidatesFields control={form.control} />
          </section>
        </div>

        <section className='flex-row justify-center w-full max-w-6xl mx-auto px-3'>
          <CandidateList control={form.control}/>
        </section>

        <section className='max-w-6xl mx-auto px-3 mb-5'>
          <EventCreateActions form={form}/>
        </section>
      </fieldset>
    </form>
  );
}
