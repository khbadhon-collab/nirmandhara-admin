import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ulpreqvxedabsrhzylzk.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscHJlcXZ4ZWRhYnNyaHp5bHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTU0MjQsImV4cCI6MjA5NjU5MTQyNH0.dW-pAHqodSn0rCSXiYf4qqVjzc7KSYt6bbIl3JTeq2w'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
