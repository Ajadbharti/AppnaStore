import { createContext, useContext, useEffect, useState } from 'react'
import { initialOrders, initialProducts } from '../data/mock'

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

export function StoreProvider({ children }) {
  const [products, setProducts] = usePersistent('apnastore_products', initialProducts)
  const [orders, setOrders] = usePersistent('apnastore_orders', initialOrders)
  const [cart, setCart] = usePersistent('apnastore_cart', []) // [{ id, qty }]
  const [wishlist, setWishlist] = usePersistent('apnastore_wishlist', []) // [id, id, ...]

  const cartItems = cart.flatMap((c) => {
    const p = products.find((x) => x.id === c.id)
    return p ? [{ ...p, qty: c.qty }] : []
  })
  const cartCount = cartItems.reduce((n, i) => n + i.qty, 0)
  const cartTotal = cartItems.reduce((n, i) => n + i.qty * i.price, 0)

  // Wishlist: sirf wahi products jo abhi bhi store mein hain
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

  const placeOrder = ({ customer, phone, area, payment }) => {
    if (cartItems.length === 0) return null

    const nums = orders.map((o) => Number(String(o.id).replace('AS-', '')) || 0)
    const id = `AS-${Math.max(1000, ...nums) + 1}`
    const time = new Date()
      .toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
      .toUpperCase()

    const order = {
      id,
      status: 'new',
      when: `Today, ${time}`,
      customer,
      area,
      phone,
      payment,
      items: cartItems
        .map((i) => `${[i.name, i.unit].filter(Boolean).join(' ')} ×${i.qty}`)
        .join(', '),
      amount: cartTotal,
    }

    setOrders((prev) => [order, ...prev])

    // Stock kam karein
    setProducts((prev) =>
      prev.map((p) => {
        const line = cartItems.find((i) => i.id === p.id)
        if (!line) return p
        const stock = Math.max(0, p.stock - line.qty)
        return { ...p, stock, inStock: stock > 0 && p.inStock }
      })
    )

    setCart([])
    return id
  }

  return (
    <StoreContext.Provider
      value={{
        products, setProducts,
        orders, setOrders,
        cart, cartItems, cartCount, cartTotal,
        addToCart, changeQty, removeFromCart, placeOrder,
        wishlist, wishlistItems, toggleWishlist,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  return useContext(StoreContext)
}