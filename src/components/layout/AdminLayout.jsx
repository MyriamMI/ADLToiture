import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from "../../context/AuthContext";
import './styles/AdminLayout.css'

/* Éléments de navigation de la barre latérale */
const NAV_ITEMS = [
  { path: '/admin/dashboard',    label: 'Tableau de bord',   icon: '⊞' },
  { path: '/admin/appointments', label: 'Rendez-vous',       icon: '◷' },
  { path: '/admin/clients',      label: 'Clients',           icon: '◎' },
  { path: '/admin/quotes',       label: 'Devis',             icon: '≡' },
  { path: '/admin/reviews',      label: 'Avis & FAQ',        icon: '★' },
  { path: '/admin/stats',        label: 'Statistiques',      icon: '▦' },
]

/* Raccourcis de la barre inférieure mobile (6 entrées max) */
const BOTTOM_NAV_ITEMS = [
  { path: '/admin/dashboard',    icon: '⊞', title: 'Tableau de bord' },
  { path: '/admin/appointments', icon: '◷', title: 'Rendez-vous' },
  { path: '/admin/clients',      icon: '◎', title: 'Clients' },
  { path: '/admin/quotes',       icon: '≡', title: 'Devis' },
  { path: '/admin/reviews',      icon: '★', title: 'Avis & FAQ' },
  { path: '/admin/stats',        icon: '▦', title: 'Statistiques' },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  /* Déconnexion — efface le token et redirige vers l'accueil */
  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="admin-layout">
      {/* ── Barre latérale — visible uniquement sur bureau ── */}
      <aside className="admin-sidebar">
        {/* En-tête avec logo */}
        <div className="admin-sidebar__header">
          <Link to="/admin/dashboard" className="admin-sidebar__logo">
            <span className="admin-sidebar__logo-badge">ADL</span>
            <span>
              <span className="admin-sidebar__logo-text">ADLToiture</span>
              <br />
              <span className="admin-sidebar__logo-sub">Administration</span>
            </span>
          </Link>
        </div>

        {/* Liens de navigation */}
        <nav className="admin-sidebar__nav" aria-label="Navigation administration">
          {NAV_ITEMS.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                'admin-sidebar__nav-item' +
                (isActive ? ' admin-sidebar__nav-item--active' : '')
              }
            >
              <span className="admin-sidebar__nav-icon" aria-hidden="true">
                {icon}
              </span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Pied de barre — retour au site et déconnexion */}
        <div className="admin-sidebar__footer">
          <Link to="/" className="admin-sidebar__footer-btn">
            <span className="admin-sidebar__nav-icon" aria-hidden="true">←</span>
            Retour au site
          </Link>
          <button
            className="admin-sidebar__footer-btn admin-sidebar__footer-btn--logout"
            onClick={handleLogout}
          >
            <span className="admin-sidebar__nav-icon" aria-hidden="true">⏻</span>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Zone de contenu principal ── */}
      <main className="admin-main">
        <Outlet />
      </main>

      {/* ── Barre de navigation inférieure — mobile uniquement ── */}
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
