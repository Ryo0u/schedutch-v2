// 放置イベントの自動削除までの保持期間。DB の delete_expired_events() RPC
// （20260829000000_delete_expired_events.sql）の interval と対応させること。
// 回答者ゼロなら作成日時から、回答者ありなら最終アクティビティ（max(users.updated_at)）から数える。
export const EVENT_RETENTION_DAYS_NO_RESPONSE = 60;
export const EVENT_RETENTION_DAYS_AFTER_RESPONSE = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface EventDeletionInput {
  /** イベントの作成日時（UTC ISO）。取得できないときは null */
  createdAt: string | null;
  /** 各参加者の updated_at（UTC ISO）。空配列なら回答者なし */
  userUpdatedAts: string[];
}

export interface EventDeletionInfo {
  /** 自動削除される日時 */
  deletionDate: Date;
  /** 現在から削除までの残り日数（切り上げ）。期限を過ぎていれば 0 以下 */
  daysLeft: number;
}

/**
 * イベントが自動削除される日時と残り日数を求める。
 *
 * 削除条件は supabase の delete_expired_events() RPC と揃えている:
 * 回答者ゼロなら作成日時から NO_RESPONSE 日、回答者ありなら最終アクティビティ
 * （max(users.updated_at)）から AFTER_RESPONSE 日。
 *
 * createdAt が無い場合のみ null を返す（表示側で非表示にする想定）。
 */
export function getEventDeletionInfo(
  { createdAt, userUpdatedAts }: EventDeletionInput,
  now: Date = new Date(),
): EventDeletionInfo | null {
  const hasResponse = userUpdatedAts.length > 0;

  let anchorMs: number;
  let retentionDays: number;
  if (hasResponse) {
    anchorMs = Math.max(...userUpdatedAts.map((iso) => new Date(iso).getTime()));
    retentionDays = EVENT_RETENTION_DAYS_AFTER_RESPONSE;
  } else {
    if (createdAt === null) return null;
    anchorMs = new Date(createdAt).getTime();
    retentionDays = EVENT_RETENTION_DAYS_NO_RESPONSE;
  }

  const deletionDate = new Date(anchorMs + retentionDays * MS_PER_DAY);
  const daysLeft = Math.ceil((deletionDate.getTime() - now.getTime()) / MS_PER_DAY);
  return { deletionDate, daysLeft };
}
