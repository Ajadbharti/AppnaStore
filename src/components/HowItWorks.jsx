import { MapPin, ShoppingBasket, CreditCard, Bike } from 'lucide-react'

const steps = [
  { n: '01', icon: MapPin, title: 'Set your location', text: 'Aas-paas ki dukanein dikhengi.' },
  { n: '02', icon: ShoppingBasket, title: 'Cart bhariye', text: 'Kirana, dairy, sabzi sab kuch.' },
  { n: '03', icon: CreditCard, title: 'Pay via UPI / COD', text: 'Secure aur asaan payment.' },
  { n: '04', icon: Bike, title: 'Doorstep delivery', text: 'Fresh, fast, on-time.' },
]

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-[1400px] scroll-mt-24 px-8 py-20">
      <h2 className="text-center font-display text-5xl font-extrabold tracking-tight">
        Kaise kaam karta hai?
      </h2>
      <p className="mt-4 text-center text-xl text-muted">
        Sirf 4 step mein ghar baithe shopping shuru karein.
      </p>

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {steps.map(({ n, icon: Icon, title, text }) => (
          <div key={n} className="card relative h-[200px] p-8">
            <span className="absolute right-8 top-6 font-display text-7xl font-extrabold text-sand">
              {n}
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-lg shadow-brand/30">
              <Icon size={24} />
            </span>
            <h3 className="mt-6 font-display text-2xl font-bold">{title}</h3>
            <p className="mt-2 text-lg text-muted">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}