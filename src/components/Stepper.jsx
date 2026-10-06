import { Store, MapPin, FileUser, Landmark, Check } from 'lucide-react'

const steps = [
  { label: 'Dukaan', icon: Store },
  { label: 'Location', icon: MapPin },
  { label: 'KYC', icon: FileUser },
  { label: 'Payment', icon: Landmark },
]

export default function Stepper({ current }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        {steps.map(({ label, icon: Icon }, i) => {
          const done = i < current
          const active = i === current
          return (
            <div key={label} className="flex items-center gap-3">
              <span
                className={
                  'grid h-12 w-12 place-items-center rounded-full border ' +
                  (done
                    ? 'border-leaf bg-leaf text-white'
                    : active
                    ? 'border-transparent bg-gradient-to-br from-brand to-brand-2 text-white shadow-lg shadow-brand/30'
                    : 'border-line bg-white text-muted')
                }
              >
                {done ? <Check size={22} /> : <Icon size={22} />}
              </span>
              <span className={'text-lg ' + (active ? 'font-medium text-ink' : 'text-muted')}>
                {label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-sand">
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${((current + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  )
}