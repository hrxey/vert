import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://mniddbidiyawrwguktcx.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uaWRkYmlkaXlhd3J3Z3VrdGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTgzMjgsImV4cCI6MjA3NDk3NDMyOH0.s_eTZ7Hy-BIxmic8r6YV2TPU6mIq8ms2jPaH-z6nT5c'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
