import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from "../../context/AuthContext";
import './styles/AdminLayout.css'

const NAV_ITEMS = [
  { path: '/admin/dashboard',    label: 'Tableau de bord',   icon: '⊞' },
  { path: '/admin/demandes',     label: 'Demandes',          icon: <i className="fas fa-inbox" aria-hidden="true" /> },
  { path: '/admin/appointments', label: 'Rendez-vous',       icon: '◷' },
  { path: '/admin/clients',      label: 'Clients',           icon: '◎' },
  { path: '/admin/quotes',       label: 'Devis',             icon: '≡' },
  { path: '/admin/reviews',      label: 'Avis & FAQ',        icon: '★' },
  { path: '/admin/stats',        label: 'Statistiques',      icon: '▦' },
]

const BOTTOM_NAV_ITEMS = [
  { path: '/admin/dashboard',    icon: '⊞',                                                      title: 'Tableau de bord' },
  { path: '/admin/demandes',     icon: <i className="fas fa-inbox" aria-hidden="true" />,         title: 'Demandes' },
  { path: '/admin/appointments', icon: '◷',                                                      title: 'Rendez-vous' },
  { path: '/admin/clients',      icon: '◎',                                                      title: 'Clients' },
  { path: '/admin/quotes',       icon: '≡',                                                      title: 'Devis' },
  { path: '/admin/reviews',      icon: '★',                                                      title: 'Avis & FAQ' },
  { path: '/admin/stats',        icon: '▦',                                                      title: 'Statistiques' },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="admin-layout">

      {/* ── Barre latérale — iPad et bureau (≥ 768px) ── */}
      <aside className={`admin-sidebar${isCollapsed ? ' admin-sidebar--collapsed' : ''}`}>

        {/* En-tête : logo + bouton burger */}
        <div className="admin-sidebar__header">
          <Link to="/admin/dashboard" className="admin-sidebar__logo">
            <span className="admin-sidebar__logo-badge">ADL</span>
            <span className="admin-sidebar__logo-labels">
              <span className="admin-sidebar__logo-text">ADLToiture</span>
              <br />
              <span className="admin-sidebar__logo-sub">Administration</span>
            </span>
          </Link>
          <button
            className="admin-sidebar__toggle"
            onClick={() => setIsCollapsed(c => !c)}
            aria-label={isCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
          >
            {isCollapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Liens de navigation */}
        <nav className="admin-sidebar__nav" aria-label="Navigation administration">
          {NAV_ITEMS.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              title={isCollapsed ? label : undefined}
              className={({ isActive }) =>
                'admin-sidebar__nav-item' +
                (isActive ? ' admin-sidebar__nav-item--active' : '')
              }
            >
              <span className="admin-sidebar__nav-icon" aria-hidden="true">
                {icon}
              </span>
              <span className="admin-sidebar__nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Carte profil */}
        <div className="admin-sidebar__profile">
          <div className="admin-sidebar__profile-top">
            <div className="admin-sidebar__profile-avatar" aria-hidden="true">A</div>
            <div className="admin-sidebar__profile-info">
              <span className="admin-sidebar__profile-name">Administrateur</span>
              <span className="admin-sidebar__profile-email">admin@adltoiture.be</span>
            </div>
          </div>
          <button
            className="admin-sidebar__profile-logout"
            onClick={handleLogout}
            title={isCollapsed ? 'Se déconnecter' : undefined}
          >
            <i className="fas fa-power-off" aria-hidden="true"></i>
            <span className="admin-sidebar__profile-logout-label">Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* ── Zone de contenu principal ── */}
      <main className="admin-main">
        <Outlet />
      </main>

      {/* ── Barre de navigation inférieure — mobile uniquement (< 768px) ── */}
      <nav className="admin-bottom-nav" aria-label="Navigation mobile">
        {BOTTOM_NAV_ITEMS.map(({ path, icon, title }) => (
          <NavLink
            key={path}
            to={path}
            title={title}
            className={({ isActive }) =>
              'admin-bottom-nav__item' +
              (isActive ? ' admin-bottom-nav__item--active' : '')
            }
          >
            <span aria-hidden="true">{icon}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
