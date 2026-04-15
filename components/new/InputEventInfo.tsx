import { FormData } from '@/app/new/page';
import { Control, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from '../ui/field';
import { Separator } from '../ui/separator';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '../ui/input-group';

interface InputEventProps {
  control: Control<FormData>;
}

const InputEventInfo = ({ control }: InputEventProps) => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            基本情報
          </CardTitle>
          <CardDescription className="text-center">
            イベント名と編集用パスワードを入力してください
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent>
          <FieldGroup>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="title">
                    イベント名<span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="title"
                    {...field}
                    placeholder="例: ⚪︎⚪︎の練習日程"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">
                    編集用パスワード<span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="password"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    イベントの削除の際に必要となります
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            
            <Controller
              name='comment'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='comment'>コメント</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      id='comment'
                      {...field}
                      rows={10}
                      className="min-h-18 resize-none"
                      placeholder="頑張ります！！"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value.length}/30文字
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export default InputEventInfo;
