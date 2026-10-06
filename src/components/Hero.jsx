import { MapPin, Timer, BadgeIndianRupee } from 'lucide-react'

const perks = [
  { icon: MapPin, label: 'Nearby shops' },
  { icon: Timer, label: 'Fast delivery' },
  { icon: BadgeIndianRupee, label: 'UPI & COD' },
]

function go(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-[#FBE9DB] via-[#FAF1E3] to-cream">
      <div className="mx-auto max-w-[1400px] px-8 py-24 md:py-32">
        <span className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-2 text-[15px] text-muted shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-leaf" />
          Hyperlocal • 15–30 min delivery
        </span>

        <h1 className="mt-10 font-display text-6xl font-extrabold leading-[1.05] tracking-tight md:text-8xl">
          Apke{' '}
          <span className="bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">
            mohalle
          </span>{' '}
          ki
          <br />
          dukaan, online.
        </h1>

        <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted">
          Order kirana, dairy, fruits aur zaroori saaman apne aas-paas ke trusted
          dukandaron se. Ghar baithe, asaan payment, fresh delivery.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <button className="btn-primary btn-lg" onClick={() => go('categories')}>
            Shop nearby
          </button>
          <button className="btn-ghost btn-lg" onClick={() => go('how')}>
            How it works
          </button>
        </div>

        <div className="mt-16 flex flex-wrap gap-12 md:gap-20">
          {perks.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-white shadow-sm">
                <Icon size={24} className="text-brand" />
              </span>
              <span className="text-[15px] text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}