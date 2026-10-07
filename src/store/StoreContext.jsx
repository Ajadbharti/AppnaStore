import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const StoreContext = createContext(null)

function usePersistent(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignore */
    }
  }, [key, value])

  return [value, setValue]
}

const toProduct = (r) => ({
  id: r.id,
  name: r.name,
  category: r.category,
  unit: r.unit ?? '',
  price: Number(r.price),
  stock: r.stock,
  inStock: r.in_stock,
  shopId: r.shop_id,
  shopName: r.shops?.shop_name ?? '',
  shopArea: r.shops?.area ?? '',
  pincode: r.shops?.pincode ?? '',
})

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [cart, setCart] = usePersistent('apnastore_cart_v2', []) // [{ id, qty }]
  const [wishlist, setWishlist] = usePersistent('apnastore_wishlist_v2', []) // [id, ...]
  const [location, setLocation] = usePersistent('apnastore_location', null) // { pincode }

  // Sirf wahi products jo stock mein hain
  const loadProducts = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('products')
      .select('*, shops(shop_name, area, pincode)')
      .eq('in_stock', true)
      .gt('stock', 0)
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setError('')
      setProducts(data.map(toProduct))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProducts()
    const timer = setInterval(loadProducts, 30000)
    window.addEventListener('focus', loadProducts)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', loadProducts)
    }
  }, [loadProducts])

  const cartItems = cart.flatMap((c) => {
    const p = products.find((x) => x.id === c.id)
    return p ? [{ ...p, qty: c.qty }] : []
  })
  const cartCount = cartItems.reduce((n, i) => n + i.qty, 0)
  const cartTotal = cartItems.reduce((n, i) => n + i.qty * i.price, 0)

  const wishlistItems = wishlist.flatMap((id) => {
    const p = products.find((x) => x.id === id)
    return p ? [p] : []
  })

  const toggleWishlist = (id) =>
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const addToCart = (id) => {
    const p = products.find((x) => x.id === id)
    if (!p || !p.inStock || p.stock <= 0) return
    setCart((prev) => {
      const line = prev.find((c) => c.id === id)
      if (!line) return [...prev, { id, qty: 1 }]
      if (line.qty >= p.stock) return prev
      return prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c))
    })
  }

  const changeQty = (id, delta) => {
    const p = products.find((x) => x.id === id)
    setCart((prev) =>
      prev.flatMap((c) => {
        if (c.id !== id) return [c]
        const qty = Math.min(c.qty + delta, p ? p.stock : c.qty)
        return qty > 0 ? [{ ...c, qty }] : []
      })
    )
  }

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c.id !== id))

  // Alag-alag dukaan ke items ke liye alag order banta hai
  const placeOrder = async ({ customer, phone, area, payment }) => {
    if (cartItems.length === 0) return { error: 'Cart khali hai', codes: [] }

    const groups = {}
    for (const i of cartItems) {
      if (!groups[i.shopId]) groups[i.shopId] = []
      groups[i.shopId].push(i)
    }

    const codes = []
    for (const [shopId, items] of Object.entries(groups)) {
      const { data, error: err } = await supabase.rpc('place_order', {
        p_shop_id: shopId,
        p_customer: customer,
        p_phone: phone,
        p_area: area,
        p_payment: payment,
        p_items: items.map((i) => ({ product_id: i.id, qty: i.qty })),
      })

      if (err) {
        await loadProducts()
        return { error: err.message, codes }
      }

      codes.push(data)
      const ids = items.map((i) => i.id)
      setCart((prev) => prev.filter((c) => !ids.includes(c.id)))
    }

    await loadProducts()
    return { codes }
  }

  return (
    <StoreContext.Provider
      value={{
        products, loading, error, reload: loadProducts,
        cart, cartItems, cartCount, cartTotal,
        addToCart, changeQty, removeFromCart, placeOrder,
        wishlist, wishlistItems, toggleWishlist,
        location, setLocation,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  return useContext(StoreContext)
}