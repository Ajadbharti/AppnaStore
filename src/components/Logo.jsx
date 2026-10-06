import { Store } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 no-underline">
      <span className="logo-mark">
        <Store size={20} strokeWidth={2} />
      </span>
      <span className="font-display text-2xl font-bold tracking-tight text-ink">
        Apna<span className="text-brand">Store</span>
      </span>
    </Link>
  )
}