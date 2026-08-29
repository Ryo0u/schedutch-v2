import { describe, it, expect } from 'vitest';
import { userFormSchema, userEditFormSchema, eventEditFormSchema } from './schema';

const validUser = {
  name: '太郎',
  comment: '',
  password: 'abc',
  responses: [{ candidate_id: 'c1', time: new Date('2024-03-15T00:00:00.000Z'), status: 'ok' }],
};

describe('userFormSchema', () => {
  it('正常な入力を受け付ける', () => {
    expect(userFormSchema.safeParse(validUser).success).toBe(true);
  });

  it('nameは1〜10文字（空・11文字を拒否）', () => {
    expect(userFormSchema.safeParse({ ...validUser, name: '' }).success).toBe(false);
    expect(userFormSchema.safeParse({ ...validUser, name: 'あ'.repeat(10) }).success).toBe(true);
    expect(userFormSchema.safeParse({ ...validUser, name: 'あ'.repeat(11) }).success).toBe(false);
  });

  it('commentは100文字まで', () => {
    expect(userFormSchema.safeParse({ ...validUser, comment: 'あ'.repeat(100) }).success).toBe(
      true,
    );
    expect(userFormSchema.safeParse({ ...validUser, comment: 'あ'.repeat(101) }).success).toBe(
      false,
    );
  });

  it('passwordは3〜12文字', () => {
    expect(userFormSchema.safeParse({ ...validUser, password: 'ab' }).success).toBe(false);
    expect(userFormSchema.safeParse({ ...validUser, password: 'a'.repeat(12) }).success).toBe(true);
    expect(userFormSchema.safeParse({ ...validUser, password: 'a'.repeat(13) }).success).toBe(
      false,
    );
  });

  it('statusはok/maybe/ngのいずれかのみ許可する', () => {
    expect(
      userFormSchema.safeParse({
        ...validUser,
        responses: [{ ...validUser.responses[0], status: 'maybe' }],
      }).success,
    ).toBe(true);
    expect(
      userFormSchema.safeParse({
        ...validUser,
        responses: [{ ...validUser.responses[0], status: 'invalid' }],
      }).success,
    ).toBe(false);
  });
});

describe('userEditFormSchema', () => {
  it('passwordなしで受け付ける（事前検証済みのため）', () => {
    const withoutPassword = {
      name: validUser.name,
      comment: validUser.comment,
      responses: validUser.responses,
    };
    expect(userEditFormSchema.safeParse(withoutPassword).success).toBe(true);
  });
});

describe('eventEditFormSchema', () => {
  const validEvent = { title: '飲み会', comment: '', password: 'abc' };

  it('正常な入力を受け付ける', () => {
    expect(eventEditFormSchema.safeParse(validEvent).success).toBe(true);
  });

  it('titleは1〜10文字', () => {
    expect(eventEditFormSchema.safeParse({ ...validEvent, title: '' }).success).toBe(false);
    expect(eventEditFormSchema.safeParse({ ...validEvent, title: 'あ'.repeat(11) }).success).toBe(
      false,
    );
  });

  it('passwordは1文字以上（空を拒否する。文字数上限の検証は更新RPC側の照合に委ねる）', () => {
    expect(eventEditFormSchema.safeParse({ ...validEvent, password: '' }).success).toBe(false);
    expect(eventEditFormSchema.safeParse({ ...validEvent, password: 'a' }).success).toBe(true);
  });

  it('commentは200文字まで（参加者コメントより上限が広い）', () => {
    expect(
      eventEditFormSchema.safeParse({ ...validEvent, comment: 'あ'.repeat(200) }).success,
    ).toBe(true);
    expect(
      eventEditFormSchema.safeParse({ ...validEvent, comment: 'あ'.repeat(201) }).success,
    ).toBe(false);
  });
});
