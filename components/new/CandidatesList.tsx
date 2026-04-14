import { FormData } from '@/app/new/page';
import { Control, Controller, useFieldArray, useFormState, useWatch } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react'; 
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '../ui/item';

interface InputEventProps {
	control: Control<FormData>;
}

function CandidatesList({ control }: InputEventProps) {
	const { remove } = useFieldArray({ control, name: "candidates" });
	const { errors } = useFormState({ control });
	const watchedFields = useWatch({ control, name: "candidates" });
	
	// セレクトの時間オプション
	const timeOptions = Array.from({ length: 48 }).map((_, i) => {
		const hours = Math.floor(i / 2).toString().padStart(2, '0');
		const minutes = (i % 2 === 0 ? '00' : '30');
		return `${hours}:${minutes}`;
	});
	
	
  return (
    <div>
      <Card>
				<CardHeader>
					<CardTitle className="text-center text-xl font-bold">
						追加した候補日
					</CardTitle>
					<CardDescription className="text-center">
						追加した候補日の確認と時間の個別変更ができます
					</CardDescription>
				</CardHeader>
				
				<Separator/>
				
				<CardContent>
					<ItemGroup className="grid grid-cols-4 justify-center gap-4">
						{watchedFields.filter(item => item && item.date).map((item, index) => {
							const hasError = !!errors.candidates?.[index];
							
							return (
								<Item 
									key={index}
									variant="outline"
									className="items-center justify-between max-w-sm w-full mb-3"
								>
									<ItemTitle className="text-sm font-bold truncate">
										{format(new Date(item.date), 'MM/dd (eee)', { locale: ja })}
									</ItemTitle>
									<ItemActions>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-destructive hover:bg-destructive/10"
											onClick={() => remove(index)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</ItemActions>
									
									<Separator/>
									
									<ItemContent>
										<FieldGroup className='flex-row gap-3'>
											<Controller
												name={`candidates.${index}.startTime`}
												control={control}
												render={({ field }) => (
													<Field data-invalid={hasError}>
														<FieldLabel className='text-xs'>開始</FieldLabel>
														<Select value={field.value} onValueChange={field.onChange}>
															<SelectTrigger aria-invalid={hasError}>
																<SelectValue/>
															</SelectTrigger>
															<SelectContent>
																{timeOptions.map((time) => (
																	<SelectItem key={`from-${time}`} value={time}>{time}</SelectItem>
																))}
															</SelectContent>
														</Select>
													</Field>
												)}
											/>
											
											<Controller
												name={`candidates.${index}.endTime`}
												control={control}
												render={({ field }) => (
													<Field data-invalid={hasError}>
														<FieldLabel className='text-xs'>終了</FieldLabel>
														<Select value={field.value} onValueChange={field.onChange}>
															<SelectTrigger aria-invalid={hasError}>
																<SelectValue/>
															</SelectTrigger>
															<SelectContent>
																{timeOptions.map((time) => (
																	<SelectItem key={`to-${time}`} value={time}>{time}</SelectItem>
																))}
															</SelectContent>
														</Select>
													</Field>
												)}
											/>
										</FieldGroup>
									</ItemContent>
								</Item>
							)
						})}
					</ItemGroup>
				</CardContent>
			</Card>
    </div>
  )
}

export default CandidatesList