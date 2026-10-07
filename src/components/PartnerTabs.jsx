import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Package, Store, LogOut } from 'lucide-react'
import { useAuth } from '../store/AuthContext'

const tabs = [
  { to: '/partner', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/partner/orders', label: 'Orders', icon: ClipboardList, badge: true },
  { to: '/partner/products', label: 'Products', icon: Package },
  { to: '/partner/profile', label: 'Dukaan Profile', icon: Store },
]

export default function PartnerTabs({ newCount }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const logout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="flex flex-wrap gap-3 py-8">
      {tabs.map(({ to, end, label, icon: Icon, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            'inline-flex items-center gap-2.5 rounded-2xl border px-5 py-3.5 text-[17px] font-medium no-underline ' +
            (isActive
              ? 'border-transparent bg-gradient-to-br from-brand to-brand-2 text-white shadow-lg shadow-brand/25'
              : 'border-line bg-white text-ink')
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} />
              {label}
              {badge && newCount > 0 && (
                <span
                  className={
                    'ml-1 rounded-full px-2.5 py-0.5 text-[15px] ' +
                    (isActive ? 'bg-white/25 text-white' : 'bg-sand text-ink')
                  }
                >
                  {newCount}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}

      <button
        onClick={logout}
        className="inline-flex cursor-pointer items-center gap-2.5 rounded-2xl border border-line bg-transparent px-5 py-3.5 text-[17px] font-medium text-muted"
      >
        <LogOut size={20} /> Log out
      </button>
    </nav>
  )
}