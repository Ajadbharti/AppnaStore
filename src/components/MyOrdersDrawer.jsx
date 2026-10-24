import { X, ClipboardList, KeyRound } from 'lucide-react'
import { useMyOrders } from '../lib/useMyOrders'

const statusInfo = {
  new: { label: 'Dukandar ke accept karne ka intezaar', cls: 'border-[#F6C9B0] bg-[#FCE7DA] text-brand' },
  accepted: { label: 'Accepted', cls: 'border-[#C5DCCB] bg-[#E3EFE6] text-leaf' },
  delivered: { label: 'Deliver ho gaya', cls: 'border-line bg-sand text-muted' },
  rejected: { label: 'Dukandar ne reject kiya', cls: 'border-red-200 bg-red-50 text-red-600' },
}

export default function MyOrdersDrawer({ open, onClose }) {
  const { orders, loading } = useMyOrders(open)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <aside className="relative flex h-full w-full flex-col bg-cream sm:w-[540px]">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-6 top-6 grid h-11 w-11 cursor-pointer place-items-center rounded-full border-2 border-brand/70 bg-transparent text-brand"
        >
          <X size={22} />
        </button>

        <div className="p-8 pb-4">
          <h2 className="font-display text-3xl font-bold">Mere Orders</h2>
          <p className="mt-2 text-lg text-muted">Order ka status aur delivery OTP yahan dikhega.</p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center text-muted">
            <ClipboardList size={72} strokeWidth={1.5} />
            <p className="text-2xl">{loading ? 'Load ho raha hai...' : 'Abhi koi order nahi hai'}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            <div className="flex flex-col gap-4">
              {orders.map((o) => {
                const s = statusInfo[o.status]
                return (
                  <div key={o.id} className="card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-display text-xl font-bold">{o.code}</span>
                      <span className={'rounded-full border px-3 py-0.5 text-[14px] font-medium ' + s.cls}>
                        {s.label}
                      </span>
                    </div>
                    <p className="mt-1 text-[15px] text-leaf">🏪 {o.shopName}</p>
                    <p className="mt-2 text-muted">{o.items}</p>
                    <p className="mt-2 font-display text-lg font-bold">₹{o.amount}</p>

                    {o.status === 'accepted' && o.otp && (
                      <div className="mt-4 rounded-2xl bg-white p-4 text-center">
                        <p className="flex items-center justify-center gap-2 text-[15px] text-muted">
                          <KeyRound size={18} className="text-brand" /> Delivery OTP
                        </p>
                        <p className="mt-1 font-display text-5xl font-extrabold tracking-[0.3em] text-ink">
                          {o.otp}
                        </p>
                        <p className="mt-2 text-[14px] text-muted">
                          Ye OTP sirf delivery ke waqt dukandar ko bataiye.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}