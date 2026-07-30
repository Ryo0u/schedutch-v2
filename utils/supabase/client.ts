import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

if (process.env.NODE_ENV === 'development' && !supabaseUrl.includes('127.0.0.1')) {
  console.warn(`[schedutch] 本番Supabase (${supabaseUrl}) に接続しています。ローカルに戻すには \`npm run env:local\` を実行してください。`)
}

export const supabase = createClient<Database>(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)