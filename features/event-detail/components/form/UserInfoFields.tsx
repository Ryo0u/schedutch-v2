import { Control } from 'react-hook-form';
import { UserFormData } from '@/features/event-detail/schema';
import { COMMENT_MAX_LENGTH } from '@/lib/validation';
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

      <TextareaCounterField control={control} name="comment" label="コメント" rows={10} maxLength={COMMENT_MAX_LENGTH} />
    </FieldGroup>
  );
}

export default UserInfoFields;
