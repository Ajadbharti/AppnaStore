import { Link } from 'react-router-dom'
import { ClipboardList, IndianRupee, Truck, Package, BadgeCheck, Star, MapPin } from 'lucide-react'
import OrderRow from '../../components/OrderRow'

function Stat({ icon: Icon, value, label, accent, sub }) {
  return (
    <div
      className={
        'flex h-[250px] flex-col justify-between p-8 ' +
        (accent
          ? 'rounded-[1.5rem] bg-gradient-to-br from-brand to-brand-2 text-white shadow-xl shadow-brand/25'
          : 'card')
      }
    >
      <Icon size={30} strokeWidth={1.7} className={accent ? 'text-white' : 'text-brand'} />
      <div>
        <div className="font-display text-5xl font-extrabold">{value}</div>
                <div className={'mt-1 text-lg ' + (accent ? 'text-white/90' : 'text-muted')}>{label}</div>
        {sub && (
          <div
            className={
              'mt-3 inline-block rounded-full px-3 py-1 text-[15px] font-medium ' +
              (accent ? 'bg-white/20 text-white' : 'bg-sand text-leaf')
            }
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between py-3 text-lg">
      <span className="text-muted">{label}</span>
      <span className="flex items-center gap-2 font-semibold">{children}</span>
    </div>
  )
}

// Pichhle 7 din ki bikri (rejected orders ginte nahi)
function lastSevenDays(orders) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    days.push({
      key: d.toDateString(),
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      total: 0,
    })
  }
  for (const o of orders) {
    if (o.status === 'rejected') continue
    const day = days.find((d) => d.key === new Date(o.createdAt).toDateString())
    if (day) day.total += o.amount
  }
  return days
}

export default function Dashboard({ shop, orders, products, onStatus }) {
  const todayKey = new Date().toDateString()
  const todayCount = orders.filter((o) => new Date(o.createdAt).toDateString() === todayKey).length
  const newOrders = orders.filter((o) => o.status === 'new')
   const earnings = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.amount, 0)

  // Aaj ki kamai: aaj deliver hue orders (purane orders mein delivery ka time na ho to order ka time)
  const todayEarnings = orders
    .filter(
      (o) =>
        o.status === 'delivered' &&
        new Date(o.deliveredAt || o.createdAt).toDateString() === todayKey
    )
    .reduce((sum, o) => sum + o.amount, 0)
  const outOfStock = products.filter((p) => !p.inStock || p.stock <= 0).length

  const week = lastSevenDays(orders)
  const weekTotal = week.reduce((sum, d) => sum + d.total, 0)
  const max = Math.max(1, ...week.map((d) => d.total))

  const place = [shop.area, shop.city].filter(Boolean).join(', ') || 'Address add karein'

  return (
    <div>
      <h1 className="font-display text-5xl font-extrabold tracking-tight">
        Namaste, {shop.ownerName} <span className="text-4xl">👋</span>
      </h1>
      <p className="mt-3 text-xl text-muted">{shop.shopName} — aaj ka haal-chaal.</p>

      {/* 4 stat cards */}
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Stat icon={ClipboardList} value={todayCount} label="Aaj ke orders" />
                <Stat
          icon={IndianRupee}
          value={`₹${earnings.toLocaleString('en-IN')}`}
          label="Total kamai"
          sub={`Aaj: ₹${todayEarnings.toLocaleString('en-IN')}`}
        />
        <Stat icon={Truck} value={newOrders.length} label="Naye orders" accent />
        <Stat icon={Package} value={outOfStock} label="Out of stock" />
      </div>

      {/* Weekly sales */}
      <div className="card mt-8 p-10">
        <h2 className="font-display text-2xl font-bold">Is hafte ki bikri</h2>
        <p className="mt-1 text-lg text-muted">Total ₹{weekTotal.toLocaleString('en-IN')}</p>

        <div className="mt-10 flex h-64 items-end gap-4">
          {week.map((d) => (
            <div
              key={d.key}
              title={`₹${d.total.toLocaleString('en-IN')}`}
              className="flex-1 rounded-t-3xl bg-gradient-to-r from-brand to-brand-2"
              style={{ height: `${Math.max(3, (d.total / max) * 100)}%` }}
            />
          ))}
        </div>
        <div className="mt-3 flex gap-4">
          {week.map((d) => (
            <span key={d.key} className="flex-1 text-center text-muted">{d.label}</span>
          ))}
        </div>
      </div>

      {/* Dukaan ki halat */}
      <div className="card mt-8 p-10">
        <h2 className="font-display text-2xl font-bold">Dukaan ki halat</h2>
        <div className="mt-5">
          <Row label="Verification">
            <span className="flex items-center gap-2 text-leaf">
              <BadgeCheck size={22} /> Documents jama
            </span>
          </Row>
          <Row label="Dukaan live">
            <span className="flex items-center gap-2 text-brand">
              <Star size={22} /> 2 ghante mein
            </span>
          </Row>
          <Row label="Rating">
            <span className="flex items-center gap-2 text-muted">
              <Star size={22} /> Abhi koi rating nahi
            </span>
          </Row>
          <Row label="Delivery radius">{shop.radius} km</Row>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-sand">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${(shop.radius / 10) * 100}%` }}
            />
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-3xl border border-line bg-cream px-6 py-4 text-lg text-muted">
            <MapPin size={22} className="text-brand" />
            {place} — {shop.openTime} se {shop.closeTime}
          </div>
        </div>
      </div>

      {/* Naye orders */}
      <div className="card mt-8 p-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Naye orders</h2>
          <Link to="/partner/orders" className="text-lg font-medium text-ink no-underline">
            Sab orders dekhein
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {newOrders.length === 0 && (
            <p className="py-6 text-center text-lg text-muted">Abhi koi naya order nahi hai.</p>
          )}
          {newOrders.map((o) => (
            <OrderRow key={o.id} order={o} onStatus={onStatus} />
          ))}
        </div>
      </div>
    </div>
  )
}