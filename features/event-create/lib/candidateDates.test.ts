import { describe, it, expect } from "vitest";
import { buildNewCandidateDates } from "./candidateDates";

// ローカルTZの壁時計日付として作る（カレンダー選択と同じ形）
const day = (d: number) => new Date(2024, 2, d);

describe("buildNewCandidateDates", () => {
  it("選択範囲を1日刻みで展開する（両端を含む）", () => {
    const dates = buildNewCandidateDates({ from: day(15), to: day(17) }, []);

    expect(dates.map((d) => d.getDate())).toEqual([15, 16, 17]);
  });

  it("1日だけの範囲（from = to）は1件になる", () => {
    const dates = buildNewCandidateDates({ from: day(15), to: day(15) }, []);

    expect(dates).toHaveLength(1);
  });

  it("既存の候補日と重複する日付を除外する", () => {
    const dates = buildNewCandidateDates({ from: day(15), to: day(17) }, [day(16)]);

    expect(dates.map((d) => d.getDate())).toEqual([15, 17]);
  });

  it("from/toが欠けている場合は空配列を返す", () => {
    expect(buildNewCandidateDates({ from: day(15), to: undefined }, [])).toEqual([]);
    expect(buildNewCandidateDates({ from: undefined, to: undefined }, [])).toEqual([]);
  });
});
