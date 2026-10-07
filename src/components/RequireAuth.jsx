import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

export default function RequireAuth({ children }) {
  const { user, shop, loading } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-xl text-muted">
        Load ho raha hai...
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (!shop) return <Navigate to="/register" replace />
  return children
}