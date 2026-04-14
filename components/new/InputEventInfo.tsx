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
import { Field, FieldGroup, FieldLabel, FieldError } from '../ui/field';
import { Separator } from '../ui/separator';

interface InputEventInfoProps {
  control: Control<FormData>;
}

const InputEventInfo = ({ control }: InputEventInfoProps) => {
  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            基本情報
          </CardTitle>
          <CardDescription className="px-4">
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
