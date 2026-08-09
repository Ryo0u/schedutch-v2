import type { FieldErrors } from 'react-hook-form';
import type { EventCreateFormData } from '@/features/event-create/schema';

type CandidateErrors = FieldErrors<EventCreateFormData>['candidates'];

export const CANDIDATE_TIME_ERROR_MESSAGE = '時間に不備がある候補日があります';
export const CANDIDATE_INVALID_ERROR_MESSAGE =
  '候補日のデータに不備があります。該当の候補日を削除して追加し直してください';

/**
 * 候補日一覧のフッターに出すエラーメッセージを組み立てる。
 *
 * zod resolver が作る errors.candidates は3つの形をとる。
 * - 配列でない（message を直接持つ）: 候補日が0件（min(1)）。一覧ではなく入力側で表示するので null を返す
 * - 配列 + 要素直下の message: superRefine が付ける開始/終了時間の前後関係エラー
 * - 配列 + 要素の date/startTime/endTime にネストしたエラー: 候補日そのものが壊れている
 *
 * ネストしたエラーは要素直下に message を持たないため、message の有無だけを見ると取りこぼす。
 */
export const buildCandidateListErrorMessage = (errors: CandidateErrors): string | null => {
  if (!Array.isArray(errors)) return null;

  // 削除済みインデックスは穴（undefined）になるため取り除く
  const itemErrors = errors.filter((error) => error != null);
  if (itemErrors.length === 0) return null;

  if (itemErrors.some((error) => error.message)) return CANDIDATE_TIME_ERROR_MESSAGE;

  return CANDIDATE_INVALID_ERROR_MESSAGE;
};
