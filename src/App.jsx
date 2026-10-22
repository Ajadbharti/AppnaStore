import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './store/AuthContext'
import { StoreProvider } from './store/StoreContext'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Partner from './pages/Partner'

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/partner/*"
              element={
                <RequireAuth>
                  <Partner />
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  )
}