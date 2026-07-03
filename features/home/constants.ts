export const STEPS = [
  {
    n: '01',
    title: 'イベントを作る',
    body: 'タイトルと候補日・時間帯を選ぶだけ。カレンダーから日付を選び、開始・終了時刻を指定できます。',
    src: '/lp/step-1.png',
    alt: 'Schedutchのイベント作成画面。イベント名と候補日を入力している状態',
    filename: 'step-1.png — イベント作成画面',
    url: 'schedutch.app/new',
  },
  {
    n: '02',
    title: 'URLを共有する',
    body: '発行されたURLを参加者に送るだけ。相手側もアカウント登録は要りません。',
    src: '/lp/step-2.png',
    alt: 'SchedutchのURL発行画面。イベントURLが表示されている',
    filename: 'step-2.png — URL共有画面',
    url: 'schedutch.app/event/...',
  },
  {
    n: '03',
    title: 'みんなが回答する',
    body: '各候補日に「参加できる○・未定▲・参加できない✕」を30分単位で選んで回答。',
    src: '/lp/step-3.png',
    alt: '参加者の回答入力画面。時間帯ごとに○▲✕が色分けされたセルが並んでいる',
    filename: 'step-3.png — 回答入力画面',
    url: 'schedutch.app/event/...',
  },
  {
    n: '04',
    title: '一覧で確認する',
    body: '全員の回答がタイムラインで可視化。誰がいつ空いているか、ひと目でわかります。',
    src: '/lp/step-4.png',
    alt: 'イベント詳細の予定一覧グリッド。複数人の回答が色で表示されている',
    filename: 'step-4.png — 予定一覧グリッド',
    url: 'schedutch.app/event/...',
  },
] as const;

export type CellStatus = 'o' | 't' | 'x';

export const COMPARISON_ROWS: { name: string; cells: CellStatus[] }[] = [
  { name: 'A', cells: ['o', 'o', 'x', 'x', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'] },
  { name: 'B', cells: ['x', 'x', 'o', 'o', 't', 't', 'o', 'o', 'o', 'o', 'x', 'x'] },
  { name: 'C', cells: ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'] },
];

export const COMPARISON_TIME_LABELS = ['15', '16', '17', '18', '19', '20'];

export const CONDITIONS = [
  'AさんとBさんが両方参加できる枠',
  '3人以上集まれる枠',
  '2時間以上連続して空いている枠',
  '▲（未定）も予定に含める',
  'この日付範囲だけ対象にする',
];

export const EXTRACT_RESULT = `7/3
06:00 - 08:00 : A, B, C
15:30 - 20:00 : A, B(▲), C

7/4
06:00 - 07:30 : A, B, C
19:30 - 21:00 : A, B, C`;

export const FEATURES = [
  {
    title: '登録なし・ログインなし',
    body: 'URLだけで作成から回答まで完結。参加者に負担をかけません。',
    chip: 'bg-blue-400/80',
  },
  {
    title: 'パスワード保護',
    body: 'イベント・参加者それぞれにパスワードを設定でき、編集や削除を守れます。',
    chip: 'bg-yellow-300/80',
  },
  {
    title: '30分単位の候補日',
    body: '「6/10の14:00〜18:00」のように、日付だけでなく時間帯まで指定できます。',
    chip: 'bg-blue-400/80',
  },
  {
    title: 'コピペできる抽出結果',
    body: '抽出した空き枠はテキストで出力。そのまま通知やカレンダーに貼れます。',
    chip: 'bg-yellow-300/80',
  },
] as const;
