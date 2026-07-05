import { useState } from "react";
import { isPasswordError } from "@/features/event-detail/api/eventApi";

/**
 * パスワードを伴う操作（削除・事前検証など）の送信中フラグとエラー表示をまとめたフック。
 *
 * パスワード入力欄自体の state は呼び出し側が持つ（1つの入力値を複数の
 * アクションで共有するケースがあるため）。run() には実行したい非同期処理を渡す。
 * パスワード不一致以外の例外は呼び出し側にそのまま投げ直すので、
 * 呼び出し側で汎用のエラー処理（トースト表示など）を行う。
 */
export function usePasswordConfirm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const run = async (action: () => Promise<void>): Promise<boolean> => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await action();
      return true;
    } catch (error) {
      if (isPasswordError(error)) {
        setErrorMsg("パスワードが間違っています");
        return false;
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, errorMsg, setErrorMsg, run };
}
