import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, RefreshCw, RotateCcw } from 'lucide-react'
import Logo from '../components/Logo'
import { supabase } from '../lib/supabase'

const tabs = [
  { key: 'pending', label: 'Intezaar mein' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'Sab' },
]

const badge = {
  pending: 'border-[#F6D9A8] bg-[#FCEFD6] text-[#B7791F]',
  approved: 'border-[#C5DCCB] bg-[#E3EFE6] text-leaf',
  rejected: 'border-red-200 bg-red-50 text-red-600',
}
const badgeText = { pending: 'Intezaar mein', approved: 'Approved', rejected: 'Rejected' }

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[13px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 break-words text-[16px]">{value || '—'}</p>
    </div>
  )
}

export default function Admin() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('pending')
  const [rejectId, setRejectId] = useState(null)
  const [note, setNote] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.rpc('admin_list_shops')
    if (err) setError(err.message)
    else {
      setError('')
      setShops(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setStatus = async (id, status, reason) => {
    setBusyId(id)
    const { error: err } = await supabase.rpc('admin_set_shop_status', {
      p_shop_id: id,
      p_status: status,
      p_note: reason || null,
    })
    setBusyId(null)
    if (err) return setError(err.message)
    setRejectId(null)
    setNote('')
    await load()
  }

  const count = (key) => (key === 'all' ? shops.length : shops.filter((s) => s.status === key).length)
  const visible = tab === 'all' ? shops : shops.filter((s) => s.status === tab)

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Logo to="/" />
            <span className="rounded-full bg-sand px-4 py-1.5 text-[15px] font-semibold text-leaf">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-ghost btn-sm" onClick={load}>
              <RefreshCw size={16} /> Refresh
            </button>
            <Link to="/" className="text-muted no-underline">Home</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 pb-20">
        <h1 className="mt-10 font-display text-4xl font-extrabold tracking-tight">
          Dukaan approval
        </h1>

        <div className="mt-6 flex flex-wrap gap-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                'cursor-pointer rounded-full border px-5 py-2.5 text-[16px] font-medium ' +
                (tab === t.key
                  ? 'border-transparent bg-gradient-to-br from-brand to-brand-2 text-white'
                  : 'border-line bg-white text-ink')
              }
            >
              {t.label} ({count(t.key)})
            </button>
          ))}
        </div>

        {error && <p className="mt-6 rounded-2xl bg-red-50 px-5 py-3 text-red-700">{error}</p>}

        {loading ? (
          <p className="mt-10 text-lg text-muted">Load ho raha hai...</p>
        ) : visible.length === 0 ? (
          <p className="card mt-8 p-10 text-center text-lg text-muted">Is list mein koi dukaan nahi hai.</p>
        ) : (
          <div className="mt-8 flex flex-col gap-5">
            {visible.map((s) => (
              <div key={s.id} className="card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-2xl font-bold">{s.shop_name}</h2>
                    <span className={'rounded-full border px-3 py-0.5 text-[14px] font-medium ' + badge[s.status]}>
                      {badgeText[s.status]}
                    </span>
                  </div>
                  <span className="text-[14px] text-muted">
                    {new Date(s.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Info label="Maalik" value={s.owner_name} />
                  <div>
                    <p className="text-[13px] uppercase tracking-wide text-muted">Mobile</p>
                    <a className="mt-0.5 block text-[16px] text-brand" href={`tel:${s.mobile}`}>
                      {s.mobile || '—'}
                    </a>
                  </div>
                  <div>
                    <p className="text-[13px] uppercase tracking-wide text-muted">Email</p>
                    <a className="mt-0.5 block break-words text-[16px] text-brand" href={`mailto:${s.email}`}>
                      {s.email || '—'}
                    </a>
                  </div>
                  <Info label="Address" value={s.address} />
                  <Info label="Area / City / Pincode" value={[s.area, s.city, s.pincode].filter(Boolean).join(', ')} />
                  <Info label="Categories" value={(s.categories || []).join(', ')} />
                  <Info label="GST" value={s.gst} />
                  <Info label="FSSAI" value={s.fssai} />
                  <Info label="UPI" value={s.upi} />
                  <Info label="Bank" value={s.account_last4 ? `A/c ••••${s.account_last4} · ${s.ifsc || ''}` : ''} />
                  <Info label="Products jode" value={String(s.product_count)} />
                </div>

                {s.status === 'rejected' && s.review_note && (
                  <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-[15px] text-red-700">
                    Kaaran: {s.review_note}
                  </p>
                )}

                {rejectId === s.id ? (
                  <div className="mt-5">
                    <textarea
                      className="input"
                      placeholder="Reject karne ka kaaran (dukandar ko dikhega)"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <div className="mt-3 flex gap-3">
                      <button
                        className="btn-primary btn-sm disabled:opacity-60"
                        disabled={busyId === s.id}
                        onClick={() => setStatus(s.id, 'rejected', note)}
                      >
                        <X size={16} /> Reject karein
                      </button>
                      <button className="btn-ghost btn-sm" onClick={() => { setRejectId(null); setNote('') }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {s.status !== 'approved' && (
                      <button
                        className="btn-primary btn-sm disabled:opacity-60"
                        disabled={busyId === s.id}
                        onClick={() => setStatus(s.id, 'approved')}
                      >
                        <Check size={16} /> Approve
                      </button>
                    )}
                    {s.status !== 'rejected' && (
                      <button className="btn-ghost btn-sm" onClick={() => { setRejectId(s.id); setNote('') }}>
                        <X size={16} /> Reject
                      </button>
                    )}
                    {s.status !== 'pending' && (
                      <button
                        className="btn-ghost btn-sm disabled:opacity-60"
                        disabled={busyId === s.id}
                        onClick={() => setStatus(s.id, 'pending')}
                      >
                        <RotateCcw size={16} /> Wapas intezaar mein
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}