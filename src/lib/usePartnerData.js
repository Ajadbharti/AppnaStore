import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

const toProduct = (r) => ({
  id: r.id,
  name: r.name,
  category: r.category,
  unit: r.unit ?? '',
  price: Number(r.price),
  stock: r.stock,
  inStock: r.in_stock,
})

function formatWhen(iso) {
  const d = new Date(iso)
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)
  const time = d
    .toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
    .toUpperCase()

  if (d.toDateString() === now.toDateString()) return `Today, ${time}`
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${time}`
}

const toOrder = (r) => ({
  id: r.code ?? `AS-${1000 + r.id}`,
  dbId: r.id,
  status: r.status,
  when: formatWhen(r.created_at),
  createdAt: r.created_at,
  customer: r.customer_name,
  area: r.area,
  phone: r.phone,
  items: r.items,
  amount: Number(r.amount),
  payment: r.payment,
})

export function usePartnerData(shopId) {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!shopId) return
    const [p, o] = await Promise.all([
      supabase
        .from('products').select('*').eq('shop_id', shopId)
        .order('created_at', { ascending: false }),
      supabase
        .from('orders').select('*').eq('shop_id', shopId)
        .order('created_at', { ascending: false }),
    ])
    const err = p.error || o.error
    if (err) {
      setError(err.message)
    } else {
      setError('')
      setProducts(p.data.map(toProduct))
      setOrders(o.data.map(toOrder))
    }
    setLoading(false)
  }, [shopId])

  // Shuru mein, har 15 second mein, aur tab par wapas aane par naya data
  useEffect(() => {
    load()
    const timer = setInterval(load, 15000)
    window.addEventListener('focus', load)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', load)
    }
  }, [load])

  // Naya order aate hi turant refresh (Supabase Realtime)
  useEffect(() => {
    if (!shopId) return
    const channel = supabase
      .channel('orders-' + shopId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `shop_id=eq.${shopId}` },
        () => load()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [shopId, load])

  const addProduct = async (p) => {
    const { error: err } = await supabase.from('products').insert({
      shop_id: shopId,
      name: p.name,
      category: p.category,
      unit: p.unit || null,
      price: p.price,
      stock: p.stock,
      in_stock: p.stock > 0,
    })
    if (err) return err.message
    await load()
    return ''
  }

  const updateProduct = async (id, p) => {
    const { error: err } = await supabase
      .from('products')
      .update({
        name: p.name,
        category: p.category,
        unit: p.unit || null,
        price: p.price,
        stock: p.stock,
        in_stock: p.inStock,
      })
      .eq('id', id)
    if (err) return err.message
    await load()
    return ''
  }

  const toggleProduct = async (id, inStock) => {
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, inStock } : x)))
    const { error: err } = await supabase
      .from('products').update({ in_stock: inStock }).eq('id', id)
    if (err) await load()
  }

  const removeProduct = async (id) => {
    setProducts((prev) => prev.filter((x) => x.id !== id))
    const { error: err } = await supabase.from('products').delete().eq('id', id)
    if (err) await load()
  }

  const setOrderStatus = async (code, status) => {
    const order = orders.find((x) => x.id === code)
    if (!order) return
    setOrders((prev) => prev.map((x) => (x.id === code ? { ...x, status } : x)))
    const { error: err } = await supabase
      .from('orders').update({ status }).eq('id', order.dbId)
    if (err) await load()
  }

    // Delivery: grahak ke OTP se
  const confirmDelivery = async (code, otp) => {
    const { data, error: err } = await supabase.rpc('confirm_delivery', {
      p_code: code,
      p_otp: otp,
    })
    if (err) return err.message
    if (data === 'ok') {
      await load()
      return ''
    }
    if (data === 'locked') {
      return 'Bahut zyada galat OTP daale gaye. Ye order ab lock ho gaya hai.'
    }
    if (typeof data === 'string' && data.startsWith('wrong')) {
      const left = data.split(':')[1]
      return `OTP galat hai. ${left} koshish bachi hain.`
    }
    return 'Kuch galat ho gaya. Dobara koshish karein.'
  }

  return {
    products, orders, loading, error,
    addProduct, updateProduct, toggleProduct, removeProduct, setOrderStatus,
    confirmDelivery,
  }
}