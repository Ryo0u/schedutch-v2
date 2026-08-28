import { type Control } from 'react-hook-form';
import { USER_COMMENT_MAX_LENGTH, type UserFormData } from '@/features/event-detail/schema';
import { FieldGroup } from '@/components/ui/field';
import TextField from '@/components/form/TextField';
import TextareaCounterField from '@/components/form/TextareaCounterField';

interface InputUserProps {
  control: Control<UserFormData>;
}

function UserInfoFields({ control }: InputUserProps) {
  return (
    <FieldGroup>
      <div className="flex flex-col gap-3 sm:flex-row">
        <TextField control={control} name="name" label="名前" required />
        <TextField control={control} name="password" label="パスワード" required />
      </div>

      <TextareaCounterField
        control={control}
        name="comment"
        label="コメント"
        rows={10}
        maxLength={USER_COMMENT_MAX_LENGTH}
      />
    </FieldGroup>
  );
}

export default UserInfoFields;
