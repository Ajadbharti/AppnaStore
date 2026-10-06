import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const url = import.meta.env.VITE_SUPABASE_URL
const hasKey = Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)
const urlLooksOk = /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url || '')

export default function Test() {
  const [msg, setMsg] = useState('Check ho raha hai...')

  useEffect(() => {
    if (!url || !hasKey) {
      setMsg('❌ .env.local se keys nahi padhi gayi. File ka naam aur jagah check karein, phir server restart karein.')
      return
    }
    if (!urlLooksOk) {
      setMsg('⚠️ URL ka format galat lag raha hai. Wo https://xxxx.supabase.co jaisa hona chahiye.')
      return
    }
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .then(({ error, count }) => {
        setMsg(
          error
            ? '❌ Error: ' + error.message
            : `Connected ✅ — products table mein ${count} rows hain`
        )
      })
      .catch((e) => setMsg('❌ ' + e.message))
  }, [])

  return (
    <div className="p-10 text-xl leading-relaxed">
      <p>URL: <b>{url || 'MISSING'}</b></p>
      <p>Anon key: <b>{hasKey ? 'mili ✅' : 'MISSING'}</b></p>
      <p className="mt-4 text-2xl">{msg}</p>
    </div>
  )
}