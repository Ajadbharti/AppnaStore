import { BadgeCheck } from 'lucide-react'

export default function Profile({ shop, updateShop }) {
  const text = (k) => ({
    className: 'input',
    value: shop[k] ?? '',
    onChange: (e) => updateShop({ [k]: e.target.value }),
  })

  const Label = ({ children }) => (
    <label className="mb-2 block text-[17px] text-muted">{children}</label>
  )

  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Dukaan Profile</h1>

      <div className="card mt-8 p-10">
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          <div><Label>Dukaan ka naam</Label><input {...text('shopName')} /></div>
          <div><Label>Maalik ka naam</Label><input {...text('ownerName')} /></div>
          <div>
            <Label>Mobile</Label>
            <input className="input" inputMode="numeric" maxLength={10} value={shop.mobile}
              onChange={(e) => updateShop({ mobile: e.target.value.replace(/\D/g, '') })} />
          </div>
          <div><Label>Email</Label><input {...text('email')} /></div>
          <div><Label>Area</Label><input {...text('area')} /></div>
          <div><Label>City</Label><input {...text('city')} /></div>
          <div>
            <Label>GST</Label>
            <input className="input" maxLength={15} value={shop.gst}
              onChange={(e) => updateShop({ gst: e.target.value.toUpperCase() })} />
          </div>
          <div><Label>UPI ID</Label><input {...text('upi')} /></div>
        </div>

        <p className="mt-7 flex items-center gap-2.5 text-lg text-leaf">
          <BadgeCheck size={22} /> Badlav turant save ho jaate hain.
        </p>
      </div>

      <div className="card mt-8 p-10">
        <h2 className="font-display text-2xl font-bold">Categories</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {shop.categories.map((c) => (
            <span key={c} className="rounded-full bg-sand px-5 py-2 text-[15px] font-medium">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}