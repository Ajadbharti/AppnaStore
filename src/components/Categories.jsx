import { storeCategories } from '../data/categories'

export default function Categories({ selected, onSelect }) {
  return (
    <section id="categories" className="mx-auto max-w-[1400px] scroll-mt-24 px-8 py-16">
      <h2 className="font-display text-5xl font-extrabold tracking-tight">
        Shop by category
      </h2>
      <p className="mt-3 text-lg text-muted">Aapke aas-paas ki har dukaan, ek hi jagah.</p>

      <div className="mt-10 grid grid-cols-3 gap-4 md:grid-cols-5 lg:grid-cols-9">
        {storeCategories.map((c) => (
          <button
            key={c.name}
            onClick={() => onSelect?.(c.name)}
            className={
              'card flex h-[170px] cursor-pointer flex-col items-center justify-start gap-3 px-3 pt-8 text-center transition hover:-translate-y-1 ' +
              (selected === c.name ? '!border-brand ring-2 ring-brand/30' : '')
            }
          >
            <span className="text-5xl leading-none">{c.emoji}</span>
            <span className="text-[17px] font-medium leading-snug">{c.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}