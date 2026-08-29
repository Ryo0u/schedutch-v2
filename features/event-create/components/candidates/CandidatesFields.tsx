import { type EventCreateFormData } from '@/features/event-create/schema';
import {
  type Control,
  Controller,
  type FieldArrayWithId,
  type UseFieldArrayAppend,
} from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { type DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useIsClient } from '@/hooks/useIsClient';
import { buildNewCandidateDates, startOfToday } from '@/features/event-create/lib/candidateDates';
import TimeSelect from './TimeSelect';

interface CandidatesFieldsProps {
  control: Control<EventCreateFormData>;
  fields: FieldArrayWithId<EventCreateFormData, 'candidates'>[];
  append: UseFieldArrayAppend<EventCreateFormData, 'candidates'>;
}

const CandidatesFields = ({ control, fields, append }: CandidatesFieldsProps) => {
  // ローカルに選択している日時を一時保存
  const [startTime, setStartTime] = useState<string>('06:00');
  const [endTime, setEndTime] = useState<string>('21:00');
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>({
    from: startOfToday(),
    to: addDays(startOfToday(), 5),
  });

  const device = useDeviceType();
  // useDeviceType は SSR 時に 'desktop' を返すため、そのまま numberOfMonths に渡すと
  // モバイルの初回描画で 2 ヶ月分のカレンダーが縦に伸び、直下の時間選択に重なる。
  // ハイドレーション後にのみ複数月表示へ切り替え、SSR/初回描画は 1 ヶ月に固定する。
  const isClient = useIsClient();
  const numberOfMonths = isClient && device === 'desktop' ? 2 : 1;

  // 追加された候補日はカレンダーから除外する
  const disabledDates = fields.map((item) => new Date(item.date));

  const handleAddCandidates = () => {
    if (!selectedDates?.from || !selectedDates?.to) return;

    buildNewCandidateDates(selectedDates, disabledDates).forEach((date) => {
      append({
        date: date,
        startTime: startTime,
        endTime: endTime,
      });
    });

    // 日付選択リセット
    setSelectedDates(undefined);
  };

  return (
    <div>
      <Card className="shadow-primary/10 ring-primary/20 shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">候補日</CardTitle>
          <CardDescription className="text-center">
            候補となる日付と時間を選択してください
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent>
          <FieldGroup>
            <Controller
              name="candidates"
              control={control}
              render={({ fieldState }) => {
                // 候補日が追加されているかをエラーメッセージの有無で判定
                const hasArrayError = !!fieldState.error?.message;

                return (
                  <>
                    <Field>
                      <FieldLabel className={hasArrayError ? 'text-destructive' : ''}>
                        日付と時間<span className="text-destructive">*</span>
                      </FieldLabel>
                      <Calendar
                        mode="range"
                        locale={ja}
                        defaultMonth={selectedDates?.from}
                        selected={selectedDates}
                        onSelect={setSelectedDates}
                        disabled={disabledDates}
                        numberOfMonths={numberOfMonths}
                      />
                    </Field>

                    <div className="flex gap-4">
                      <Field>
                        <FieldLabel htmlFor="time-from">開始</FieldLabel>
                        <TimeSelect
                          id="time-from"
                          value={startTime}
                          onValueChange={setStartTime}
                          groupLabel="開始時間"
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="time-to">終了</FieldLabel>
                        <TimeSelect
                          id="time-to"
                          value={endTime}
                          onValueChange={setEndTime}
                          groupLabel="終了時間"
                        />
                      </Field>
                    </div>

                    {hasArrayError && <FieldError errors={[fieldState.error]} />}
                  </>
                );
              }}
            />
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex justify-center gap-3">
          <CardDescription className="text-xs">
            日付と時間を選択したらこちらのボタンを押して候補日を追加してください
          </CardDescription>
          <Button
            type="button"
            onClick={handleAddCandidates}
            disabled={!selectedDates?.from || !selectedDates?.to}
          >
            <Plus />
            追加
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CandidatesFields;
