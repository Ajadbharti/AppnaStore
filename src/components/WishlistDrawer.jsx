import { X, Heart, ShoppingBag, Check } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import ProductThumb from './ProductThumb'

export default function WishlistDrawer({ open, onClose }) {
  const { wishlistItems, toggleWishlist, cart, addToCart } = useStore()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <aside className="relative flex h-full w-full flex-col bg-cream sm:w-[520px]">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-6 top-6 grid h-11 w-11 cursor-pointer place-items-center rounded-full border-2 border-brand/70 bg-transparent text-brand"
        >
          <X size={22} />
        </button>

        <div className="p-8 pb-4">
          <h2 className="font-display text-3xl font-bold">Meri Pasand</h2>
          <p className="mt-2 text-lg text-muted">
            {wishlistItems.length === 0
              ? 'Abhi kuch save nahi hai'
              : `${wishlistItems.length} products save hain`}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center text-muted">
            <Heart size={72} strokeWidth={1.5} />
            <p className="text-2xl">Aapki wishlist khali hai</p>
            <p className="text-lg">Pasand ke products par dil wala button dabayein.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            <div className="flex flex-col gap-3">
              {wishlistItems.map((p) => {
                const available = p.inStock && p.stock > 0
                const inCart = cart.some((c) => c.id === p.id)

                return (
                  <div key={p.id} className="card flex items-center gap-4 p-4">
                    <ProductThumb product={p} className="h-14 w-14 text-3xl" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg font-bold">{p.name}</p>
                      <p className="text-muted">
                        {p.unit && `${p.unit} · `}₹{p.price}
                      </p>
                      {p.shopName && (
                        <p className="truncate text-[14px] text-leaf">🏪 {p.shopName}</p>
                      )}
                    </div>

                    {!available ? (
                      <span className="text-muted">Out of stock</span>
                    ) : inCart ? (
                      <span className="flex items-center gap-1.5 font-medium text-leaf">
                        <Check size={18} /> Cart mein
                      </span>
                    ) : (
                      <button className="btn-primary btn-sm" onClick={() => addToCart(p.id)}>
                        <ShoppingBag size={16} /> Add
                      </button>
                    )}

                    <button
                      onClick={() => toggleWishlist(p.id)}
                      aria-label="Wishlist se hatayein"
                      className="cursor-pointer border-0 bg-transparent text-brand"
                    >
                      <Heart size={22} fill="currentColor" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}