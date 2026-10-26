import { emojiFor } from '../data/categories'

export default function ProductThumb({ product, className = 'h-14 w-14 text-3xl' }) {
  return (
    <span
      className={
        'grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-sand ' + className
      }
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        emojiFor(product.category)
      )}
    </span>
  )
}