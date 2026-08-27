import { useState } from 'react';
import { toast } from 'sonner';
import { isPasswordError } from '@/features/event-detail/api/errors';
import { useResetOnClose } from './useResetOnClose';

interface UsePasswordConfirmOptions {
  open: boolean;
  /** パスワード不一致以外で失敗したときに出すトーストの文言 */
  errorMessage: string;
}

/**
 * パスワード入力欄を1つ持つダイアログ（削除・事前検証など）の定型をまとめたフック。
 *
 * ダイアログのラッパーは閉じてもアンマウントされず入力値が次回に持ち越されるため、
 * 値を所有するこのフックがリセットまで持つ。open を取る都合上ダイアログ専用。
 */
export function usePasswordConfirm({ open, errorMessage }: UsePasswordConfirmOptions) {
  const [password, setPasswordValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useResetOnClose(open, () => {
    setPasswordValue('');
    setErrorMsg(null);
  });

  const setPassword = (value: string) => {
    setPasswordValue(value);
    setErrorMsg(null);
  };

  const confirm = async (action: () => Promise<unknown>): Promise<boolean> => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await action();
      return true;
    } catch (error) {
      if (isPasswordError(error)) {
        setErrorMsg('パスワードが間違っています');
      } else {
        console.error('password confirm action failed', error);
        toast.error(errorMessage, { position: 'top-center' });
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { password, setPassword, isSubmitting, errorMsg, confirm };
}
