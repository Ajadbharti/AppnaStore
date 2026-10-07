import { useState } from 'react'
import { X, MapPin } from 'lucide-react'

export default function LocationModal({ current, onSave, onClose }) {
  const [pin, setPin] = useState(current ?? '')
  const [error, setError] = useState('')

  const save = () => {
    if (!/^\d{6}$/.test(pin)) return setError('6 digit ka sahi pincode likhein')
    onSave(pin)
    onClose()
  }

  const showAll = () => {
    onSave(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="card relative w-full max-w-md p-8">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-line bg-white"
        >
          <X size={20} />
        </button>

        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 text-white">
          <MapPin size={26} />
        </span>
        <h2 className="mt-5 font-display text-3xl font-bold">Aapka pincode</h2>
        <p className="mt-2 text-lg text-muted">Aas-paas ki dukanein dikhane ke liye.</p>

        <input
          className="input mt-6" placeholder="802301" inputMode="numeric" maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        />
        {error && <p className="mt-2 text-[15px] text-red-600">{error}</p>}

        <button className="btn-primary mt-6 w-full text-lg" onClick={save}>
          Set karein
        </button>
        <button
          onClick={showAll}
          className="mt-3 block w-full cursor-pointer border-0 bg-transparent text-muted"
        >
          Sab dukaanein dikhayein
        </button>
      </div>
    </div>
  )
}