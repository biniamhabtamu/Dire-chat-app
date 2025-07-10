import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Message {
  id: string
  content: string
  user_id: string
  user_email: string
  created_at: string
  channel_id: string
}

export interface Channel {
  id: string
  name: string
  description?: string
  created_at: string
}