import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';
import { COMMENT_MAX_LENGTH } from '@/lib/validation';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';

interface TextareaCounterFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  rows: number;
  /** 文字数カウンタの分母。既定はコメント欄の上限（commentSchema と同じ値）を使う */
  maxLength?: number;
  placeholder?: string;
  className?: string;
  unit?: string;
}

function TextareaCounterField<T extends FieldValues>({
  control,
  name,
  label,
  rows,
  maxLength = COMMENT_MAX_LENGTH,
  placeholder,
  className = 'min-h-15 resize-none',
  unit = '',
}: TextareaCounterFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <InputGroup>
            <InputGroupTextarea
              id={name}
              {...field}
              rows={rows}
              className={className}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
            />
            <InputGroupAddon align="block-end">
              <InputGroupText className="tabular-nums">
                {field.value.length}/{maxLength}
                {unit}
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export default TextareaCounterField;
