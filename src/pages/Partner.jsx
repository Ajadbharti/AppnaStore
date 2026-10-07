import { Routes, Route, Navigate } from 'react-router-dom'
import PartnerHeader from '../components/PartnerHeader'
import PartnerTabs from '../components/PartnerTabs'
import Dashboard from './partner/Dashboard'
import Orders from './partner/Orders'
import Products from './partner/Products'
import Profile from './partner/Profile'
import { useAuth } from '../store/AuthContext'
import { usePartnerData } from '../lib/usePartnerData'

export default function Partner() {
  const { shop, updateShop } = useAuth()
  const data = usePartnerData(shop.id)

  const newCount = data.orders.filter((o) => o.status === 'new').length

  return (
    <div className="min-h-screen">
      <PartnerHeader shop={shop} />

      <main className="mx-auto max-w-[1400px] px-8 pb-24">
        <PartnerTabs newCount={newCount} />

        {data.error && (
          <p className="mb-6 rounded-2xl bg-red-50 px-5 py-3 text-red-700">
            Data load nahi ho paya: {data.error}
          </p>
        )}

        <Routes>
          <Route
            index
            element={
              <Dashboard
                shop={shop}
                orders={data.orders}
                products={data.products}
                onStatus={data.setOrderStatus}
              />
            }
          />
          <Route
            path="orders"
            element={<Orders orders={data.orders} onStatus={data.setOrderStatus} />}
          />
          <Route
            path="products"
            element={
              <Products
                products={data.products}
                onAdd={data.addProduct}
                onToggle={data.toggleProduct}
                onRemove={data.removeProduct}
              />
            }
          />
          <Route path="profile" element={<Profile shop={shop} updateShop={updateShop} />} />
          <Route path="*" element={<Navigate to="/partner" replace />} />
        </Routes>
      </main>
    </div>
  )
}