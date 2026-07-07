import { FormData } from '@/features/event-create/schema';
import { Control } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import TextField from '@/components/form/TextField';
import TextareaCounterField from '@/components/form/TextareaCounterField';

interface EventInfoFieldsProps {
  control: Control<FormData>;
}

const EventInfoFields = ({ control }: EventInfoFieldsProps) => {
  return (
    <div>
      <Card className="shadow-md shadow-primary/10 ring-primary/20">
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
            <TextField
              control={control}
              name="title"
              label="イベント名"
              required
              placeholder="例: ⚪︎⚪︎の練習日程"
            />

            <TextField
              control={control}
              name="password"
              label="編集用パスワード"
              required
              description="イベントの削除の際に必要となります"
            />

            <TextareaCounterField
              control={control}
              name="comment"
              label="コメント"
              rows={10}
              maxLength={30}
              className="min-h-18 resize-none"
              placeholder="頑張ります！！"
            />
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventInfoFields;
