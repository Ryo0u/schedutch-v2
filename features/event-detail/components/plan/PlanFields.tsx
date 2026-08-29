import { Controller, useWatch, type Control, type UseFormSetValue } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatJSTCandidateDateLabel, formatJSTTime } from '@/lib/datetime';
import {
  findAvailableParticipantIds,
  listPlanTimeOptions,
  listPlansInCandidate,
  type PlanTimeOption,
} from '@/features/event-detail/lib/plans';
import type { PlanFormData } from '@/features/event-detail/schema';
import type { Candidate, Plan, User } from '@/features/event-detail/types';

interface PlanFieldsProps {
  control: Control<PlanFormData>;
  setValue: UseFormSetValue<PlanFormData>;
  candidates: Candidate[];
  users: Pick<User, 'id' | 'name' | 'responses'>[];
  plans: Plan[];
}

function TimeField({
  control,
  name,
  label,
  options,
  onChanged,
}: {
  control: Control<PlanFormData>;
  name: 'startTime' | 'endTime';
  label: string;
  options: PlanTimeOption[];
  onChanged: (value: string) => void;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="flex-1" data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`plan-${name}`}>{label}</FieldLabel>
          <Select
            value={field.value}
            onValueChange={(value) => {
              if (!value) return;
              field.onChange(value);
              onChanged(value);
            }}
          >
            <SelectTrigger id={`plan-${name}`} aria-invalid={fieldState.invalid}>
              <SelectValue>
                {(value) => options.find((o) => o.value === value)?.label ?? '選択'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
    />
  );
}

function PlanFields({ control, setValue, candidates, users, plans }: PlanFieldsProps) {
  const candidateId = useWatch({ control, name: 'candidateId' });
  const startTime = useWatch({ control, name: 'startTime' });
  const endTime = useWatch({ control, name: 'endTime' });
  const participants = useWatch({ control, name: 'participants' });

  const candidate = candidates.find((c) => c.id === candidateId);
  const plansOnDate = candidate ? listPlansInCandidate(plans, candidate) : [];
  const { startOptions, endOptions } = candidate
    ? listPlanTimeOptions(candidate, plansOnDate)
    : { startOptions: [], endOptions: [] };

  const startMs = startTime ? new Date(startTime).getTime() : 0;
  const endMs = endTime ? new Date(endTime).getTime() : 0;
  const availableIds =
    startMs < endMs ? findAvailableParticipantIds(users, startMs, endMs) : new Set<string>();

  // 日時を変えて参加できなくなった人は選択から外す。UI 上選べない人が
  // 選択済みのまま残ると、送信時にサーバー側の検証で弾かれるため
  const pruneParticipants = (nextStart: string, nextEnd: string) => {
    const nextStartMs = new Date(nextStart).getTime();
    const nextEndMs = new Date(nextEnd).getTime();
    const nextAvailableIds =
      nextStartMs < nextEndMs
        ? findAvailableParticipantIds(users, nextStartMs, nextEndMs)
        : new Set<string>();

    const kept = participants.filter((id) => nextAvailableIds.has(id));
    if (kept.length !== participants.length) {
      setValue('participants', kept, { shouldValidate: true });
    }
  };

  const handleCandidateChange = (value: string, onChange: (value: string) => void) => {
    onChange(value);
    // 候補日ごとに選べる時刻が変わるので、その候補日の先頭・末尾に振り直す
    const next = candidates.find((c) => c.id === value);
    if (!next) return;
    const options = listPlanTimeOptions(next, listPlansInCandidate(plans, next));
    const nextStart = options.startOptions[0]?.value ?? '';
    const nextEnd = options.endOptions[options.endOptions.length - 1]?.value ?? '';
    setValue('startTime', nextStart);
    setValue('endTime', nextEnd);
    pruneParticipants(nextStart, nextEnd);
  };

  return (
    <FieldGroup className="mb-5 gap-4">
      <Controller
        control={control}
        name="candidateId"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="plan-date">日付</FieldLabel>
            <Select
              value={field.value}
              onValueChange={(value) => value && handleCandidateChange(value, field.onChange)}
            >
              <SelectTrigger id="plan-date" aria-invalid={fieldState.invalid}>
                {/* Select は選択値をそのまま表示するため、候補日のラベルに整形する */}
                <SelectValue placeholder="日付を選択">
                  {(value) => {
                    const selected = candidates.find((c) => c.id === value);
                    return selected
                      ? formatJSTCandidateDateLabel(selected.start_time)
                      : '日付を選択';
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {candidates.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {formatJSTCandidateDateLabel(c.start_time)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {plansOnDate.length > 0 && (
        <p className="text-muted-foreground bg-muted/40 rounded-md px-3 py-2 text-xs">
          この日に登録済みの予定:{' '}
          {plansOnDate
            .map((p) => `${formatJSTTime(p.start_time)} - ${formatJSTTime(p.end_time)}`)
            .join(' / ')}
          <br />
          重なる時間は選べません
        </p>
      )}

      <div>
        <div className="flex items-end gap-2">
          <TimeField
            control={control}
            name="startTime"
            label="開始"
            options={startOptions}
            onChanged={(value) => pruneParticipants(value, endTime)}
          />
          <span className="text-muted-foreground pb-2">〜</span>
          <TimeField
            control={control}
            name="endTime"
            label="終了"
            options={endOptions}
            onChanged={(value) => pruneParticipants(startTime, value)}
          />
        </div>
        <PlanTimeError control={control} />
      </div>

      <Controller
        control={control}
        name="participants"
        render={({ field, fieldState }) => {
          const selected = new Set(field.value);

          const toggleMember = (userId: string) => {
            field.onChange(
              selected.has(userId)
                ? field.value.filter((id) => id !== userId)
                : [...field.value, userId],
            );
          };

          return (
            // Field を1つにまとめると、参加不可の行の disabled につられて
            // group-has-disabled/field で全員のチェックボックスが薄くなる
            <div className="flex flex-col gap-2">
              <FieldLabel>メンバー</FieldLabel>
              <div className="divide-border border-border max-h-52 divide-y overflow-y-auto rounded-md border">
                {users.map((user) => {
                  const isAvailable = availableIds.has(user.id);
                  return (
                    <Field
                      key={user.id}
                      orientation="horizontal"
                      className="justify-between gap-2 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`plan-member-${user.id}`}
                          checked={selected.has(user.id)}
                          disabled={!isAvailable}
                          onCheckedChange={() => toggleMember(user.id)}
                        />
                        <FieldLabel
                          htmlFor={`plan-member-${user.id}`}
                          className={isAvailable ? 'cursor-pointer' : ''}
                        >
                          {user.name}
                        </FieldLabel>
                      </div>
                      {!isAvailable && (
                        <span className="text-muted-foreground text-xs">この時間は参加不可</span>
                      )}
                    </Field>
                  );
                })}
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </div>
          );
        }}
      />
    </FieldGroup>
  );
}

/** 開始 < 終了のエラーは終了時刻に付くが、行の中に出すと開始側と高さがずれるため行の下に出す */
function PlanTimeError({ control }: { control: Control<PlanFormData> }) {
  return (
    <Controller
      control={control}
      name="endTime"
      render={({ fieldState }) =>
        fieldState.invalid ? <FieldError className="mt-1" errors={[fieldState.error]} /> : <></>
      }
    />
  );
}

export default PlanFields;
