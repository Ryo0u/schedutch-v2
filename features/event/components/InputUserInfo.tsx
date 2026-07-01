import { Control, Controller } from 'react-hook-form';
import { UserFormData } from '@/features/event/schema';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';

interface InputUserProps {
  control: Control<UserFormData>;
}

function InputUserInfo({ control }: InputUserProps) {
  return (
    <FieldGroup>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="title">
                名前<span className="text-destructive">*</span>
              </FieldLabel>
              <Input id="name" {...field} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">
                パスワード<span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="password"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        name="comment"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="comment">コメント</FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                id="comment"
                {...field}
                rows={10}
                className="min-h-15 resize-none"
                aria-invalid={fieldState.invalid}
              />
              <InputGroupAddon align="block-end">
                <InputGroupText className="tabular-nums">
                  {field.value.length}/30
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}

export default InputUserInfo;
