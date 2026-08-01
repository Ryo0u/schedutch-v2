import { describe, it, expect } from "vitest";
import {
  toJSTDateString,
  toJSTDateOnly,
  formatJSTTime,
  formatJSTDate,
  jstWallTimeToISO,
  jstDateStringToStartOfDayMs,
  jstDateStringToEndOfDayMs,
} from "./datetime";

describe("toJSTDateString", () => {
  it('UTC日時をJSTの"YYYY-MM-DD"にする（ブラウザTZ非依存）', () => {
    expect(toJSTDateString("2024-03-15T15:00:00.000Z")).toBe("2024-03-16");
    expect(toJSTDateString("2024-03-15T14:59:00.000Z")).toBe("2024-03-15");
  });
});

describe("toJSTDateOnly", () => {
  it("JSTの年月日をブラウザローカルの0時Dateとして返す", () => {
    const d = toJSTDateOnly("2024-03-15T15:00:00.000Z");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(16);
    expect(d.getHours()).toBe(0);
  });
});

describe("formatJSTTime", () => {
  it('UTC日時をJSTの"HH:MM"にする', () => {
    expect(formatJSTTime("2024-03-15T00:00:00.000Z")).toBe("09:00");
    expect(formatJSTTime("2024-03-15T03:30:00.000Z")).toBe("12:30");
  });

  it("日付をまたぐ場合も時刻のみ正しく返す（UTC 15:00 → JST 翌0:00）", () => {
    expect(formatJSTTime("2024-03-15T15:00:00.000Z")).toBe("00:00");
  });

  it("一桁の時・分をゼロ埋めする", () => {
    expect(formatJSTTime("2024-03-15T22:05:00.000Z")).toBe("07:05");
  });
});

describe("formatJSTDate", () => {
  it("JST基準の日付文字列を返す（UTC 15:00 はJSTでは翌日）", () => {
    const opts = { month: "numeric", day: "numeric" } as const;
    expect(formatJSTDate("2024-03-15T14:59:00.000Z", opts)).toBe("3/15");
    expect(formatJSTDate("2024-03-15T15:00:00.000Z", opts)).toBe("3/16");
  });
});

describe("jstWallTimeToISO", () => {
  it("JST壁時計時刻を正しいUTC instantに変換する", () => {
    // このinstantはJSTでは 2024-03-15 09:00
    const date = new Date("2024-03-15T00:00:00.000Z");
    expect(jstWallTimeToISO(date, "09:00")).toBe("2024-03-15T00:00:00.000Z");
  });

  it("9時より前の時刻はUTCで前日にロールバックする", () => {
    const date = new Date("2024-03-15T00:00:00.000Z");
    expect(jstWallTimeToISO(date, "00:00")).toBe("2024-03-14T15:00:00.000Z");
    expect(jstWallTimeToISO(date, "08:30")).toBe("2024-03-14T23:30:00.000Z");
  });

  it("日付部分はJST基準で解釈する（UTC 15:00以降はJST翌日）", () => {
    // このinstantはJSTでは 2024-03-16 00:30
    const date = new Date("2024-03-15T15:30:00.000Z");
    expect(jstWallTimeToISO(date, "10:00")).toBe("2024-03-16T01:00:00.000Z");
  });
});

describe("jstDateStringToStartOfDayMs", () => {
  it("JSTの0時のUTCミリ秒を返す", () => {
    expect(new Date(jstDateStringToStartOfDayMs("2024-03-15")).toISOString()).toBe(
      "2024-03-14T15:00:00.000Z"
    );
  });
});

describe("jstDateStringToEndOfDayMs", () => {
  it("JSTの23:59:59.999のUTCミリ秒を返す", () => {
    expect(new Date(jstDateStringToEndOfDayMs("2024-03-15")).toISOString()).toBe(
      "2024-03-15T14:59:59.999Z"
    );
  });
});
