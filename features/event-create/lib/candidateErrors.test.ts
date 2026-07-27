import { describe, it, expect } from "vitest";
import {
  buildCandidateListErrorMessage,
  CANDIDATE_INVALID_ERROR_MESSAGE,
  CANDIDATE_TIME_ERROR_MESSAGE,
} from "./candidateErrors";

// zodResolver が実際に返す errors.candidates の形に合わせたテストデータ
describe("buildCandidateListErrorMessage", () => {
  it("エラーがない場合は null を返す", () => {
    expect(buildCandidateListErrorMessage(undefined)).toBeNull();
  });

  it("候補日0件（min(1)）は配列にならないので null を返す（入力側で表示するため）", () => {
    const errors = {
      message: "候補日を1つ以上選択し、追加ボタンを押してください",
      type: "too_small",
    } as const;

    expect(buildCandidateListErrorMessage(errors)).toBeNull();
  });

  it("要素直下の message（開始/終了時間の前後関係）は時間エラーとして扱う", () => {
    const errors = [
      { message: "開始時間は終了時間より前に入力してください", type: "custom" },
    ] as const;

    expect(buildCandidateListErrorMessage([...errors])).toBe(CANDIDATE_TIME_ERROR_MESSAGE);
  });

  it("date にネストしたエラーも取りこぼさず不備として扱う", () => {
    const errors = [
      undefined,
      { date: { message: "Invalid input: expected date, received undefined", type: "invalid_type" } },
    ];

    expect(buildCandidateListErrorMessage(errors)).toBe(CANDIDATE_INVALID_ERROR_MESSAGE);
  });

  it("startTime にネストしたエラーも不備として扱う", () => {
    const errors = [{ startTime: { message: "Invalid input", type: "invalid_type" } }];

    expect(buildCandidateListErrorMessage(errors)).toBe(CANDIDATE_INVALID_ERROR_MESSAGE);
  });

  it("時間エラーとネストしたエラーが混在する場合は時間エラーを優先する", () => {
    const errors = [
      { message: "開始時間は終了時間より前に入力してください", type: "custom" },
      { date: { message: "Invalid input", type: "invalid_type" } },
    ];

    expect(buildCandidateListErrorMessage(errors)).toBe(CANDIDATE_TIME_ERROR_MESSAGE);
  });

  it("要素がすべて穴（削除済みインデックス）の場合は null を返す", () => {
    expect(buildCandidateListErrorMessage([undefined, undefined])).toBeNull();
  });
});
