import type { Config } from '#root/config.js'
import type { Database } from './types.js'
import { createClient } from '@supabase/supabase-js'

export function createSupabaseClient(config: Config) {
  return createClient<Database>(config.supabaseUrl, config.supabaseKey)
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>
