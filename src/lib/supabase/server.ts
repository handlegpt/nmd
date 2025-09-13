import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Create Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: any = null

if (supabaseUrl && supabaseServiceKey) {
  supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
} else {
  console.warn('🔧 Supabase server environment variables are not configured')
}

export { supabase }

// Helper function to create a client with user context
export function createClient() {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }
  return supabase
}
