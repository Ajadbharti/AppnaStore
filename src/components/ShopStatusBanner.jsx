import { useEffect, useRef, useState } from 'react'
import { Clock, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/AuthContext'

export default function ShopStatusBanner({ shop }) {
  const { refreshShop } = useAuth()
  const latest = useRef(refreshShop)
  latest.current = refreshShop
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  // Approval hone tak status kuch der mein apne aap check hota rahe
  useEffect(() => {
    if (shop.status === 'approved') return
    const check = () => latest.current()
    const timer = setInterval(check, 20000)
    window.addEventListener('focus', check)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', check)
    }
  }, [shop.status])

  if (shop.status === 'approved') return null

  const resubmit = async () => {
    setBusy(true)
    setErr('')
    const { error } = await supabase.rpc('resubmit_shop')
    setBusy(false)
    if (error) return setErr(error.message)
    await latest.current()
  }

  if (shop.status === 'rejected') {
    return (
      <div className="mt-8 flex items-start gap-4 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        <XCircle size={26} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-display text-xl font-bold">Aapki dukaan approve nahi hui</p>
          {shop.reviewNote && <p className="mt-1 text-[16px]">Kaaran: {shop.reviewNote}</p>}
          <p className="mt-1 text-[16px]">
            Dukaan Profile mein details theek karke dobara review ke liye bhej sakte hain.
          </p>
          <button
            className="btn-primary btn-sm mt-4 disabled:opacity-60"
            onClick={resubmit}
            disabled={busy}
          >
            {busy ? 'Ruko...' : 'Dobara review ke liye bhejein'}
          </button>
          {err && <p className="mt-2 text-[14px]">{err}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 flex items-start gap-4 rounded-3xl border border-[#F6D9A8] bg-[#FCEFD6] p-6 text-[#8A5A12]">
      <Clock size={26} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-display text-xl font-bold">Aapki dukaan verify ho rahi hai</p>
        <p className="mt-1 text-[16px]">
          Jab tak ApnaStore ki team approve nahi karti, customers ko aapki dukaan aur products
          nahi dikhenge. Tab tak aap products jod sakte hain.
        </p>
      </div>
    </div>
  )
}