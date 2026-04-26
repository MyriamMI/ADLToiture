import { Routes, Route, Outlet } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

import Home from './pages/Home'
import ServicesPage from './pages/ServicesPage'
import RealisationsPage from './pages/RealisationsPage'
import ContactPage from './pages/ContactPage'

import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Appointments from './pages/admin/Appointments'
import Clients from './pages/admin/Clients'
import Quotes from './pages/admin/Quotes'
import Reviews from './pages/admin/Reviews'
import Stats from './pages/admin/Stats'

function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/realisations" element={<RealisationsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/appointments" element={<Appointments />} />
      <Route path="/admin/clients" element={<Clients />} />
      <Route path="/admin/quotes" element={<Quotes />} />
      <Route path="/admin/reviews" element={<Reviews />} />
      <Route path="/admin/stats" element={<Stats />} />
    </Routes>
  )
}

export default App
