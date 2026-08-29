import { useMutation } from '@tanstack/react-query';
import { verifyUserPassword } from '@/features/event-detail/api/userApi';
import { createPasswordMismatchError } from '@/features/event-detail/api/errors';

/**
 * 参加者のパスワードを検証する。
 *
 * 書き込みを伴わないが、送信時に手続き的に走らせたいので useMutation を使う。
 * RPC は不一致を真偽値で返すため、ここで例外に変換して
 * 他のパスワード操作と同じ isPasswordError による分類に載せる。
 */
export function useVerifyUserPassword() {
  return useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const isMatch = await verifyUserPassword(userId, password);
      if (!isMatch) throw createPasswordMismatchError();
    },
  });
}
