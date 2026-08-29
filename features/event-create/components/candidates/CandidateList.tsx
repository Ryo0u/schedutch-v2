import { type EventCreateFormData } from '@/features/event-create/schema';
import {
  type Control,
  Controller,
  useFormState,
  type FieldArrayWithId,
  type UseFieldArrayRemove,
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
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item';
import EmptyList from './EmptyList';
import TimeSelect from './TimeSelect';
import { buildCandidateListErrorMessage } from '@/features/event-create/lib/candidateErrors';

interface CandidateListProps {
  control: Control<EventCreateFormData>;
  fields: FieldArrayWithId<EventCreateFormData, 'candidates'>[];
  remove: UseFieldArrayRemove;
}

function CandidateList({ control, fields, remove }: CandidateListProps) {
  const { errors } = useFormState({ control });

  const sortedFields = [...fields]
    .map((item, originalIndex) => ({ ...item, originalIndex })) //元のインデックスを保持し処理を正常に行えるようにする
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const errorMessage = buildCandidateListErrorMessage(errors.candidates);

  return (
    <div>
      <Card className="shadow-primary/10 ring-primary/20 shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">追加した候補日</CardTitle>
          <CardDescription className="text-center">
            追加した候補日の確認と時間の個別変更ができます
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="max-h-150 overflow-y-auto">
          {fields.length === 0 ? (
            <EmptyList />
          ) : (
            <Field>
              <FieldLabel className={errors.candidates ? 'text-destructive' : ''}>
                候補日一覧
              </FieldLabel>
              <FieldContent>
                <ItemGroup className="grid grid-cols-2 justify-center gap-4 sm:grid-cols-4">
                  {sortedFields.map((item) => {
                    const actualIndex = item.originalIndex;
                    const hasError = !!errors.candidates?.[actualIndex];

                    return (
                      <Item
                        key={item.id}
                        variant="outline"
                        className="mb-3 w-full max-w-sm items-center justify-between"
                      >
                        <ItemTitle className="truncate text-sm font-bold">
                          {format(new Date(item.date), 'MM/dd (eee)', { locale: ja })}
                        </ItemTitle>
                        <ItemActions>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 h-7 w-7"
                            aria-label={`${format(new Date(item.date), 'MM/dd (eee)', { locale: ja })}の候補日を削除`}
                            onClick={() => remove(actualIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </ItemActions>

                        <Separator />

                        <ItemContent>
                          <FieldGroup className="gap-3 sm:flex-row">
                            <Controller
                              name={`candidates.${actualIndex}.startTime`}
                              control={control}
                              render={({ field }) => (
                                <Field
                                  className="flex flex-row sm:flex-col"
                                  data-invalid={hasError}
                                >
                                  <FieldLabel className="text-xs">開始</FieldLabel>
                                  <TimeSelect
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    ariaInvalid={hasError}
                                  />
                                </Field>
                              )}
                            />

                            <Controller
                              name={`candidates.${actualIndex}.endTime`}
                              control={control}
                              render={({ field }) => (
                                <Field
                                  className="flex flex-row sm:flex-col"
                                  data-invalid={hasError}
                                >
                                  <FieldLabel className="text-xs">終了</FieldLabel>
                                  <TimeSelect
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    ariaInvalid={hasError}
                                  />
                                </Field>
                              )}
                            />
                          </FieldGroup>
                        </ItemContent>
                      </Item>
                    );
                  })}
                </ItemGroup>
              </FieldContent>
            </Field>
          )}
        </CardContent>

        {errorMessage && (
          <CardFooter>
            <p className="text-destructive text-sm font-medium">{errorMessage}</p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default CandidateList;
