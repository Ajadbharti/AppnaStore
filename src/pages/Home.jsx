import { useState } from 'react'
import StoreHeader from '../components/StoreHeader'
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import Trending from '../components/Trending'
import HowItWorks from '../components/HowItWorks'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import WishlistDrawer from '../components/WishlistDrawer'
import { useStore } from '../store/StoreContext'
import { matchesCategory } from '../data/categories'

export default function Home() {
  const { products, cartCount, wishlistItems } = useStore()
  const [cartOpen, setCartOpen] = useState(false)
  const [wishOpen, setWishOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(null)

  const q = search.trim().toLowerCase()
  const visible = products
    .filter((p) => p.inStock && p.stock > 0)
    .filter((p) => matchesCategory(category, p.category))
    .filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
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
        search={search}
        onSearch={setSearch}
      />
      <Hero />
      <Categories selected={category} onSelect={pickCategory} />
      <Trending
        products={visible}
        filterLabel={category}
        onClear={() => setCategory(null)}
      />
      <HowItWorks />
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <WishlistDrawer open={wishOpen} onClose={() => setWishOpen(false)} />
    </div>
  )
}