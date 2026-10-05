import { useState } from 'react';
import { passwordConfirmSchema } from '@/lib/validation';
import { isPasswordError } from '@/lib/rpcErrors';
import { useResetOnClose } from './useResetOnClose';

interface UsePasswordConfirmOptions {
  open: boolean;
}

/**
 * パスワード入力欄を1つ持つダイアログ（削除・事前検証など）の定型をまとめたフック。
 *
 * ダイアログのラッパーは閉じてもアンマウントされず入力値が次回に持ち越されるため、
 * 値を所有するこのフックがリセットまで持つ。open を取る都合上ダイアログ専用。
 */
export function usePasswordConfirm({ open }: UsePasswordConfirmOptions) {
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

  /**
   * action には mutation（mutateAsync）を渡す。パスワード不一致以外の失敗は
   * QueryProvider の MutationCache がトーストで通知するため、ここでは扱わない
   */
  const confirm = async (action: () => Promise<unknown>): Promise<boolean> => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await action();
      return true;
    } catch (error) {
      if (isPasswordError(error)) {
        setErrorMsg('パスワードが間違っています');
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 「照合用パスワードは空でなければよい」の判定をスキーマ側に一本化し、
  // 呼び出し側が個別に空チェックを書かなくて済むようにする
  const canSubmit = passwordConfirmSchema.safeParse(password).success;

  return { password, setPassword, isSubmitting, errorMsg, canSubmit, confirm };
}
