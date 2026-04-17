import { FormData } from '@/app/new/page';
import { Control, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { Calendar } from '../ui/calendar';
import { useState } from 'react';
import { type DateRange } from "react-day-picker"
import { addDays, getDate } from "date-fns"
import { ja } from "date-fns/locale"
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { useDeviceType } from '../hooks/UseDeviceType';
import { TIME_OPTIONS } from '@/lib/constants';


interface InputEventProps {
	control: Control<FormData>;
}

const InputEventCandidates = ({ control }: InputEventProps) => {
	const { append } = useFieldArray({ control, name: "candidates" });
	
	// ローカルに選択している日時を一時保存
	const [startTime, setStartTime] = useState<string>("06:00")
	const [endTime, setEndTime] = useState<string>("21:00")
	const [selectedDates, setSelectedDates] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 5),
  })
	
	const watchedFields = useWatch({ control, name: "candidates" });
	
	const device = useDeviceType()
	const calendarColum = (device: "mobile" | "tablet" | "desktop") => {
		if (device === 'desktop') return 2
		else return 1
	}
	
	// 追加された候補日はカレンダーから除外する
	const disabledDates = watchedFields
		.filter(item => item && item.date)
		.map(item => new Date(item.date));
	
	const handleAddCandidates = () => {
		if (!selectedDates?.from || !selectedDates?.to) return;
		
		// 選択した候補日リスト
		const datesList: Date[] = [];
		let current = new Date(selectedDates.from);
		const end = new Date(selectedDates.to);

		while (current <= end) {
			datesList.push(new Date(current));
			current.setDate(current.getDate() + 1)
		}
		
		// 既存の候補日リスト
		const existingDateStrings = new Set(
			watchedFields.map(item => new Date(item.date).toDateString())
		)
		
		datesList
			.filter(date => !existingDateStrings.has(date.toDateString()))
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
      <Card>
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
												numberOfMonths={calendarColum(device)}
												className="h-full lg:h-80"
											/>
										</Field>
										
										<div className='flex gap-4'>
											<Field>
												<FieldLabel htmlFor="time-from">開始</FieldLabel>
												<Select value={startTime} onValueChange={(val) => setStartTime(val ?? "")}>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													
													<SelectContent>
														<SelectGroup>
															<SelectLabel>開始時間</SelectLabel>
															{TIME_OPTIONS.map((time) => (
																<SelectItem key={`from-${time}`} value={time}>
																	{time}
																</SelectItem>
															))}
														</SelectGroup>
													</SelectContent>
												</Select>
											</Field>

											<Field>
												<FieldLabel htmlFor="time-from">終了</FieldLabel>
												<Select value={endTime} onValueChange={(val) => setEndTime(val ?? "")}>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													
													<SelectContent>
														<SelectGroup>
															<SelectLabel>終了時間</SelectLabel>
															{TIME_OPTIONS.map((time) => (
																<SelectItem key={`to-${time}`} value={time}>
																	{time}
																</SelectItem>
															))}
														</SelectGroup>
													</SelectContent>
												</Select>
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

export default InputEventCandidates