import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

const empty = { name: '', category: '', price: '', unit: '', stock: '' }

export default function Products({ products, setProducts }) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const add = () => {
    const price = Number(form.price)
    const stock = Number(form.stock || 0)
    if (!form.name.trim()) return setError('Product ka naam likhein')
    if (!(price > 0)) return setError('Sahi price likhein')
    if (stock < 0 || Number.isNaN(stock)) return setError('Sahi stock likhein')

    setError('')
    setProducts([
      {
        id: Date.now(),
        name: form.name.trim(),
        category: form.category.trim() || 'Kirana',
        unit: form.unit.trim(),
        price,
        stock,
        inStock: stock > 0,
      },
      ...products,
    ])
    setForm(empty)
  }

  const toggle = (id) =>
    setProducts(products.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p)))

  const remove = (id) => setProducts(products.filter((p) => p.id !== id))

  const Label = ({ children }) => (
    <label className="mb-2 block text-[17px] text-muted">{children}</label>
  )

  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Products</h1>

      {/* Naya product form */}
      <div className="card mt-8 p-10">
        <h2 className="font-display text-2xl font-bold">Naya product jodein</h2>

        <div className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
          <div>
            <Label>Naam</Label>
            <input className="input" placeholder="Basmati Rice" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <Label>Category</Label>
            <input className="input" placeholder="Kirana" value={form.category} onChange={set('category')} />
          </div>
          <div>
            <Label>Price (₹)</Label>
            <input className="input" placeholder="120" inputMode="numeric" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, '') })} />
          </div>
          <div>
            <Label>Unit</Label>
            <input className="input" placeholder="1 kg" value={form.unit} onChange={set('unit')} />
          </div>
          <div>
            <Label>Stock</Label>
            <input className="input" placeholder="20" inputMode="numeric" value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value.replace(/\D/g, '') })} />
          </div>
        </div>

        {error && <p className="mt-4 text-[15px] text-red-600">{error}</p>}

        <button className="btn-primary mt-7 !rounded-full text-lg" onClick={add}>
          <Plus size={20} /> Product jodein
        </button>
      </div>

      {/* Table */}
      <div className="card mt-8 overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_48px] items-center bg-sand/60 px-8 py-5 text-[15px] font-bold tracking-wide text-muted">
          <span>PRODUCT</span>
          <span>PRICE</span>
          <span>STOCK</span>
          <span>IN STOCK</span>
          <span />
        </div>

        {products.length === 0 && (
          <p className="px-8 py-10 text-center text-lg text-muted">Abhi koi product nahi hai.</p>
        )}

        {products.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_48px] items-center border-t border-line px-8 py-5"
          >
            <div>
              <p className="font-display text-xl font-bold">{p.name}</p>
              <p className="text-muted">
                {p.category}
                {p.unit && ` · ${p.unit}`}
              </p>
            </div>
            <span className="font-display text-xl font-bold">₹{p.price}</span>
            <span className="text-xl">{p.stock}</span>
            <button
              role="switch"
              aria-checked={p.inStock}
              onClick={() => toggle(p.id)}
              className={
                'relative h-8 w-14 cursor-pointer rounded-full border-0 transition ' +
                (p.inStock ? 'bg-brand' : 'bg-[#D9CFC4]')
              }
            >
              <span
                className={
                  'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ' +
                  (p.inStock ? 'left-7' : 'left-1')
                }
              />
            </button>
            <button
              onClick={() => remove(p.id)}
              aria-label="Delete"
              className="cursor-pointer border-0 bg-transparent text-muted"
            >
              <Trash2 size={22} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}