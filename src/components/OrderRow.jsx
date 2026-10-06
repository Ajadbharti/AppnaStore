const badges = {
  new: { label: 'Naya', cls: 'border-[#F6C9B0] bg-[#FCE7DA] text-brand' },
  accepted: { label: 'Accepted', cls: 'border-[#C5DCCB] bg-[#E3EFE6] text-leaf' },
  delivered: { label: 'Delivered', cls: 'border-line bg-sand text-muted' },
  rejected: { label: 'Rejected', cls: 'border-red-200 bg-red-50 text-red-600' },
}

export default function OrderRow({ order, onStatus, detailed }) {
  const b = badges[order.status]

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

      <div className="flex items-center gap-5">
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
          <button className="btn-primary btn-sm" onClick={() => onStatus(order.id, 'delivered')}>
            Delivered
          </button>
        )}
      </div>
    </div>
  )
}