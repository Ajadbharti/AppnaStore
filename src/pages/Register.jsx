import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Sparkles, MapPin, Landmark } from 'lucide-react'
import Logo from '../components/Logo'
import Stepper from '../components/Stepper'
import Field from '../components/Field'
import Captcha from '../components/Captcha'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/AuthContext'

const CATEGORIES = [
  'Kirana', 'Dairy', 'Fresh Vegetables', 'Fruits',
  'Bakery', 'Household', 'Personal Care', 'Medical',
]

const initial = {
  shopName: '', ownerName: '', mobile: '', email: '', password: '',
  address: '', area: '', city: '', pincode: '',
  radius: 3, openTime: '08:00', closeTime: '22:00', categories: [],
  gst: '', fssai: '', upi: '',
  account: '', ifsc: '',
}

function validate(step, d, consent) {
  const e = {}
  if (step === 0) {
    if (!d.shopName.trim()) e.shopName = 'Dukaan ka naam likhein'
    if (!d.ownerName.trim()) e.ownerName = 'Maalik ka naam likhein'
    if (!/^[6-9]\d{9}$/.test(d.mobile)) e.mobile = '10 digit ka sahi mobile number likhein'
    if (!/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Sahi email likhein'
    if (d.password.length < 6) e.password = 'Password kam se kam 6 akshar ka rakhein'
  }
  if (step === 1) {
    if (!d.address.trim()) e.address = 'Dukaan ka address likhein'
    if (!d.area.trim()) e.area = 'Area ya mohalla likhein'
    if (!d.city.trim()) e.city = 'City likhein'
    if (!/^\d{6}$/.test(d.pincode)) e.pincode = '6 digit ka sahi pincode likhein'
    if (d.categories.length === 0) e.categories = 'Kam se kam ek category chuniye'
  }
  if (step === 2) {
    if (d.gst && !/^[0-9A-Z]{15}$/i.test(d.gst)) e.gst = 'GST number 15 characters ka hota hai'
    if (d.fssai && !/^\d{14}$/.test(d.fssai)) e.fssai = 'FSSAI number 14 digit ka hota hai'
    if (d.upi && !d.upi.includes('@')) e.upi = 'UPI ID mein @ hona chahiye'
  }
  if (step === 3) {
    if (!/^\d{9,18}$/.test(d.account)) e.account = 'Sahi bank account number likhein (9-18 digit)'
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(d.ifsc)) e.ifsc = 'Sahi IFSC code likhein (jaise HDFC0001234)'
    if (!consent) e.consent = 'Aage badhne ke liye sahmati zaroori hai'
  }
  return e
}

