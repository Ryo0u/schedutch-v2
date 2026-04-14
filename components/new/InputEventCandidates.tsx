import { FormData } from '@/app/new/page';
import { Control, Controller, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { Calendar } from '../ui/calendar';
import { useState } from 'react';
import { type DateRange } from "react-day-picker"
import { addDays } from "date-fns"
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

interface InputEventProps {
	control: Control<FormData>;
}

const InputEventCandidates = ({ control }: InputEventProps) => {
	const { append } = useFieldArray({ control, name: "candidates" });
	
	const [startTime, setStartTime] = useState<string>("06:00")
	const [endTime, setEndTime] = useState<string>("21:00")
	const [selectedDates, setSelectedDates] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  })
	
	// セレクトの時間オプション
	const timeOptions = Array.from({ length: 48 }).map((_, i) => {
		const hours = Math.floor(i / 2).toString().padStart(2, '0');
		const minutes = (i % 2 === 0 ? '00' : '30');
		return `${hours}:${minutes}`;
	});
	
	const handleAddCandidates = () => {
		if (!selectedDates?.from || !selectedDates?.to) return;
		
		let current = new Date(selectedDates.from);
    const end = new Date(selectedDates.to);
		
		while (current <= end) {
			append({
				date: new Date(current),
				startTime: startTime,
				endTime: endTime,
			})
			
			current.setDate(current.getDate() + 1)
		}
		
		// 日付選択リセット
		setSelectedDates({
			from: new Date(),
    	to: addDays(new Date(), 30),
		})
		
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
							render={({ fieldState }) => (
								<>
									<Field>
										<FieldLabel className={fieldState.invalid ? "text-destructive" : ""}>
											日付と時間<span className="text-destructive">*</span>
										</FieldLabel>
										<Calendar 
											mode="range"
											defaultMonth={selectedDates?.from}
											selected={selectedDates}
											onSelect={setSelectedDates}
											numberOfMonths={2}
											className="h-80"
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
														{timeOptions.map((time) => (
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
														{timeOptions.map((time) => (
															<SelectItem key={`to-${time}`} value={time}>
																{time}
															</SelectItem>
														))}
													</SelectGroup>
												</SelectContent>
											</Select>
										</Field>
									</div>
									
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</>
							)}
						/>
					</FieldGroup>
				</CardContent>
				
				<CardFooter className='flex gap-3 justify-center'>
					<CardDescription className='text-xs'>
						日付と時間を選択したらこちらのボタンを押して候補日を追加してください
					</CardDescription>
					<Button
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