import { Plus, Minus, Heart } from 'lucide-react'
import { emojiFor } from '../data/categories'
import { useStore } from '../store/StoreContext'

export default function ProductCard({ product }) {
  const { cart, addToCart, changeQty, wishlist, toggleWishlist } = useStore()
  const qty = cart.find((c) => c.id === product.id)?.qty ?? 0
  const available = product.inStock && product.stock > 0
  const wished = wishlist.includes(product.id)

  return (
    <div className="card flex flex-col p-5">
      <div className="relative grid h-32 place-items-center rounded-2xl bg-sand text-6xl">
        {emojiFor(product.category)}

        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={wished ? 'Wishlist se hatayein' : 'Wishlist mein jodein'}
          aria-pressed={wished}
          className="absolute right-3 top-3 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-line bg-white shadow-sm"
        >
          <Heart
            size={20}
            className="text-brand"
            fill={wished ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      <h3 className="mt-4 font-display text-xl font-bold leading-snug">{product.name}</h3>
      <p className="text-muted">
        {product.category}
        {product.unit && ` · ${product.unit}`}
      </p>

      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="font-display text-2xl font-extrabold">₹{product.price}</span>

        {!available ? (
          <span className="text-muted">Out of stock</span>
        ) : qty === 0 ? (
          <button className="btn-primary btn-sm" onClick={() => addToCart(product.id)}>
            <Plus size={18} /> Add
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-full border border-line bg-cream px-2 py-1">
            <button
              onClick={() => changeQty(product.id, -1)}
              aria-label="Kam karein"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border-0 bg-white"
            >
              <Minus size={16} />
            </button>
            <span className="min-w-5 text-center text-lg font-semibold">{qty}</span>
            <button
              onClick={() => changeQty(product.id, 1)}
              aria-label="Badhayein"
              disabled={qty >= product.stock}
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border-0 bg-brand text-white disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}