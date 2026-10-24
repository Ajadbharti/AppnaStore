import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useAuth } from '../store/AuthContext'

export function useMyOrders(active) {
  const { session } = useAuth()
  const uid = session?.user?.id
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!uid) {
      setOrders([])
      return
    }
    setLoading(true)

    const { data: rows } = await supabase
      .from('orders')
      .select('id, code, status, items, amount, created_at, shops(shop_name)')
      .eq('customer_uid', uid)
      .order('created_at', { ascending: false })
      .limit(20)

    // OTP sirf accepted orders ka milta hai
    const acceptedIds = (rows || []).filter((o) => o.status === 'accepted').map((o) => o.id)
    const otps = {}
    if (acceptedIds.length) {
      const { data: otpRows } = await supabase
        .from('order_otps')
        .select('order_id, otp')
        .in('order_id', acceptedIds)
      for (const r of otpRows || []) otps[r.order_id] = r.otp
    }

    setOrders(
      (rows || []).map((o) => ({
        id: o.id,
        code: o.code,
        status: o.status,
        items: o.items,
        amount: Number(o.amount),
        createdAt: o.created_at,
        shopName: o.shops?.shop_name ?? '',
        otp: otps[o.id] ?? null,
      }))
    )
    setLoading(false)
  }, [uid])

  // Drawer khula ho to har 10 second mein naya status
  useEffect(() => {
    if (!active) return
    load()
    const timer = setInterval(load, 10000)
    return () => clearInterval(timer)
  }, [active, load])

  return { orders, loading }
}