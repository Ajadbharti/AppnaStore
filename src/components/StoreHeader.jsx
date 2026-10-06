import { MapPin, Search, ShoppingBag, Heart } from 'lucide-react'
import Logo from './Logo'

function Badge({ n }) {
  if (!n) return null
  return (
    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[12px] font-bold text-white">
      {n}
    </span>
  )
}

export default function StoreHeader({
  onCartClick,
  cartCount = 0,
  onWishlistClick,
  wishlistCount = 0,
  search = '',
  onSearch,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-6 py-3">
        <Logo />

        <button className="hidden items-center gap-2 text-[15px] md:flex">
          <MapPin size={18} className="text-brand" />
          <span className="text-muted">Deliver to:</span>
          <span className="font-medium">Set location</span>
        </button>

        <div className="flex h-11 flex-1 items-center gap-3 rounded-full bg-sand px-5">
          <Search size={18} className="text-muted" />
          <input
            value={search}
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder="Search atta, doodh, fruits…"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
          />
        </div>

        <button
          onClick={onWishlistClick}
          className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-line bg-white"
          aria-label="Wishlist"
        >
          <Heart size={20} />
          <Badge n={wishlistCount} />
        </button>

        <button
          onClick={onCartClick}
          className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-line bg-white"
          aria-label="Cart"
        >
          <ShoppingBag size={20} />
          <Badge n={cartCount} />
        </button>
      </div>
    </header>
  )
}