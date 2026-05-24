import { Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './components/layout/PublicLayout'
import AdminLayout from './components/layout/AdminLayout'

/* Pages publiques */
import Home from './pages/Home'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import RealisationsPage from './pages/RealisationsPage'
import PolitiqueConfidentialitePage from './pages/PolitiqueConfidentialitePage'

/* Page de connexion — accès public */
import LoginPage from './pages/admin/LoginPage'

/* Pages d'administration — accès protégé */
import DashboardPage from './pages/admin/DashboardPage'
import RendezVousPage from './pages/admin/RendezVousPage'
import ClientsPage from './pages/admin/ClientsPage'
import DevisPage from './pages/admin/DevisPage'
import DevisCalculateurPage from './pages/admin/DevisCalculateurPage'
import DemandesPage from './pages/admin/DemandesPage'
import AvisFaqPage from './pages/admin/AvisFaqPage'
import StatistiquesPage from './pages/admin/StatistiquesPage'

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* ── Routes publiques — avec Header, Navbar et Footer ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/realisations" element={<RealisationsPage />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialitePage />} />
      </Route>

      {/* ── Page de connexion — accessible sans authentification ── */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* ── Routes d'administration — protégées + mise en page avec barre latérale ── */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirection de /admin vers le tableau de bord */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="/admin/dashboard"         element={<DashboardPage />} />
        <Route path="/admin/demandes"          element={<DemandesPage />} />
        <Route path="/admin/appointments"      element={<RendezVousPage />} />
        <Route path="/admin/clients"           element={<ClientsPage />} />
        <Route path="/admin/quotes"            element={<DevisPage />} />
        <Route path="/admin/devis/calculateur" element={<DevisCalculateurPage />} />
        <Route path="/admin/reviews"           element={<AvisFaqPage />} />
        <Route path="/admin/stats"             element={<StatistiquesPage />} />
      </Route>
    </Routes>
    </>
  )
}

export default App
