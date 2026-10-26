import { useEffect, useState } from 'react'
import StoreHeader from '../components/StoreHeader'
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import Trending from '../components/Trending'
import HowItWorks from '../components/HowItWorks'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import WishlistDrawer from '../components/WishlistDrawer'
import LocationModal from '../components/LocationModal'
import MyOrdersDrawer from '../components/MyOrdersDrawer'
import AccountDrawer from '../components/AccountDrawer'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../store/AuthContext'
import { matchesCategory } from '../data/categories'

export default function Home() {
  const {
    products, loading, error, cartCount, wishlistItems, location, setLocation,
  } = useStore()
  const { user } = useAuth()

  // Login ke baad wapas aane par cart khula hua
  const [cartOpen, setCartOpen] = useState(
    () => localStorage.getItem('apnastore_open_cart') === '1'
  )
  const [wishOpen, setWishOpen] = useState(false)
  const [locOpen, setLocOpen] = useState(false)
  const [ordersOpen, setOrdersOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(null)

  useEffect(() => {
    localStorage.removeItem('apnastore_open_cart')
  }, [])

  // Header ke account button mein naam ka pehla akshar
  const accountInitial = (user?.user_metadata?.full_name || user?.email || '')
    .trim()
    .charAt(0)
    .toUpperCase()

  const pin = location?.pincode
  const inArea = pin ? products.filter((p) => p.pincode === pin) : products
  const notice =
    pin && inArea.length === 0 && products.length > 0
      ? `Pincode ${pin} par abhi koi dukaan ya product nahi mila.`
      : ''

  const q = search.trim().toLowerCase()
  const visible = inArea
    .filter((p) => matchesCategory(category, p.category))
    .filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shopName.toLowerCase().includes(q)
    )

  const pickCategory = (name) => {
    setCategory((c) => (c === name ? null : name))
    setTimeout(
      () => document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' }),
      50
    )
  }

  return (
    <div>
      <StoreHeader
        onCartClick={() => setCartOpen(true)}
        cartCount={cartCount}
        onWishlistClick={() => setWishOpen(true)}
        wishlistCount={wishlistItems.length}
        onLocationClick={() => setLocOpen(true)}
        onOrdersClick={() => setOrdersOpen(true)}
        onAccountClick={() => setAccountOpen(true)}
        accountInitial={accountInitial}
        location={location}
        search={search}
        onSearch={setSearch}
      />

      {error && (
        <p className="bg-red-50 px-6 py-3 text-center text-red-700">
          Products load nahi ho paye: {error}
        </p>
      )}

      <Hero />
      <Categories selected={category} onSelect={pickCategory} />
      <Trending
        products={visible}
        filterLabel={category}
        onClear={() => setCategory(null)}
        loading={loading}
        notice={notice}
        onShowAll={() => setLocation(null)}
      />
      <HowItWorks />
      <Footer />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onViewOrders={() => setOrdersOpen(true)}
      />
      <WishlistDrawer open={wishOpen} onClose={() => setWishOpen(false)} />
      <MyOrdersDrawer open={ordersOpen} onClose={() => setOrdersOpen(false)} />
      <AccountDrawer
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        onViewOrders={() => setOrdersOpen(true)}
      />
      {locOpen && (
        <LocationModal
          current={pin}
          onSave={(p) => setLocation(p ? { pincode: p } : null)}
          onClose={() => setLocOpen(false)}
        />
      )}
    </div>
  )
}