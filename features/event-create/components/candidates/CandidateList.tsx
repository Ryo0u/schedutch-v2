import { EventCreateFormData } from '@/features/event-create/schema';
import { Control, Controller, useFieldArray, useFormState, useWatch } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item';
import EmptyList from './EmptyList';
import TimeSelect from './TimeSelect';

interface CandidateListProps {
	control: Control<EventCreateFormData>;
}

function CandidateList({ control }: CandidateListProps) {	
	const { fields, remove } = useFieldArray({ control, name: "candidates" });
	const { errors } = useFormState({ control });
	const watchedFields = useWatch({ control, name: "candidates" });

	const sortedFields = [...watchedFields]
		.filter(item => item && item.date)
		.map((item, originalIndex) => ({ ...item, originalIndex, fieldId: fields[originalIndex]?.id ?? originalIndex })) //元のインデックスを保持し処理を正常に行えるようにする
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
	
  return (
    <div>
      <Card className="shadow-md shadow-primary/10 ring-primary/20">
				<CardHeader>
					<CardTitle className="text-center text-xl font-bold">
						追加した候補日
					</CardTitle>
					<CardDescription className="text-center">
						追加した候補日の確認と時間の個別変更ができます
					</CardDescription>
				</CardHeader>
				
				<Separator/>
				
				<CardContent className='max-h-150 overflow-y-auto'>	
					{watchedFields.length === 0 ? (
						<EmptyList/>
					): (
						<Field>
							<FieldLabel className={errors.candidates?"text-destructive":""}>候補日一覧</FieldLabel>
							<FieldContent>
								<ItemGroup className="grid grid-cols-2 sm:grid-cols-4 justify-center gap-4">
									{sortedFields.map((item) => {
										const actualIndex = item.originalIndex
										const hasError = !!errors.candidates?.[actualIndex];
										
										return (
											<Item
												key={item.fieldId}
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
														aria-label={`${format(new Date(item.date), 'MM/dd (eee)', { locale: ja })}の候補日を削除`}
														onClick={() => remove(actualIndex)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</ItemActions>
												
												<Separator/>
												
												<ItemContent>
													<FieldGroup className='sm:flex-row gap-3'>
														<Controller
															name={`candidates.${actualIndex}.startTime`}
															control={control}
															render={({ field }) => (
																<Field className='flex flex-row sm:flex-col' data-invalid={hasError}>
																	<FieldLabel className='text-xs'>開始</FieldLabel>
																	<TimeSelect value={field.value} onValueChange={field.onChange} ariaInvalid={hasError} />
																</Field>
															)}
														/>

														<Controller
															name={`candidates.${actualIndex}.endTime`}
															control={control}
															render={({ field }) => (
																<Field className='flex flex-row sm:flex-col' data-invalid={hasError}>
																	<FieldLabel className='text-xs'>終了</FieldLabel>
																	<TimeSelect value={field.value} onValueChange={field.onChange} ariaInvalid={hasError} />
																</Field>
															)}
														/>
													</FieldGroup>
												</ItemContent>
											</Item>
										)
									})}
								</ItemGroup>
							</FieldContent>
						</Field>
					)}
				</CardContent >
				
				{errors.candidates && Array.isArray(errors.candidates) && errors.candidates.some((err) => err?.message) && (
					<CardFooter>
						<p className="text-sm text-destructive font-medium">
							時間に不備がある候補日があります
						</p>
					</CardFooter>
				)}
			</Card>
    </div>
  )
}

export default CandidateList