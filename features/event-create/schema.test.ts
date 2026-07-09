import { describe, it, expect } from "vitest";
import { formSchema } from "./schema";

const validData = {
  title: "飲み会",
  password: "abc",
  comment: "",
  candidates: [{ date: new Date(2024, 2, 15), startTime: "09:00", endTime: "10:00" }],
};

describe("formSchema", () => {
  it("正常な入力を受け付ける", () => {
    expect(formSchema.safeParse(validData).success).toBe(true);
  });

  describe("title", () => {
    it("空文字を拒否する", () => {
      expect(formSchema.safeParse({ ...validData, title: "" }).success).toBe(false);
    });

    it("10文字は許可し、11文字を拒否する", () => {
      expect(formSchema.safeParse({ ...validData, title: "あ".repeat(10) }).success).toBe(true);
      expect(formSchema.safeParse({ ...validData, title: "あ".repeat(11) }).success).toBe(false);
    });
  });

  describe("password", () => {
    it("3〜12文字を許可し、範囲外を拒否する", () => {
      expect(formSchema.safeParse({ ...validData, password: "ab" }).success).toBe(false);
      expect(formSchema.safeParse({ ...validData, password: "abc" }).success).toBe(true);
      expect(formSchema.safeParse({ ...validData, password: "a".repeat(12) }).success).toBe(true);
      expect(formSchema.safeParse({ ...validData, password: "a".repeat(13) }).success).toBe(false);
    });
  });

  describe("comment", () => {
    it("30文字は許可し、31文字を拒否する", () => {
      expect(formSchema.safeParse({ ...validData, comment: "あ".repeat(30) }).success).toBe(true);
      expect(formSchema.safeParse({ ...validData, comment: "あ".repeat(31) }).success).toBe(false);
    });
  });

  describe("candidates", () => {
    it("空配列を拒否する", () => {
      expect(formSchema.safeParse({ ...validData, candidates: [] }).success).toBe(false);
    });

    it("開始時刻 >= 終了時刻の候補を拒否し、該当indexにissueが付く", () => {
      const result = formSchema.safeParse({
        ...validData,
        candidates: [
          { date: new Date(2024, 2, 15), startTime: "09:00", endTime: "10:00" },
          { date: new Date(2024, 2, 16), startTime: "10:00", endTime: "10:00" },
        ],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0]?.path).toEqual(["candidates", 1]);
      }
    });
  });
});
