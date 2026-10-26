import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Pencil, Check, X, ImagePlus } from 'lucide-react'
import { storeCategories } from '../../data/categories'
import { validateImage } from '../../lib/images'
import ProductThumb from '../../components/ProductThumb'

const catNames = storeCategories.map((c) => c.name)
const emptyForm = { name: '', category: 'Kirana', price: '', unit: '', stock: '', imageFile: null }

function CategorySelect({ value, onChange }) {
  // Purane products ki category list mein na ho to bhi dikhe
  const options = value && !catNames.includes(value) ? [value, ...catNames] : catNames
  return (
    <select className="input" value={value} onChange={onChange}>
      {options.map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  )
}

const Label = ({ children }) => (
  <label className="mb-2 block text-[17px] text-muted">{children}</label>
)

// Photo chunne ka box
function ImagePicker({ file, existingUrl, removed, onPick, onRemove }) {
  const [preview, setPreview] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!file) {
      setPreview('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const shown = preview || (removed ? '' : existingUrl)

  return (
    <div className="flex items-center gap-4">
      <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-dashed border-[#D9CFC4] bg-white text-muted">
        {shown ? (
          <img src={shown} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus size={28} />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-ghost btn-sm" onClick={() => inputRef.current?.click()}>
          {shown ? 'Photo badlein' : 'Photo chunein'}
        </button>
        {shown && (
          <button
            type="button"
            onClick={onRemove}
            className="cursor-pointer border-0 bg-transparent text-muted underline"
          >
            Hatayein
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onPick(f)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}

export default function Products({ products, onAdd, onUpdate, onToggle, onRemove }) {
  // Naya product
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [rowError, setRowError] = useState('')
  const [rowSaving, setRowSaving] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const digits = (v) => v.replace(/\D/g, '')

  const add = async () => {
    const price = Number(form.price)
    const stock = Number(form.stock || 0)
    if (!form.name.trim()) return setError('Product ka naam likhein')
    if (!(price > 0)) return setError('Sahi price likhein')

    setSaving(true)
    setError('')
    const err = await onAdd({
      name: form.name.trim(),
      category: form.category,
      unit: form.unit.trim(),
      price,
      stock,
      imageFile: form.imageFile,
    })
    setSaving(false)

    if (err) setError(err)
    else setForm(emptyForm)
  }

  const startEdit = (p) => {
    setEditId(p.id)
    setRowError('')
    setDraft({
      name: p.name,
      category: p.category,
      unit: p.unit,
      price: String(p.price),
      stock: String(p.stock),
      imageFile: null,
      removeImage: false,
    })
  }

  const cancelEdit = () => {
    setEditId(null)
    setDraft(null)
    setRowError('')
  }

  const saveEdit = async (p) => {
    const price = Number(draft.price)
    const stock = Number(draft.stock || 0)
    if (!draft.name.trim()) return setRowError('Product ka naam likhein')
    if (!(price > 0)) return setRowError('Sahi price likhein')

    // Stock 0 ho to band; 0 se badhe to apne aap chalu; warna jaisa tha waisa
    const inStock = stock === 0 ? false : p.stock === 0 ? true : p.inStock

    setRowSaving(true)
    setRowError('')
    const err = await onUpdate(p.id, {
      name: draft.name.trim(),
      category: draft.category,
      unit: draft.unit.trim(),
      price,
      stock,
      inStock,
      imagePath: p.imagePath,
      imageFile: draft.imageFile,
      removeImage: draft.removeImage,
    })
    setRowSaving(false)

    if (err) setRowError(err)
    else cancelEdit()
  }

  const cols = 'grid-cols-[2fr_1fr_1fr_1fr_110px]'

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
            <CategorySelect value={form.category} onChange={set('category')} />
          </div>
          <div>
            <Label>Price (₹)</Label>
            <input className="input" placeholder="120" inputMode="numeric" value={form.price}
              onChange={(e) => setForm({ ...form, price: digits(e.target.value) })} />
          </div>
          <div>
            <Label>Unit</Label>
            <input className="input" placeholder="1 kg" value={form.unit} onChange={set('unit')} />
          </div>
          <div>
            <Label>Stock</Label>
            <input className="input" placeholder="20" inputMode="numeric" value={form.stock}
              onChange={(e) => setForm({ ...form, stock: digits(e.target.value) })} />
          </div>
          <div>
            <Label>Photo (optional)</Label>
            <ImagePicker
              file={form.imageFile}
              existingUrl=""
              onPick={(f) => {
                const problem = validateImage(f)
                if (problem) return setError(problem)
                setError('')
                setForm({ ...form, imageFile: f })
              }}
              onRemove={() => setForm({ ...form, imageFile: null })}
            />
          </div>
        </div>

        {error && <p className="mt-4 text-[15px] text-red-600">{error}</p>}

        <button
          className="btn-primary mt-7 text-lg disabled:opacity-60"
          onClick={add}
          disabled={saving}
        >
          <Plus size={20} /> {saving ? 'Save ho raha hai...' : 'Product jodein'}
        </button>
      </div>

      {/* Table */}
      <div className="card mt-8 overflow-hidden">
        <div className={`grid ${cols} items-center bg-sand/60 px-8 py-5 text-[15px] font-bold tracking-wide text-muted`}>
          <span>PRODUCT</span>
          <span>PRICE</span>
          <span>STOCK</span>
          <span>IN STOCK</span>
          <span />
        </div>

        {products.length === 0 && (
          <p className="px-8 py-10 text-center text-lg text-muted">Abhi koi product nahi hai.</p>
        )}

        {products.map((p) =>
          editId === p.id ? (
            <div key={p.id} className="border-t border-line bg-cream px-8 py-6">
              <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
                <div>
                  <Label>Naam</Label>
                  <input className="input" value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <CategorySelect value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                </div>
                <div>
                  <Label>Price (₹)</Label>
                  <input className="input" inputMode="numeric" value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: digits(e.target.value) })} />
                </div>
                <div>
                  <Label>Unit</Label>
                  <input className="input" value={draft.unit}
                    onChange={(e) => setDraft({ ...draft, unit: e.target.value })} />
                </div>
                <div>
                  <Label>Stock</Label>
                  <input className="input" inputMode="numeric" value={draft.stock}
                    onChange={(e) => setDraft({ ...draft, stock: digits(e.target.value) })} />
                </div>
                <div>
                  <Label>Photo</Label>
                  <ImagePicker
                    file={draft.imageFile}
                    existingUrl={p.imageUrl}
                    removed={draft.removeImage}
                    onPick={(f) => {
                      const problem = validateImage(f)
                      if (problem) return setRowError(problem)
                      setRowError('')
                      setDraft({ ...draft, imageFile: f, removeImage: false })
                    }}
                    onRemove={() =>
                      draft.imageFile
                        ? setDraft({ ...draft, imageFile: null })
                        : setDraft({ ...draft, removeImage: true })
                    }
                  />
                </div>
              </div>

              {rowError && <p className="mt-4 text-[15px] text-red-600">{rowError}</p>}

              <div className="mt-5 flex gap-3">
                <button
                  className="btn-primary btn-sm disabled:opacity-60"
                  onClick={() => saveEdit(p)}
                  disabled={rowSaving}
                >
                  <Check size={18} /> {rowSaving ? 'Save ho raha hai...' : 'Save karein'}
                </button>
                <button className="btn-ghost btn-sm" onClick={cancelEdit} disabled={rowSaving}>
                  <X size={18} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              key={p.id}
              className={`grid ${cols} items-center border-t border-line px-8 py-5`}
            >
              <div className="flex items-center gap-4">
                <ProductThumb product={p} className="h-14 w-14 text-3xl" />
                <div className="min-w-0">
                  <p className="font-display text-xl font-bold">{p.name}</p>
                  <p className="text-muted">
                    {p.category}
                    {p.unit && ` · ${p.unit}`}
                  </p>
                </div>
              </div>
              <span className="font-display text-xl font-bold">₹{p.price}</span>
              <span className={'text-xl ' + (p.stock <= 5 ? 'font-bold text-brand' : '')}>
                {p.stock}
                {p.stock > 0 && p.stock <= 5 && (
                  <span className="ml-2 text-[13px] font-medium">kam stock</span>
                )}
              </span>
              <button
                role="switch"
                aria-checked={p.inStock}
                onClick={() => onToggle(p.id, !p.inStock)}
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
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => startEdit(p)}
                  aria-label="Edit"
                  className="cursor-pointer border-0 bg-transparent text-muted"
                >
                  <Pencil size={21} />
                </button>
                <button
                  onClick={() => onRemove(p.id)}
                  aria-label="Delete"
                  className="cursor-pointer border-0 bg-transparent text-muted"
                >
                  <Trash2 size={22} />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}