export default function Register() {
  const navigate = useNavigate()
  const { refreshShop } = useAuth()
  const [step, setStep] = useState(0)
  const [data, setData] = useState(initial)
  const [errors, setErrors] = useState({})
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [captcha, setCaptcha] = useState(null)
  const [captchaKey, setCaptchaKey] = useState(0)

  const set = (k) => (e) => setData({ ...data, [k]: e.target.value })
  const setDigits = (k) => (e) =>
    setData({ ...data, [k]: e.target.value.replace(/\D/g, '') })

  const toggleCategory = (c) =>
    setData({
      ...data,
      categories: data.categories.includes(c)
        ? data.categories.filter((x) => x !== c)
        : [...data.categories, c],
    })

  const submit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      // 1. Account banayein (agar pehle se dukandar login nahi hai)
      const { data: current } = await supabase.auth.getSession()
      let user = current.session?.user

      if (!user || user.is_anonymous) {
        const { data: auth, error } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: { captchaToken: captcha },
        })
        if (error) throw error
        if (!auth.session) {
          throw new Error(
            'Email verify karna padega. Supabase mein Authentication ke andar "Confirm email" band karein, phir dobara koshish karein.'
          )
        }
        user = auth.user
      }

      // 2. Dukaan ki public jaankari
      const { data: shop, error: shopErr } = await supabase
        .from('shops')
        .upsert(
          {
            owner_id: user.id,
            shop_name: data.shopName.trim(),
            area: data.area.trim(),
            city: data.city.trim(),
            pincode: data.pincode,
            radius: data.radius,
            open_time: data.openTime,
            close_time: data.closeTime,
            categories: data.categories,
          },
          { onConflict: 'owner_id' }
        )
        .select()
        .single()
      if (shopErr) throw shopErr

      // 3. Private jaankari (sirf maalik dekh sakta hai)
      const { error: privErr } = await supabase.from('shop_private').upsert(
        {
          shop_id: shop.id,
          owner_name: data.ownerName.trim(),
          mobile: data.mobile,
          email: data.email.trim(),
          address: data.address.trim(),
          gst: data.gst || null,
          fssai: data.fssai || null,
          upi: data.upi.trim() || null,
          account_number: data.account,
          ifsc: data.ifsc,
        },
        { onConflict: 'shop_id' }
      )
      if (privErr) throw privErr

      await refreshShop(user)
      navigate('/partner')
    } catch (err) {
      setSubmitError(err.message || 'Kuch galat ho gaya. Dobara koshish karein.')
    } finally {
      setSubmitting(false)
      // Captcha ka token ek hi baar chalta hai
      setCaptcha(null)
      setCaptchaKey((k) => k + 1)
    }
  }

  const next = () => {
    const e = validate(step, data, consent)
    setErrors(e)
    if (Object.keys(e).length) return
    if (step < 3) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      if (!captcha) {
        setSubmitError('Pehle captcha poora karein')
        return
      }
      setSubmitError('')
      submit()
    }
  }

  const back = () => {
    if (step === 0) return
    setErrors({})
    setSubmitError('')
    setStep(step - 1)
  }

  const pct = ((data.radius - 1) / 9) * 100

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="rounded-full bg-sand px-4 py-1.5 text-[15px] font-semibold text-leaf">
              Dukandar Registration
            </span>
          </div>
          <Link to="/login" className="text-muted no-underline">
            Already registered? Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-center font-display text-5xl font-extrabold tracking-tight md:text-6xl">
          Apni dukaan <span className="text-brand">online</span> karein
        </h1>
        <p className="mt-5 text-center text-xl text-muted">
          Free registration. Grahak aapke area mein aapki dukaan dhundh payenge.
        </p>

        <div className="mt-14">
          <Stepper current={step} />
        </div>

        {/* Form card */}
        <div className="card mt-10 p-8 md:p-12">
          {step === 0 && (
            <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
              <Field label="Dukaan ka naam" required error={errors.shopName}>
                <input className="input" placeholder="Sharma General Store"
                  value={data.shopName} onChange={set('shopName')} />
              </Field>
              <Field label="Maalik ka naam" required error={errors.ownerName}>
                <input className="input" placeholder="Rakesh Sharma"
                  value={data.ownerName} onChange={set('ownerName')} />
              </Field>
              <Field label="Mobile number" required error={errors.mobile}>
                <input className="input" placeholder="9820011223" inputMode="numeric" maxLength={10}
                  value={data.mobile} onChange={setDigits('mobile')} />
              </Field>
              <Field label="Email" required error={errors.email}>
                <input className="input" placeholder="dukaan@email.com" type="email" autoComplete="email"
                  value={data.email} onChange={set('email')} />
              </Field>
              <Field
                label="Password" required error={errors.password}
                hint="Kam se kam 6 akshar. Isi se aap login karenge."
              >
                <input className="input" placeholder="••••••••" type="password" autoComplete="new-password"
                  value={data.password} onChange={set('password')} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Dukaan ka address" required error={errors.address}>
                  <textarea className="input" value={data.address} onChange={set('address')} />
                </Field>
              </div>
              <Field label="Area / mohalla" required error={errors.area}>
                <input className="input" value={data.area} onChange={set('area')} />
              </Field>
              <Field label="City" required error={errors.city}>
                <input className="input" value={data.city} onChange={set('city')} />
              </Field>
              <Field label="Pincode" required error={errors.pincode}>
                <input className="input" inputMode="numeric" maxLength={6}
                  value={data.pincode} onChange={setDigits('pincode')} />
              </Field>
              <Field label="Delivery radius">
                <div className="rounded-3xl border border-line bg-cream px-6 py-5">
                  <div className="flex items-center justify-between text-[17px]">
                    <span className="text-muted">Kitni door tak denge</span>
                    <span className="font-semibold text-leaf">{data.radius} km</span>
                  </div>
                  <input
                    type="range" min="1" max="10" step="1"
                    value={data.radius}
                    onChange={(e) => setData({ ...data, radius: Number(e.target.value) })}
                    className="slider mt-4"
                    style={{
                      background: `linear-gradient(to right, var(--color-brand) ${pct}%, #3a3a3a ${pct}%)`,
                    }}
                  />
                </div>
              </Field>
              <Field label="Khulne ka time">
                <input type="time" className="input" value={data.openTime} onChange={set('openTime')} />
              </Field>
              <Field label="Band hone ka time">
                <input type="time" className="input" value={data.closeTime} onChange={set('closeTime')} />
              </Field>

              <div className="md:col-span-2">
                <Field label="Categories" required error={errors.categories}>
                  <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map((c) => {
                      const on = data.categories.includes(c)
                      return (
                        <button
                          type="button"
                          key={c}
                          onClick={() => toggleCategory(c)}
                          className={
                            'cursor-pointer rounded-full border px-6 py-3 text-[17px] transition ' +
                            (on
                              ? 'border-leaf bg-leaf text-white'
                              : 'border-line bg-white text-ink hover:border-brand')
                          }
                        >
                          {c}
                        </button>
                      )
                    })}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
              <Field label="GST number" hint="Optional hai" error={errors.gst}>
                <input className="input" placeholder="27ABCDE1234F1Z5" maxLength={15}
                  value={data.gst} onChange={(e) => setData({ ...data, gst: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="FSSAI number" hint="Optional — khane ki cheezon ke liye" error={errors.fssai}>
                <input className="input" placeholder="10012345678901" inputMode="numeric" maxLength={14}
                  value={data.fssai} onChange={setDigits('fssai')} />
              </Field>
              <Field label="UPI ID" hint="Customer ko receipt isi par bhejenge" error={errors.upi}>
                <input className="input" placeholder="sharmastore@upi"
                  value={data.upi} onChange={set('upi')} />
              </Field>

              <div className="rounded-3xl border border-line bg-cream px-6 py-5 text-lg leading-relaxed text-muted md:col-span-2">
                Aapke documents verify karne ke baad dukaan live hogi. Tab tak aap products daal sakte hain.
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
              <Field label="Bank account number" required error={errors.account}>
                <input className="input" placeholder="12345678901234" inputMode="numeric" maxLength={18}
                  value={data.account} onChange={setDigits('account')} />
              </Field>
              <Field label="IFSC code" required error={errors.ifsc}>
                <input className="input" placeholder="HDFC0001234" maxLength={11}
                  value={data.ifsc} onChange={(e) => setData({ ...data, ifsc: e.target.value.toUpperCase() })} />
              </Field>

              <div className="rounded-3xl border border-line bg-cream px-6 py-5 md:col-span-2">
                <p className="text-lg font-semibold">Payment milne ka time</p>
                <p className="mt-1 text-lg text-muted">
                  Order deliver hone ke 24 ghante ke andar seedhe aapke account mein.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="flex cursor-pointer items-center gap-3 text-[17px] text-muted">
                  <input
                    type="checkbox" className="peer sr-only"
                    checked={consent} onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-brand peer-checked:bg-brand">
                    {consent && <Check size={14} className="text-white" />}
                  </span>
                  Main maanta hoon ki di gayi jaankari sahi hai aur ApnaStore ke seller terms se sahamat hoon.
                </label>
                {errors.consent && <p className="mt-2 text-[15px] text-red-600">{errors.consent}</p>}
              </div>

              <div className="md:col-span-2">
                <Captcha onToken={setCaptcha} resetKey={captchaKey} />
              </div>
            </div>
          )}

          {submitError && (
            <p className="mt-8 rounded-2xl bg-red-50 px-5 py-3 text-red-700">{submitError}</p>
          )}

          {/* Buttons */}
          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={step === 0 || submitting}
              className={
                'flex items-center gap-2 border-0 bg-transparent px-4 py-3 text-lg ' +
                (step === 0 ? 'cursor-default text-muted/60' : 'cursor-pointer text-ink')
              }
            >
              <ArrowLeft size={20} /> Peeche
            </button>

            <button
              type="button"
              onClick={next}
              disabled={submitting}
              className="btn-primary text-lg disabled:opacity-60"
            >
              {step === 3 ? (submitting ? 'Bhej rahe hain...' : 'Registration bhejein') : 'Aage badhein'}{' '}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* 3 info cards */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { icon: Sparkles, title: 'Free registration', text: 'Koi signup charges nahi.' },
            { icon: MapPin, title: 'Sirf aapke area', text: 'Paas ke grahak pehle dikhenge.' },
            { icon: Landmark, title: '24 ghante payment', text: 'Seedhe bank account mein.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6">
              <Icon size={26} className="text-brand" strokeWidth={1.7} />
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-1 text-lg text-muted">{text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}