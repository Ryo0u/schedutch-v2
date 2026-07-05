export type ResponseStatus = "ok" | "maybe" | "ng";

export interface Response {
  user_id: string;
  candidate_id: string;
  time: string;
  status: ResponseStatus;
}

export interface Candidate {
  id: string;
  event_id: string;
  start_time: string;
  end_time: string;
  index_number: number;
}

export interface User {
  id: string;
  event_id: string;
  name: string;
  comment: string;
  responses: Response[];
}

export interface EventData {
  id: string;
  title: string;
  comment: string;
  candidates: Candidate[];
  users: User[];
}

export type ParticipantInfo = { name: string; status: string };

export type TimeBlock = { start: number; end: number; participants: ParticipantInfo[] };
