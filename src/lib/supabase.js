import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Supabase keys nahi mili. .env.local file check karein aur server restart karein.')
}

export const supabase = createClient(
  url || 'http://localhost:54321',
  key || 'missing-key'
)