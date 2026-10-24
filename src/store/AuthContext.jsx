import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Form ke naam -> database ke column
const PUBLIC_MAP = {
  shopName: 'shop_name', area: 'area', city: 'city', pincode: 'pincode',
  radius: 'radius', openTime: 'open_time', closeTime: 'close_time', categories: 'categories',
}
const PRIVATE_MAP = {
  ownerName: 'owner_name', mobile: 'mobile', email: 'email', address: 'address',
  gst: 'gst', fssai: 'fssai', upi: 'upi',
}
const OPTIONAL = ['gst', 'fssai', 'upi']

function fromRows(s, p) {
  return {
    id: s.id,
    shopName: s.shop_name,
    area: s.area,
    city: s.city,
    pincode: s.pincode,
    radius: s.radius,
    openTime: s.open_time,
    closeTime: s.close_time,
    categories: s.categories || [],
    ownerName: p?.owner_name ?? '',
    mobile: p?.mobile ?? '',
    email: p?.email ?? '',
    address: p?.address ?? '',
    gst: p?.gst ?? '',
    fssai: p?.fssai ?? '',
    upi: p?.upi ?? '',
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)

  const shopIdRef = useRef(null)
  const lastUid = useRef(null)
  const pending = useRef({})
  const timer = useRef(null)

  const loadShop = useCallback(async (user) => {
    // Anonymous (captcha wale grahak) ki koi dukaan nahi hoti
    if (!user || user.is_anonymous) {
      shopIdRef.current = null
      setShop(null)
      return null
    }
    const { data: s } = await supabase
      .from('shops').select('*').eq('owner_id', user.id).maybeSingle()
    if (!s) {
      shopIdRef.current = null
      setShop(null)
      return null
    }
    const { data: p } = await supabase
      .from('shop_private').select('*').eq('shop_id', s.id).maybeSingle()
    shopIdRef.current = s.id
    const next = fromRows(s, p)
    setShop(next)
    return next
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      lastUid.current = data.session?.user?.id ?? null
      setSession(data.session)
      await loadShop(data.session?.user)
      if (active) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'INITIAL_SESSION') return
      setSession(s)
      const uid = s?.user?.id ?? null
      if (uid === lastUid.current) return // token refresh waghera par dobara load nahi
      lastUid.current = uid
      setLoading(true)
      setTimeout(async () => {
        await loadShop(s?.user)
        setLoading(false)
      }, 0)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [loadShop])

  // Profile mein badlav: turant screen par, aur thodi der baad database mein
  const flush = async () => {
    const patch = pending.current
    pending.current = {}
    const id = shopIdRef.current
    if (!id) return

    const pub = {}
    const priv = {}
    for (const [k, v] of Object.entries(patch)) {
      if (PUBLIC_MAP[k]) pub[PUBLIC_MAP[k]] = v
      if (PRIVATE_MAP[k]) priv[PRIVATE_MAP[k]] = OPTIONAL.includes(k) && v === '' ? null : v
    }
    if (Object.keys(pub).length) await supabase.from('shops').update(pub).eq('id', id)
    if (Object.keys(priv).length) await supabase.from('shop_private').update(priv).eq('shop_id', id)
  }

  const updateShop = (patch) => {
    setShop((prev) => ({ ...prev, ...patch }))
    Object.assign(pending.current, patch)
    clearTimeout(timer.current)
    timer.current = setTimeout(flush, 700)
  }

  const refreshShop = (user) => loadShop(user ?? session?.user)

  const signOut = async () => {
    await supabase.auth.signOut()
    setShop(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user && !session.user.is_anonymous ? session.user : null,
        shop,
        loading,
        updateShop,
        refreshShop,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}