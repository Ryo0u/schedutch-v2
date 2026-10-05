/**
 * RPC 側の RAISE EXCEPTION ... USING ERRCODE と対応する独自 SQLSTATE。
 * メッセージ文言ではなく SQLSTATE（error.code）で判別するため、
 * RPC 側のメッセージ文言を変更しても分類は壊れない。
 */
const RPC_ERRCODES = {
  /** パスワード不一致 */
  passwordMismatch: 'PWD01',
  /** 操作対象（イベント・参加者・予定）が存在しない。削除済みの対象を操作した場合など */
  notFound: 'NTF01',
  /** 他の人の更新と競合した。予定の時間帯が重なった場合など */
  conflict: 'CNF01',
} as const;

/** PostgREST が `.single()` で対象行が0件（または複数件）だった場合に返すエラーコード */
const POSTGREST_NOT_FOUND_ERRCODE = 'PGRST116';

/**
 * ユーザーが次に取るべき行動で分けたエラーの種類。
 * - password-mismatch: 入力したパスワードを直す
 * - not-found: 対象は削除済み。再読み込みする
 * - conflict: 他の人の更新とぶつかった。最新の状態を見て操作し直す
 * - network: 通信できなかった。接続を確認して再試行する
 * - unexpected: 上記以外。UI 側で防いでいる不正値やアプリのバグで、ユーザーには対処できない
 */
export type RpcErrorKind =
  | 'password-mismatch'
  | 'not-found'
  | 'conflict'
  | 'network'
  | 'unexpected';

function getErrorCode(error: unknown): unknown {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return (error as { code: unknown }).code;
  }
  return undefined;
}

/** supabase-js（postgrest-js）が投げたエラーを、ユーザーが取るべき行動の単位に分類する */
export function classifyError(error: unknown): RpcErrorKind {
  const code = getErrorCode(error);
  switch (code) {
    case RPC_ERRCODES.passwordMismatch:
      return 'password-mismatch';
    case RPC_ERRCODES.notFound:
    case POSTGREST_NOT_FOUND_ERRCODE:
      return 'not-found';
    case RPC_ERRCODES.conflict:
      return 'conflict';
    // postgrest-js は fetch 自体が失敗した（サーバーから応答がない）場合に code を空文字にする。
    // 応答があった場合は SQLSTATE か PGRST コードが入り、非 JSON の応答なら code 自体を持たない
    case '':
      return 'network';
    default:
      return 'unexpected';
  }
}

function getErrorMessage(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error as { message: unknown };
    return typeof message === 'string' && message !== '' ? message : undefined;
  }
  return undefined;
}

/**
 * エラーをユーザーに見せるトーストの文言に変換する。
 * fallback は操作名を含む文言（例: 「予定の追加に失敗しました」）で、
 * ユーザーに対処しようがない unexpected のときにだけ使う。
 */
export function toErrorMessage(error: unknown, fallback: string): string {
  switch (classifyError(error)) {
    case 'password-mismatch':
      return 'パスワードが違います';
    case 'not-found':
      return '対象が見つかりませんでした。削除された可能性があります';
    case 'conflict':
      // CNF01 の RPC メッセージは何が競合したかをユーザー向けに書いているため、そのまま見せる
      return getErrorMessage(error) ?? '他の人の更新と競合しました。最新の状態を確認してください';
    case 'network':
      return '通信に失敗しました。接続を確認して、もう一度お試しください';
    case 'unexpected':
      return fallback;
  }
}

/** パスワード不一致で投げられた例外かどうか */
export function isPasswordError(error: unknown): boolean {
  return classifyError(error) === 'password-mismatch';
}

/** 対象が存在しないことで投げられた例外かどうか（RPC の NTF01 と select の PGRST116 の両方） */
export function isNotFoundError(error: unknown): boolean {
  return classifyError(error) === 'not-found';
}

/**
 * パスワード不一致を表す例外を生成する。
 * verifyUserPassword のように RPC の例外ではなく真偽値でパスワード不一致を
 * 表す関数の呼び出し元で、classifyError による分類に載せたい場合に使う。
 */
export function createPasswordMismatchError(): Error & { code: string } {
  return Object.assign(new Error('パスワードが違います'), {
    code: RPC_ERRCODES.passwordMismatch,
  });
}

/**
 * 対象の未存在を表す例外を生成する。
 * getEvent が `.single()` の結果を防御的にチェックする箇所など、
 * PostgREST のエラーを経由しない場合に classifyError による分類に載せたい場合に使う。
 */
export function createNotFoundError(message: string): Error & { code: string } {
  return Object.assign(new Error(message), { code: RPC_ERRCODES.notFound });
}
