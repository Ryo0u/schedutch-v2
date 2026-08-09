import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/** features/ 直下の feature 名。feature 間の直接 import を禁止するために列挙する */
const FEATURES = ['home', 'event-create', 'event-detail'];

/**
 * CLAUDE.md「データアクセス」: Supabase への実アクセスは features/{feature}/api/ に集約する。
 * この層以外からクライアントを直接触らせない。
 */
const supabaseImportPattern = {
  group: ['@/utils/supabase', '@/utils/supabase/*'],
  message:
    'Supabase クライアントの import は features/{feature}/api/ 配下のみ。api 関数を query/mutation hook から呼ぶこと。',
};

/**
 * CLAUDE.md「ディレクトリ構成」: feature 間の直接 import は禁止。
 * 自分自身の feature だけを除外する。
 */
const otherFeaturesImportPattern = (feature) => ({
  group: ['@/features/*', '@/features/*/**', `!@/features/${feature}`, `!@/features/${feature}/**`],
  message:
    'feature 間の直接 import は禁止。共有したいものは lib/ か components/ui/ に昇格させること。',
});

/** no-restricted-imports は単一ルールで patterns がブロック間でマージされないため、都度組み立てる */
const restrictedImports = (...patterns) => ['error', { patterns }];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // supabase gen types の生成物。
    'lib/database.types.ts',
  ]),

  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // CLAUDE.md「エラーハンドリング」: 詳細は console.error、ユーザー通知は sonner の toast。
      'no-console': ['error', { allow: ['error', 'warn'] }],
      'no-alert': 'error',
      // 型と値の import を混ぜない（型が実行時バンドルに巻き込まれるのを防ぐ）。
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'no-restricted-imports': restrictedImports(supabaseImportPattern),
      // CLAUDE.md「データアクセス」: write は全て RPC 経由（RLS で直叩き write を封鎖しているため）。
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'CallExpression[callee.object.callee.property.name="from"][callee.property.name=/^(insert|update|upsert|delete)$/]',
          message:
            'write は supabase.rpc() 経由で行う。from(...).insert()/.update()/.upsert()/.delete() は RLS で封鎖されている。',
        },
      ],
    },
  },

  // feature 配下は「他 feature 禁止」を上乗せする。
  ...FEATURES.map((feature) => ({
    files: [`features/${feature}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': restrictedImports(
        supabaseImportPattern,
        otherFeaturesImportPattern(feature),
      ),
    },
  })),

  // api 層だけが Supabase クライアントを import できる（他 feature の禁止は維持する）。
  ...FEATURES.map((feature) => ({
    files: [`features/${feature}/api/**/*.ts`],
    rules: {
      'no-restricted-imports': restrictedImports(otherFeaturesImportPattern(feature)),
    },
  })),

  // Supabase クライアント本体と設定ファイル。
  {
    files: ['utils/supabase/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['*.{js,mjs,ts}'],
    rules: {
      'no-console': 'off',
    },
  },
]);

export default eslintConfig;
