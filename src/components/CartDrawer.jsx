import { useState } from 'react'
import { X, ShoppingBag, Plus, Minus, Trash2, CheckCircle2 } from 'lucide-react'
import { emojiFor } from '../data/categories'
import { useStore } from '../store/StoreContext'

export default function CartDrawer({ open, onClose }) {
  const { cartItems, cartTotal, changeQty, removeFromCart, placeOrder } = useStore()
  const [form, setForm] = useState({ customer: '', phone: '', area: '', payment: 'COD' })
  const [error, setError] = useState('')
  const [placed, setPlaced] = useState(null)

  if (!open) return null

  const close = () => {
    setPlaced(null)
    setError('')
    onClose()
  }

  const submit = () => {
    if (!form.customer.trim()) return setError('Apna naam likhein')
    if (!/^[6-9]\d{9}$/.test(form.phone)) return setError('10 digit ka sahi mobile number likhein')
    if (!form.area.trim()) return setError('Delivery area likhein')
    setError('')
    const id = placeOrder({
      ...form,
      customer: form.customer.trim(),
      area: form.area.trim(),
    })
    setPlaced(id)
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={close} />

      <aside className="relative flex h-full w-full flex-col bg-cream sm:w-[560px]">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-6 top-6 grid h-11 w-11 cursor-pointer place-items-center rounded-full border-2 border-brand/70 bg-transparent text-brand"
        >
          <X size={22} />
        </button>

        <div className="p-8 pb-4">
          <h2 className="font-display text-3xl font-bold">Aapka Jhola</h2>
          <p className="mt-2 text-lg text-muted">
            {cartItems.length === 0 ? 'Cart abhi khali hai' : `${cartItems.length} cheezein`}
          </p>
        </div>

        {/* Order ho gaya */}
        {placed && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <CheckCircle2 size={72} className="text-leaf" strokeWidth={1.5} />
            <p className="font-display text-3xl font-bold">Order ho gaya!</p>
            <p className="text-xl text-muted">Order number {placed}. Dukandar jaldi accept karenge.</p>
            <button className="btn-primary mt-4" onClick={close}>Shopping jaari rakhein</button>
          </div>
        )}

        {/* Khali cart */}
        {!placed && cartItems.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-muted">
            <ShoppingBag size={72} strokeWidth={1.5} />
            <p className="text-2xl">Aapka cart khali hai</p>
          </div>
        )}

        {/* Items + form */}
        {!placed && cartItems.length > 0 && (
          <>
            <div className="flex-1 overflow-y-auto px-8">
              <div className="flex flex-col gap-3">
                {cartItems.map((i) => (
                  <div key={i.id} className="card flex items-center gap-4 p-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sand text-3xl">
                      {emojiFor(i.category)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg font-bold">{i.name}</p>
                      <p className="text-muted">{i.unit} · ₹{i.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQty(i.id, -1)}
                        aria-label="Kam karein"
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-line bg-white"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-5 text-center font-semibold">{i.qty}</span>
                      <button
                        onClick={() => changeQty(i.id, 1)}
                        aria-label="Badhayein"
                        disabled={i.qty >= i.stock}
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-brand text-white disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(i.id)}
                        aria-label="Hatayein"
                        className="ml-1 cursor-pointer border-0 bg-transparent text-muted"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 pb-6">
                <input className="input" placeholder="Aapka naam" value={form.customer} onChange={set('customer')} />
                <input
                  className="input" placeholder="Mobile number" inputMode="numeric" maxLength={10}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                />
                <input className="input" placeholder="Delivery area / mohalla" value={form.area} onChange={set('area')} />

                <div className="flex gap-3">
                  {['COD', 'UPI'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm({ ...form, payment: m })}
                      className={
                        'flex-1 cursor-pointer rounded-full border px-5 py-3 text-[17px] font-medium ' +
                        (form.payment === m
                          ? 'border-leaf bg-leaf text-white'
                          : 'border-line bg-white text-ink')
                      }
                    >
                      {m === 'COD' ? 'Cash on Delivery' : 'UPI'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-line bg-white p-8">
              {error && <p className="mb-3 text-[15px] text-red-600">{error}</p>}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg text-muted">Total</span>
                <span className="font-display text-3xl font-extrabold">₹{cartTotal}</span>
              </div>
              <button className="btn-primary w-full text-lg" onClick={submit}>
                Order place karein
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}