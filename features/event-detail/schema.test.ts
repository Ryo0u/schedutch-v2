import { describe, it, expect } from "vitest";
import { UserFormSchema, UserEditFormSchema, EventEditFormSchema } from "./schema";

const validUser = {
  name: "太郎",
  comment: "",
  password: "abc",
  responses: [{ candidate_id: "c1", time: new Date("2024-03-15T00:00:00.000Z"), status: "ok" }],
};

describe("UserFormSchema", () => {
  it("正常な入力を受け付ける", () => {
    expect(UserFormSchema.safeParse(validUser).success).toBe(true);
  });

  it("nameは1〜10文字（空・11文字を拒否）", () => {
    expect(UserFormSchema.safeParse({ ...validUser, name: "" }).success).toBe(false);
    expect(UserFormSchema.safeParse({ ...validUser, name: "あ".repeat(10) }).success).toBe(true);
    expect(UserFormSchema.safeParse({ ...validUser, name: "あ".repeat(11) }).success).toBe(false);
  });

  it("commentは30文字まで", () => {
    expect(UserFormSchema.safeParse({ ...validUser, comment: "あ".repeat(30) }).success).toBe(true);
    expect(UserFormSchema.safeParse({ ...validUser, comment: "あ".repeat(31) }).success).toBe(false);
  });

  it("passwordは3〜12文字", () => {
    expect(UserFormSchema.safeParse({ ...validUser, password: "ab" }).success).toBe(false);
    expect(UserFormSchema.safeParse({ ...validUser, password: "a".repeat(12) }).success).toBe(true);
    expect(UserFormSchema.safeParse({ ...validUser, password: "a".repeat(13) }).success).toBe(false);
  });
});

describe("UserEditFormSchema", () => {
  it("passwordなしで受け付ける（事前検証済みのため）", () => {
    const withoutPassword = {
      name: validUser.name,
      comment: validUser.comment,
      responses: validUser.responses,
    };
    expect(UserEditFormSchema.safeParse(withoutPassword).success).toBe(true);
  });
});

describe("EventEditFormSchema", () => {
  const validEvent = { title: "飲み会", comment: "", password: "abc" };

  it("正常な入力を受け付ける", () => {
    expect(EventEditFormSchema.safeParse(validEvent).success).toBe(true);
  });

  it("titleは1〜10文字", () => {
    expect(EventEditFormSchema.safeParse({ ...validEvent, title: "" }).success).toBe(false);
    expect(EventEditFormSchema.safeParse({ ...validEvent, title: "あ".repeat(11) }).success).toBe(false);
  });

  it("passwordは1文字以上（空を拒否する。文字数上限の検証は更新RPC側の照合に委ねる）", () => {
    expect(EventEditFormSchema.safeParse({ ...validEvent, password: "" }).success).toBe(false);
    expect(EventEditFormSchema.safeParse({ ...validEvent, password: "a" }).success).toBe(true);
  });
});
