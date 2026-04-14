import { FormData } from '@/app/new/page';
import { Control, Controller, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { Calendar } from '../ui/calendar';
import { useState } from 'react';
import { type DateRange } from "react-day-picker"
import { addDays } from "date-fns"
import { Field, FieldGroup } from '../ui/field';

interface InputEventProps {
	control: Control<FormData>;
}

const InputEventCandidates = ({ control }: InputEventProps) => {
	const { append } = useFieldArray({ control, name: "candidates" });
	
	const [selectedDates, setSelectedDates] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  })
	
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
						{/* <Controller/> */}
						<Field>
							<Calendar
								mode="range"
								defaultMonth={selectedDates?.from}
								selected={selectedDates}
								onSelect={setSelectedDates}
								numberOfMonths={2}
							/>
						</Field>
					</FieldGroup>
				</CardContent>
			</Card>
    </div>
  )
}

export default InputEventCandidates