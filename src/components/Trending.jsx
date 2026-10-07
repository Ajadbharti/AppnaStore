import { Package } from 'lucide-react'
import ProductCard from './ProductCard'

export default function Trending({ products, filterLabel, onClear, loading, notice, onShowAll }) {
  return (
    <section id="trending" className="mx-auto max-w-[1400px] scroll-mt-24 px-8 pb-20 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-5xl font-extrabold tracking-tight">
            {filterLabel || 'Trending nearby'}
          </h2>
          <p className="mt-3 text-lg text-muted">Aaj sabse zyada order kiye gaye products</p>
        </div>
        {filterLabel && (
          <button className="btn-ghost btn-sm" onClick={onClear}>
            Sab dikhayein
          </button>
        )}
      </div>

      {loading && products.length === 0 ? (
        <p className="mt-10 text-xl text-muted">Products load ho rahe hain...</p>
      ) : products.length > 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-[2rem] border border-dashed border-[#E3D7C8] px-6 py-20 text-center">
          <span className="grid h-28 w-28 place-items-center rounded-3xl bg-sand">
            <Package size={48} className="text-brand" strokeWidth={1.5} />
          </span>
          <h3 className="mt-8 font-display text-4xl font-bold">No products found</h3>
          <p className="mt-4 max-w-xl text-xl leading-relaxed text-muted">
            Aapke store mein abhi koi product nahi hai. Mujhe chat mein bataiye —
            product ka naam aur price — main turant add kar dunga.
          </p>
          {notice && (
            <>
              <p className="mt-6 text-lg font-medium text-ink">{notice}</p>
              <button className="btn-primary mt-5" onClick={onShowAll}>
                Sab dukaanein dikhayein
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}