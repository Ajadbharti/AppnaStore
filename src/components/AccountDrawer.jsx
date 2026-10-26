import { useEffect, useState } from 'react'
import { X, ClipboardList, LogOut, ShieldCheck, MapPin, KeyRound } from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import { supabase } from '../lib/supabase'
import { useCustomerProfile } from '../lib/useCustomerProfile'

export default function AccountDrawer({ open, onClose, onViewOrders }) {
  const { session, user, signOut } = useAuth()
  const { profile, save } = useCustomerProfile(open)
  const [form, setForm] = useState({ name: '', phone: '', area: '', address: '' })
  const [msg, setMsg] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [alreadyLinked, setAlreadyLinked] = useState(false)

  useEffect(() => {
    setForm({
      name: profile?.name ?? '',
      phone: profile?.phone ?? '',
      area: profile?.area ?? '',
      address: profile?.address ?? '',
    })
  }, [profile])

  if (!open) return null

  const redirectTo = window.location.origin
  const isGuest = session?.user?.is_anonymous
  const set = (k) => (e) => {
    setSaved(false)
    setForm({ ...form, [k]: e.target.value })
  }

  const googleLogin = async () => {
    setMsg('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) setMsg(error.message)
  }

  // Guest ko Google se jodna (purane orders sath rehte hain)
  const linkGoogle = async () => {
    setMsg('')
    setAlreadyLinked(false)
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo },
    })
    if (!error) return
    if (/already/i.test(error.message)) setAlreadyLinked(true)
    else if (/manual linking/i.test(error.message))
      setMsg('Supabase mein "Allow manual linking" ON karna zaroori hai.')
    else setMsg(error.message)
  }

  const submit = async () => {
    if (!form.name.trim()) return setMsg('Apna naam likhein')
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
      return setMsg('10 digit ka sahi mobile number likhein')

    setSaving(true)
    setMsg('')
    const err = await save(form)
    setSaving(false)

    if (err) setMsg(err)
    else setSaved(true)
  }

  const logout = async () => {
    await signOut()
    onClose()
  }

  const avatar = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name || user?.email

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <aside className="relative flex h-full w-full flex-col overflow-y-auto bg-cream sm:w-[520px]">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-6 top-6 grid h-11 w-11 cursor-pointer place-items-center rounded-full border-2 border-brand/70 bg-transparent text-brand"
        >
          <X size={22} />
        </button>

        <div className="p-8 pb-4">
          <h2 className="font-display text-3xl font-bold">Mera Account</h2>
        </div>

        {/* Login nahi hai */}
        {!user && (
          <div className="px-8 pb-8">
            <div className="card p-6">
              <p className="text-lg text-muted">
                Login karne par aapko ye sab milega:
              </p>
              <ul className="mt-4 list-none space-y-3 p-0 text-[16px]">
                <li className="flex items-start gap-3">
                  <ClipboardList size={20} className="mt-0.5 shrink-0 text-brand" />
                  Kisi bhi phone par apne orders aur status dekhein
                </li>
                <li className="flex items-start gap-3">
                  <KeyRound size={20} className="mt-0.5 shrink-0 text-brand" />
                  Delivery OTP kahin bhi dikhe
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={20} className="mt-0.5 shrink-0 text-brand" />
                  Naam, mobile aur address ek baar save, har order mein apne aap bhara hua
                </li>
              </ul>

              <button
                className="btn-primary mt-6 w-full text-lg"
                onClick={isGuest ? linkGoogle : googleLogin}
              >
                <span className="font-bold">G</span> Google se login karein
              </button>

              {alreadyLinked && (
                <div className="mt-4 rounded-xl bg-sand p-3 text-[14px] text-muted">
                  Ye Google account pehle se juda hai. Seedha login karne par is phone ke
                  purane guest orders us account mein nahi aayenge.
                  <button className="btn-ghost btn-sm mt-3" onClick={googleLogin}>
                    Phir bhi seedha login karein
                  </button>
                </div>
              )}
              {msg && <p className="mt-3 text-[14px] text-red-600">{msg}</p>}

              <p className="mt-4 flex items-center gap-2 text-[14px] text-muted">
                <ShieldCheck size={16} className="text-leaf" />
                Login zaroori nahi hai. Aap bina login ke bhi order kar sakte hain.
              </p>
            </div>
          </div>
        )}

        {/* Login hai */}
        {user && (
          <div className="px-8 pb-8">
            <div className="card flex items-center gap-4 p-5">
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-2xl font-bold text-white">
                  {(displayName || '?').charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-display text-xl font-bold">{displayName}</p>
                <p className="truncate text-[15px] text-muted">{user.email}</p>
              </div>
            </div>

            <div className="card mt-5 grid gap-4 p-6">
              <h3 className="font-display text-xl font-bold">Meri jaankari</h3>
              <input className="input" placeholder="Aapka naam" value={form.name} onChange={set('name')} />
              <input
                className="input" placeholder="Mobile number" inputMode="numeric" maxLength={10}
                value={form.phone}
                onChange={(e) => {
                  setSaved(false)
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })
                }}
              />
              <input
                className="input" placeholder="Delivery area / mohalla"
                value={form.area} onChange={set('area')}
              />
              <textarea
                className="input" placeholder="Poora address (optional)"
                value={form.address} onChange={set('address')}
              />

              {msg && <p className="text-[15px] text-red-600">{msg}</p>}
              {saved && <p className="text-[15px] font-medium text-leaf">✅ Save ho gaya</p>}

              <button
                className="btn-primary text-lg disabled:opacity-60"
                onClick={submit}
                disabled={saving}
              >
                {saving ? 'Save ho raha hai...' : 'Save karein'}
              </button>
            </div>

            <button
              className="btn-ghost mt-5 w-full"
              onClick={() => {
                onClose()
                onViewOrders?.()
              }}
            >
              <ClipboardList size={20} /> Mere Orders dekhein
            </button>

            <button
              onClick={logout}
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 border-0 bg-transparent py-3 text-muted"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}