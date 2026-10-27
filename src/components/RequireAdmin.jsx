import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { supabase } from '../lib/supabase'

export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth()
  const [state, setState] = useState('checking') // checking | yes | no

  useEffect(() => {
    if (loading || !user) return
    let active = true
    supabase.rpc('is_admin').then(({ data, error }) => {
      if (active) setState(!error && data === true ? 'yes' : 'no')
    })
    return () => {
      active = false
    }
  }, [loading, user])

  const wait = (
    <div className="grid min-h-screen place-items-center text-xl text-muted">
      Load ho raha hai...
    </div>
  )

  if (loading) return wait
  if (!user) return <Navigate to="/login" replace />
  if (state === 'checking') return wait

  if (state === 'no') {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <p className="font-display text-3xl font-bold">Access nahi hai</p>
          <p className="mt-3 text-lg text-muted">Ye page sirf admin ke liye hai.</p>
          <Link to="/" className="btn-primary mt-6 no-underline">Home par jayein</Link>
        </div>
      </div>
    )
  }

  return children
}