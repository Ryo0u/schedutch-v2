import type { Json, Tables } from '@/lib/database.types';
import type { ResponseStatus } from './lib/status';

// 定義の実体は RESPONSE_STATUSES（lib/status.ts）。従来どおりここから import できるよう再エクスポートする
export type { ResponseStatus };

/**
 * DB上は event_id / comment / index_number 等が nullable だが、
 * これは他テーブルからの参照を断ち切らないための保守的な制約であり、
 * RPC 経由の書き込みでは常に値が入る。getEvent の結合クエリで取得した
 * レコードは常にこれらが埋まっている前提で、Row型のnullableを外して定義する。
 */
export type Response = Omit<Tables<'responses'>, 'user_id' | 'candidate_id' | 'status'> & {
  user_id: string;
  candidate_id: string;
  status: ResponseStatus;
};

export type Candidate = Omit<Tables<'candidates'>, 'event_id' | 'index_number'> & {
  event_id: string;
  index_number: number;
};

export type User = Omit<Tables<'users'>, 'event_id' | 'comment' | 'password_digest'> & {
  event_id: string;
  comment: string;
  responses: Response[];
};

export type EventData = Omit<Tables<'events'>, 'comment' | 'password_digest' | 'created_at'> & {
  comment: string;
  candidates: Candidate[];
  users: User[];
};

/**
 * 保存用に整形済みの回答（time は ISO 文字列）。RPC への jsonb 引数として渡すため Json 互換を強制する。
 *
 * 他の Input 型（SaveUserResponsesInput 等）と違い api/ ではなくここに置くのは、
 * lib/responses.ts の toResponseInputs が生成し api/userApi.ts が消費する型で、
 * どちらか一方に置くと lib と api の間に依存が生まれるため。両者より下層のここに置く。
 */
export interface ResponseInput extends Record<string, Json> {
  candidate_id: string;
  time: string;
  status: ResponseStatus;
}

/** 開催予定のメンバー。▲（未定）かどうかは保持せず、表示時に responses から判定する */
export type PlanParticipant = {
  id: string;
  name: string;
};

/** 開催予定。取得時のネスト構造は planApi 側で平坦化する */
export type Plan = Omit<Tables<'plans'>, 'event_id' | 'memo' | 'created_at'> & {
  event_id: string;
  memo: string;
  participants: PlanParticipant[];
};
