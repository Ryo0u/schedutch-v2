import type { ResponseStatus } from "@/features/event-detail/types";

export const RESPONSE_STATUSES: ResponseStatus[] = ["ok", "maybe", "ng"];

interface StatusMeta {
  symbol: string;
  label: string;
  /** InputResponses.tsx のトグルボタン選択中スタイル */
  toggleActiveClass: string;
  /** InputResponses.tsx の回答入力セルの背景色 */
  inputCellClass: string;
  /** CandidateSection.tsx の回答表示セルの背景色 */
  candidateCellClass: string;
  /** ResponsesInfo.tsx の凡例の色ドット */
  legendDotClass: string;
}

export const STATUS_META: Record<ResponseStatus, StatusMeta> = {
  ok: {
    symbol: "⚫︎",
    label: "参加",
    toggleActiveClass: "border-blue-400! text-blue-400!",
    inputCellClass: "bg-blue-400 text-white",
    candidateCellClass: "bg-blue-400/70 text-white",
    legendDotClass: "bg-blue-400/80",
  },
  maybe: {
    symbol: "▲",
    label: "未定",
    toggleActiveClass: "border-yellow-300! text-yellow-400",
    inputCellClass: "bg-yellow-300 text-yellow-800",
    candidateCellClass: "bg-yellow-300/70 text-yellow-800",
    legendDotClass: "bg-yellow-300/80",
  },
  ng: {
    symbol: "✖︎",
    label: "不参加",
    toggleActiveClass: "border-gray-400! text-gray-400",
    inputCellClass: "bg-gray-400 text-gray-600",
    candidateCellClass: "bg-gray-400/70 text-gray-600",
    legendDotClass: "bg-gray-400/80",
  },
};
