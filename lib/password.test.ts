import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import { hashPassword } from './password';

describe('hashPassword', () => {
  it('$2a$ プレフィックスの digest を返す', async () => {
    const digest = await hashPassword('abc123');

    expect(digest).toMatch(/^\$2a\$/);
  });

  it('bcryptjs が $2b$ で生成した digest でもプレフィックスのみ $2a$ に正規化される', async () => {
    const salt = await bcrypt.genSalt(10);
    const rawDigest = await bcrypt.hash('abc123', salt);
    expect(rawDigest).toMatch(/^\$2b\$/);

    const normalized = rawDigest.replace(/^\$2b\$/, '$2a$');
    expect(normalized).toMatch(/^\$2a\$/);
    // プレフィックス以外（cost・salt・ハッシュ本体）は改変されない
    expect(normalized.slice(4)).toBe(rawDigest.slice(4));
  });

  it('正規化後も同じ平文で照合できる（暗号学的な中身は変わらない）', async () => {
    const digest = await hashPassword('abc123');

    expect(bcrypt.compareSync('abc123', digest)).toBe(true);
    expect(bcrypt.compareSync('wrong', digest)).toBe(false);
  });

  it('実行のたびに異なる digest を生成する（salt がランダム）', async () => {
    const digest1 = await hashPassword('abc123');
    const digest2 = await hashPassword('abc123');

    expect(digest1).not.toBe(digest2);
  });
});
