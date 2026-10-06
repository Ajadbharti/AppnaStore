import { Link } from 'react-router-dom'
import { BadgeCheck, ShoppingCart } from 'lucide-react'
import Logo from './Logo'

export default function PartnerHeader({ shop }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <Logo to="/partner" />
          <span className="rounded-full bg-sand px-4 py-1.5 text-[15px] font-semibold text-leaf">
            Partner Portal
          </span>
        </div>

        <div className="flex items-center gap-5">
          <span className="hidden items-center gap-2 text-lg text-muted sm:flex">
            <BadgeCheck size={20} className="text-leaf" />
            {shop.shopName}
          </span>
          <Link to="/" className="btn-ghost btn-sm no-underline">
            <ShoppingCart size={20} /> Storefront
          </Link>
        </div>
      </div>
    </header>
  )
}