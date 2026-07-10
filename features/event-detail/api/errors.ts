/** パスワード不一致を表す SQLSTATE。RPC 側の RAISE EXCEPTION ... USING ERRCODE = 'PWD01' と対応する */
const PASSWORD_MISMATCH_ERRCODE = "PWD01";

/**
 * 検証 RPC がパスワード不一致で投げた例外かどうかを判定する。
 * メッセージ文言ではなく SQLSTATE（error.code）で判別するため、
 * RPC 側のメッセージ文言を変更しても壊れない。
 */
export function isPasswordError(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as { code: unknown }).code === PASSWORD_MISMATCH_ERRCODE;
  }
  return false;
}

/**
 * パスワード不一致を表す例外を生成する。
 * verifyUserPassword のように RPC の例外ではなく真偽値でパスワード不一致を
 * 表す関数の呼び出し元で、isPasswordError による分類に載せたい場合に使う。
 */
export function createPasswordMismatchError(): Error & { code: string } {
  return Object.assign(new Error("パスワードが違います"), { code: PASSWORD_MISMATCH_ERRCODE });
}

/** PostgREST が `.single()` で対象行が0件（または複数件）だった場合に返すエラーコード */
const NOT_FOUND_ERRCODE = "PGRST116";

/**
 * getEvent が「イベントが存在しない」ことで投げた例外かどうかを判定する。
 * ネットワークエラー等の他の失敗と区別し、not-found 表示に振り分けるために使う。
 */
export function isEventNotFoundError(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as { code: unknown }).code === NOT_FOUND_ERRCODE;
  }
  return false;
}

/**
 * イベント未存在を表す例外を生成する。
 * getEvent が `.single()` の結果を防御的にチェックする箇所など、
 * PostgREST のエラーを経由しない場合に isEventNotFoundError による分類に載せたい場合に使う。
 */
export function createEventNotFoundError(): Error & { code: string } {
  return Object.assign(new Error("イベントが見つかりませんでした"), { code: NOT_FOUND_ERRCODE });
}
