import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import Home from './pages/Home'
import Register from './pages/Register'
import Partner from './pages/Partner'
import Test from './pages/Test'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/partner/*" element={<Partner />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}