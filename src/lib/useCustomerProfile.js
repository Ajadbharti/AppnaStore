import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from '../store/AuthContext'

// refreshKey badalne par (jaise drawer kholne par) profile dobara aati hai
export function useCustomerProfile(refreshKey) {
  const { user } = useAuth()
  const uid = user?.id
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let active = true
    if (!uid) {
      setProfile(null)
      return
    }
    supabase
      .from('customer_profiles')
      .select('*')
      .eq('user_id', uid)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile(data)
      })
    return () => {
      active = false
    }
  }, [uid, refreshKey])

  const save = useCallback(
    async (p) => {
      if (!uid) return 'Pehle login karein'
      const row = {
        user_id: uid,
        name: p.name?.trim() || null,
        phone: p.phone || null,
        area: p.area?.trim() || null,
        address: p.address?.trim() || null,
        updated_at: new Date().toISOString(),
      }
      const { data, error } = await supabase
        .from('customer_profiles')
        .upsert(row, { onConflict: 'user_id' })
        .select()
        .single()
      if (error) return error.message
      setProfile(data)
      return ''
    },
    [uid]
  )

  return { profile, save }
}