import type { Tables } from '@/lib/database.types';

export type ResponseStatus = 'ok' | 'maybe' | 'ng';

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
