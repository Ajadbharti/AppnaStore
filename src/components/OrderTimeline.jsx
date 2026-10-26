import { Check, X } from 'lucide-react'

const flow = ['new', 'accepted', 'out_for_delivery', 'delivered']

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function buildSteps(order) {
  if (order.status === 'rejected') {
    return [
      { label: 'Order mil gaya', at: order.createdAt, state: 'done' },
      { label: 'Dukandar ne reject kiya', at: order.rejectedAt, state: 'bad' },
    ]
  }

  const cur = flow.indexOf(order.status)
  const base = [
    { label: 'Order mil gaya', at: order.createdAt },
    { label: 'Dukandar ne accept kiya', at: order.acceptedAt },
    { label: 'Raaste mein hai', at: order.dispatchedAt },
    { label: 'Deliver ho gaya', at: order.deliveredAt },
  ]
  return base.map((s, i) => ({
    ...s,
    state: i <= cur ? 'done' : i === cur + 1 ? 'next' : 'todo',
  }))
}

const dot = {
  done: 'bg-leaf text-white',
  next: 'animate-pulse border-[3px] border-brand bg-white',
  todo: 'border-2 border-line bg-white',
  bad: 'bg-red-500 text-white',
}

const text = {
  done: 'text-ink',
  next: 'font-semibold text-brand',
  todo: 'text-muted',
  bad: 'font-semibold text-red-600',
}

export default function OrderTimeline({ order }) {
  const steps = buildSteps(order)

  return (
    <ol className="mt-4 list-none border-t border-line p-0 pt-4">
      {steps.map((s, i) => {
        const last = i === steps.length - 1
        const nextDone = !last && steps[i + 1].state === 'done'
        return (
          <li key={s.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={'grid h-6 w-6 shrink-0 place-items-center rounded-full ' + dot[s.state]}>
                {s.state === 'done' && <Check size={14} />}
                {s.state === 'bad' && <X size={14} />}
              </span>
              {!last && (
                <span
                  className={'my-1 w-0.5 flex-1 ' + (nextDone ? 'bg-leaf' : 'bg-line')}
                  style={{ minHeight: '20px' }}
                />
              )}
            </div>
            <div className="pb-3">
              <p className={'text-[16px] ' + text[s.state]}>{s.label}</p>
              {s.at && <p className="text-[13px] text-muted">{fmt(s.at)}</p>}
              {s.state === 'next' && <p className="text-[13px] text-muted">Intezaar hai...</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}