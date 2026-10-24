import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Logo from '../components/Logo'
import Field from '../components/Field'
import Captcha from '../components/Captcha'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { user, shop, loading, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [captcha, setCaptcha] = useState(null)
  const [captchaKey, setCaptchaKey] = useState(0)

  // Pehle se login hai to seedha portal par
  useEffect(() => {
    if (!loading && user && shop) navigate('/partner', { replace: true })
  }, [loading, user, shop, navigate])

  const submit = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Sahi email likhein')
    if (!password) return setError('Password likhein')
    if (!captcha) return setError('Pehle captcha poora karein')

    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
      options: { captchaToken: captcha },
    })
    setBusy(false)

    // Captcha ka token ek hi baar chalta hai
    setCaptcha(null)
    setCaptchaKey((k) => k + 1)

    if (err) {
      setError(
        err.message.toLowerCase().includes('invalid login')
          ? 'Email ya password galat hai'
          : err.message
      )
    }
  }

  const loggedInWithoutShop = !loading && user && !shop

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="rounded-full bg-sand px-4 py-1.5 text-[15px] font-semibold text-leaf">
              Dukandar Login
            </span>
          </div>
          <Link to="/register" className="text-muted no-underline">
            Naye dukandar? Register karein
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-20">
        <h1 className="text-center font-display text-5xl font-extrabold tracking-tight">
          Dukandar <span className="text-brand">login</span>
        </h1>
        <p className="mt-5 text-center text-xl text-muted">
          Apni dukaan ka dashboard dekhein.
        </p>

        {loggedInWithoutShop ? (
          <div className="card mt-10 p-8 text-center">
            <p className="text-lg text-muted">
              Is account se koi dukaan juda nahi hai. Pehle registration poora karein.
            </p>
            <Link to="/register" className="btn-primary mt-6 no-underline">
              Registration karein <ArrowRight size={20} />
            </Link>
            <button
              onClick={signOut}
              className="mt-4 block w-full cursor-pointer border-0 bg-transparent text-muted"
            >
              Dusre account se login karein
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="card mt-10 grid gap-6 p-8 md:p-10">
            <Field label="Email">
              <input
                className="input" type="email" autoComplete="email"
                placeholder="dukaan@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Password">
              <input
                className="input" type="password" autoComplete="current-password"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <Captcha onToken={setCaptcha} resetKey={captchaKey} />

            {error && <p className="rounded-2xl bg-red-50 px-5 py-3 text-red-700">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary text-lg disabled:opacity-60">
              {busy ? 'Ruko...' : 'Sign in'} <ArrowRight size={20} />
            </button>
          </form>
        )}
      </main>
    </div>
  )
}