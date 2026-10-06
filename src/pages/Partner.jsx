import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PartnerHeader from '../components/PartnerHeader'
import PartnerTabs from '../components/PartnerTabs'
import Dashboard from './partner/Dashboard'
import Orders from './partner/Orders'
import Products from './partner/Products'
import Profile from './partner/Profile'
import { loadShop, saveShop } from '../data/shop'
import { useStore } from '../store/StoreContext'

export default function Partner() {
  const { products, setProducts, orders, setOrders } = useStore()
  const [shop, setShop] = useState(loadShop)

  const updateShop = (patch) => {
    const next = { ...shop, ...patch }
    setShop(next)
    saveShop(next)
  }

  const setOrderStatus = (id, status) =>
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)))

  const newCount = orders.filter((o) => o.status === 'new').length

  return (
    <div className="min-h-screen">
      <PartnerHeader shop={shop} />

      <main className="mx-auto max-w-[1400px] px-8 pb-24">
        <PartnerTabs newCount={newCount} />

        <Routes>
          <Route
            index
            element={
              <Dashboard shop={shop} orders={orders} products={products} onStatus={setOrderStatus} />
            }
          />
          <Route path="orders" element={<Orders orders={orders} onStatus={setOrderStatus} />} />
          <Route
            path="products"
            element={<Products products={products} setProducts={setProducts} />}
          />
          <Route path="profile" element={<Profile shop={shop} updateShop={updateShop} />} />
          <Route path="*" element={<Navigate to="/partner" replace />} />
        </Routes>
      </main>
    </div>
  )
}