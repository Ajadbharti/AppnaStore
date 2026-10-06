import { Store, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-8 py-10">
        <div className="flex items-center gap-2.5">
          <Store size={22} className="text-brand" />
          <span className="font-display text-lg font-bold">ApnaStore</span>
        </div>

        <p className="text-muted">© 2026 ApnaStore — Local shopping, simplified.</p>

        <Link
          to="/register"
          className="flex items-center gap-2 font-semibold text-brand no-underline"
        >
          Dukandar banein <ArrowRight size={18} />
        </Link>
      </div>
    </footer>
  )
}