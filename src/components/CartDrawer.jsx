import { useEffect, useState } from 'react'
import { X, ShoppingBag, Plus, Minus, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { useAuth } from '../store/AuthContext'
import { useCustomerProfile } from '../lib/useCustomerProfile'
import { supabase } from '../lib/supabase'
import ProductThumb from './ProductThumb'

export default function CartDrawer({ open, onClose, onViewOrders }) {
  const {
    cartItems, cartTotal, changeQty, removeFromCart, placeOrder, cartNotice, clearCartNotice,
  } = useStore()
  const { user } = useAuth() // sirf asli (Google/email) login, guest nahi
  const { profile, save: saveProfile } = useCustomerProfile(open)

  const [form, setForm] = useState({ customer: '', phone: '', area: '', payment: 'COD' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [placed, setPlaced] = useState(null) // order codes ki list

  // Login hai aur profile bhari hai to form pehle se bhar dein
  useEffect(() => {
    if (!profile) return
    setForm((f) => ({
      ...f,
      customer: f.customer || profile.name || '',
      phone: f.phone || profile.phone || '',
      area: f.area || profile.area || '',
    }))
  }, [profile])

  if (!open) return null

  const close = () => {
    setPlaced(null)
    setError('')
    onClose()
  }

  // Google se login. Wapas aane par cart apne aap khul jayega
  const login = async () => {
    setError('')
    localStorage.setItem('apnastore_open_cart', '1')
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (err) {
      localStorage.removeItem('apnastore_open_cart')
      setError(err.message)
    }
  }

  const submit = async () => {
    if (!user) return login()
    if (!form.customer.trim()) return setError('Apna naam likhein')
    if (!/^[6-9]\d{9}$/.test(form.phone)) return setError('10 digit ka sahi mobile number likhein')
    if (!form.area.trim()) return setError('Delivery area likhein')

    setError('')
    setBusy(true)
    const res = await placeOrder({
      ...form,
      customer: form.customer.trim(),
      area: form.area.trim(),
    })
    setBusy(false)

    if (res.error) {
      setError(
        res.error +
          (res.codes.length ? ` (Ye order ho chuke hain: ${res.codes.join(', ')})` : '')
      )
      return
    }
    setPlaced(res.codes)

    // Profile khali hai to pehle order ki jaankari save kar lein
    if (!profile?.phone) {
      saveProfile({
        name: form.customer.trim(),
        phone: form.phone,
        area: form.area.trim(),
        address: profile?.address || '',
      })
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const shopCount = new Set(cartItems.map((i) => i.shopId)).size

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
            <p className="text-xl text-muted">
              Order number: {placed.join(', ')}. Dukandar accept karenge to Mere Orders mein
              status aur delivery OTP dikhega.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {onViewOrders && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    close()
                    onViewOrders()
                  }}
                >
                  Mere Orders dekhein
                </button>
              )}
              <button className="btn-ghost" onClick={close}>Shopping jaari rakhein</button>
            </div>
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
                    <ProductThumb product={i} className="h-14 w-14 text-3xl" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg font-bold">{i.name}</p>
                      <p className="text-muted">{i.unit && `${i.unit} · `}₹{i.price}</p>
                      <p className="truncate text-[14px] text-leaf">🏪 {i.shopName}</p>
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

              {shopCount > 1 && (
                <p className="mt-4 rounded-2xl bg-sand px-4 py-3 text-[15px] text-muted">
                  Aapke cart mein {shopCount} dukaanon ke items hain. Har dukaan ka alag order banega.
                </p>
              )}

              {cartNotice && (
                <p className="mt-4 flex items-start justify-between gap-3 rounded-2xl bg-[#FCEFD6] px-4 py-3 text-[15px] text-[#8A5A12]">
                  <span>{cartNotice}</span>
                  <button
                    onClick={clearCartNotice}
                    className="shrink-0 cursor-pointer border-0 bg-transparent text-[#8A5A12] underline"
                  >
                    Theek hai
                  </button>
                </p>
              )}

              {/* Login nahi hai: form ki jagah login card */}
              {!user && (
                <div className="card mb-6 mt-6 p-6 text-center">
                  <ShieldCheck size={40} className="mx-auto text-leaf" strokeWidth={1.6} />
                  <h3 className="mt-3 font-display text-xl font-bold">
                    Order karne ke liye login karein
                  </h3>
                  <p className="mt-2 text-[15px] text-muted">
                    Google se ek click mein aapka account ban jayega. Aapka cart safe rahega,
                    login ke baad wapas yahin aayenge.
                  </p>
                  <button className="btn-primary mt-5 w-full text-lg" onClick={login}>
                    <span className="font-bold">G</span> Google se login karein
                  </button>
                </div>
              )}

              {/* Login hai: delivery ka form */}
              {user && (
                <div className="mt-6 grid gap-3 pb-6">
                  <p className="text-[14px] text-muted">✅ {user.email} se login hain</p>
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
              )}
            </div>

            <div className="border-t border-line bg-white p-8">
              {error && <p className="mb-3 text-[15px] text-red-600">{error}</p>}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg text-muted">Total</span>
                <span className="font-display text-3xl font-extrabold">₹{cartTotal}</span>
              </div>
              <button
                className="btn-primary w-full text-lg disabled:opacity-60"
                onClick={submit}
                disabled={busy}
              >
                {!user
                  ? 'Login karke order karein'
                  : busy
                  ? 'Order ho raha hai...'
                  : 'Order place karein'}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}