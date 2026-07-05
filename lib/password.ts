import bcrypt from "bcryptjs";

/**
 * 平文パスワードを bcrypt でハッシュ化して返す。
 *
 * bcryptjs は既定で `$2b$` プレフィックスの digest を生成するが、
 * Supabase の pgcrypto はこのプレフィックスを解釈できず crypt() での
 * サーバー側照合が常に失敗する（`$2a$` は正しく解釈できる）。
 * $2a$/$2b$ の違いは255バイトを超える長さのパスワードでのみ計算結果に
 * 影響するバージョンタグであり、それ未満の長さでは生成される digest は
 * 完全に同一になる。このアプリのパスワードはフォーム側で3〜12文字に
 * 制限されているため、プレフィックスのみ $2a$ に正規化して保存しても
 * 安全（ラベルの貼り替えであり、暗号学的な中身は変わらない）。
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const digest = await bcrypt.hash(plain, salt);
  return digest.replace(/^\$2[by]\$/, "$2a$");
}
