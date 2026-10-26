import { useState } from 'react'

const badges = {
  new: { label: 'Naya', cls: 'border-[#F6C9B0] bg-[#FCE7DA] text-brand' },
  accepted: { label: 'Accepted', cls: 'border-[#C5DCCB] bg-[#E3EFE6] text-leaf' },
  out_for_delivery: { label: 'Raaste mein', cls: 'border-[#F6D9A8] bg-[#FCEFD6] text-[#B7791F]' },
  delivered: { label: 'Delivered', cls: 'border-line bg-sand text-muted' },
  rejected: { label: 'Rejected', cls: 'border-red-200 bg-red-50 text-red-600' },
}

export default function OrderRow({ order, onStatus, onDeliver, detailed }) {
  const b = badges[order.status]
  const [otp, setOtp] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const deliver = async () => {
    if (!/^\d{4}$/.test(otp)) return setMsg('Grahak se 4 digit ka OTP lekar likhein')
    setBusy(true)
    setMsg('')
    const err = await onDeliver(order.id, otp)
    setBusy(false)
    if (err) setMsg(err)
    else setOtp('')
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-cream px-7 py-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-display text-2xl font-bold">{order.id}</span>
          <span className={'rounded-full border px-3.5 py-0.5 text-[15px] font-medium ' + b.cls}>
            {b.label}
          </span>
          {detailed && <span className="text-muted">{order.when}</span>}
        </div>
        <p className="mt-2 text-lg text-muted">
          {order.customer} · {order.area} · {order.items}
        </p>
        {detailed && <p className="mt-1 text-muted">{order.phone}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <span className="font-display text-2xl font-bold">₹{order.amount}</span>

        {order.status === 'new' && (
          <>
            <button className="btn-primary btn-sm" onClick={() => onStatus(order.id, 'accepted')}>
              Accept
            </button>
            <button
              className="cursor-pointer border-0 bg-transparent text-lg text-ink"
              onClick={() => onStatus(order.id, 'rejected')}
            >
              Reject
            </button>
          </>
        )}

        {order.status === 'accepted' && (
          <button
            className="btn-primary btn-sm"
            onClick={() => onStatus(order.id, 'out_for_delivery')}
          >
            Delivery ke liye nikla
          </button>
        )}

        {order.status === 'out_for_delivery' && onDeliver && (
          <div className="flex items-center gap-3">
            <input
              className="input !h-12 !w-32 text-center tracking-[0.3em]"
              placeholder="OTP"
              inputMode="numeric"
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <button
              className="btn-primary btn-sm disabled:opacity-60"
              onClick={deliver}
              disabled={busy}
            >
              {busy ? 'Ruko...' : 'Deliver karein'}
            </button>
          </div>
        )}
      </div>

      {msg && <p className="w-full text-[15px] text-red-600">{msg}</p>}
    </div>
  )
}