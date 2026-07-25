import { EventCreateFormData } from '@/features/event-create/schema';
import { Control, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { type DateRange } from "react-day-picker"
import { addDays } from "date-fns"
import { ja } from "date-fns/locale"
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDeviceType } from '@/hooks/useDeviceType';
import { buildNewCandidateDates, startOfToday } from '@/features/event-create/lib/candidateDates';
import TimeSelect from './TimeSelect';


interface CandidatesFieldsProps {
	control: Control<EventCreateFormData>;
}

const CandidatesFields = ({ control }: CandidatesFieldsProps) => {
	const { append } = useFieldArray({ control, name: "candidates" });
	
	// ローカルに選択している日時を一時保存
	const [startTime, setStartTime] = useState<string>("06:00")
	const [endTime, setEndTime] = useState<string>("21:00")
	const [selectedDates, setSelectedDates] = useState<DateRange | undefined>({
    from: startOfToday(),
    to: addDays(startOfToday(), 5),
  })
	
	const watchedFields = useWatch({ control, name: "candidates" });
	
	const device = useDeviceType()
	const calendarColumns = (device: "mobile" | "tablet" | "desktop") => {
		if (device === 'desktop') return 2
		else return 1
	}
	
	// 追加された候補日はカレンダーから除外する
	const disabledDates = watchedFields
		.filter(item => item && item.date)
		.map(item => new Date(item.date));
	
	const handleAddCandidates = () => {
		if (!selectedDates?.from || !selectedDates?.to) return;

		const existingDates = watchedFields.map(item => new Date(item.date));

		buildNewCandidateDates(selectedDates, existingDates)
			.forEach(date => {
				append({
					date: date,
					startTime: startTime,
					endTime: endTime,
				});
			});

		// 日付選択リセット
		setSelectedDates(undefined)
	}
	
  return (
    <div>
      <Card className="shadow-md shadow-primary/10 ring-primary/20">
				<CardHeader>
					<CardTitle className="text-center text-xl font-bold">
						候補日
					</CardTitle>
					<CardDescription className="text-center">
						候補となる日付と時間を選択してください
					</CardDescription>
				</CardHeader>
				
				<Separator/>
				
				<CardContent>
					<FieldGroup>
						<Controller
							name='candidates'
							control={control}	
							render={({ fieldState }) => {
								// 候補日が追加されているかをエラーメッセージの有無で判定
								const hasArrayError = !!fieldState.error?.message;
								
								return (
									<>
										<Field>
											<FieldLabel className={hasArrayError ? "text-destructive" : ""}>
												日付と時間<span className="text-destructive">*</span>
											</FieldLabel>
											<Calendar 
												mode="range"
												locale={ja}
												defaultMonth={selectedDates?.from}
												selected={selectedDates}
												onSelect={setSelectedDates}
												disabled={disabledDates}
												numberOfMonths={calendarColumns(device)}
												className="h-full lg:h-80"
											/>
										</Field>
										
										<div className='flex gap-4'>
											<Field>
												<FieldLabel htmlFor="time-from">開始</FieldLabel>
												<TimeSelect id="time-from" value={startTime} onValueChange={setStartTime} groupLabel="開始時間" />
											</Field>

											<Field>
												<FieldLabel htmlFor="time-to">終了</FieldLabel>
												<TimeSelect id="time-to" value={endTime} onValueChange={setEndTime} groupLabel="終了時間" />
											</Field>
										</div>
										
										{hasArrayError && (
											<FieldError errors={[fieldState.error]} />
										)}
									</>
								)
							}}
						/>
					</FieldGroup>
				</CardContent>
				
				<CardFooter className='flex gap-3 justify-center'>
					<CardDescription className='text-xs'>
						日付と時間を選択したらこちらのボタンを押して候補日を追加してください
					</CardDescription>
					<Button
						type='button'
						onClick={handleAddCandidates}
						disabled={!selectedDates?.from || !selectedDates?.to}
					>
						<Plus/>追加
					</Button>
				</CardFooter>
			</Card>
    </div>
  )
}

export default CandidatesFields