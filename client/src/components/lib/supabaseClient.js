import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase credentials
const SUPABASE_URL = 'https://psfumeaxgcsemrlzbuwq.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZnVtZWF4Z2NzZW1ybHpidXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTI4NjcsImV4cCI6MjA3NjE4ODg2N30.MJQ7ctg8kJEKVEW9DKxcQTTt0ZpaQa_n4qcdO2z78Us'

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
