import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getKpi, getToken, BASE_URL } from '../../services/api'
import './styles/DashboardPage.css'

const STATUS_LABEL = {
  en_attente: 'En attente',
  confirme:   'Confirmé',
  annule:     'Annulé',
  termine:    'Terminé',
  nouveau:    'Nouveau',
  en_cours:   'En cours',
}

function getInitials(name) {
  if (!name) return '?'
  return String(name).split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

function statusClass(statut) {
  switch (statut) {
    case 'en_attente': return 'status-badge--pending'
    case 'confirme':   return 'status-badge--confirmed'
    case 'annule':     return 'status-badge--cancelled'
    case 'termine':    return 'status-badge--done'
    case 'nouveau':    return 'status-badge--active'
    case 'en_cours':   return 'status-badge--in-progress'
    default:           return 'status-badge--done'
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso.replace(' ', 'T')).toLocaleDateString('fr-BE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

/* Date du jour en français */
function todayLabel() {
  return new Date().toLocaleDateString('fr-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [detailClient, setDetailClient] = useState(null)

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  async function handleDashboardIcal(row) {
    const token = getToken()
    const response = await fetch(`${BASE_URL}/rdv/${row.id}/ical`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const blob = await response.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `rdv-${(row.client_nom || 'client').replace(/\s+/g, '-')}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    getKpi()
      .then(setData)
      .catch((err) => setError(err.message || 'Unable to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading">Chargement…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard">
        <p style={{ color: '#c0392b', fontSize: '0.875rem' }}>{error}</p>
      </div>
    )
  }

  const { kpi, rdvRecents: rdv, clientsRecents: clients } = data

  return (
    <div className="dashboard">
      {/* ── En-tête de la page ── */}
      <div className="dashboard__header">
        <h1 className="dashboard__title">Tableau de bord</h1>
        <p className="dashboard__subtitle">{todayLabel()}</p>
      </div>

      {/* ── Carte profil — mobile uniquement (sidebar masquée < 768px) ── */}
      <div className="dashboard__profile-card">
        <div className="dashboard__profile-avatar" aria-hidden="true">AD</div>
        <div className="dashboard__profile-info">
          <span className="dashboard__profile-name">ADL Toiture</span>
          <span className="dashboard__profile-email">admin@adltoiture.be</span>
        </div>
        <button className="dashboard__profile-logout" onClick={handleLogout}>
          <i className="fas fa-power-off"></i> Se déconnecter
        </button>
      </div>

      {/* ── Grille des indicateurs clés (2 × 2) ── */}
      <div className="dashboard__kpi-grid">
        {/* RDV en attente */}
        <div className="kpi-card">
          <span className="kpi-card__label">RDV en attente</span>
          <span className="kpi-card__value kpi-card__value--orange">
            {kpi.rdvEnAttente}
          </span>
          <span className="kpi-card__hint">À confirmer</span>
        </div>

        {/* RDV confirmés */}
        <div className="kpi-card">
          <span className="kpi-card__label">RDV confirmés</span>
          <span className="kpi-card__value kpi-card__value--green">
            {kpi.rdvConfirmes}
          </span>
          <span className="kpi-card__hint">Ce mois-ci</span>
        </div>

        {/* Clients actifs */}
        <div className="kpi-card">
          <span className="kpi-card__label">Clients actifs</span>
          <span className="kpi-card__value kpi-card__value--blue">
            {kpi.clientsActifs}
          </span>
          <span className="kpi-card__hint">Total base clients</span>
        </div>

        {/* Travaux terminés */}
        <div className="kpi-card">
          <span className="kpi-card__label">Travaux terminés</span>
          <span className="kpi-card__value kpi-card__value--gray">
            {kpi.travauxTermines}
          </span>
          <span className="kpi-card__hint">Depuis le début</span>
        </div>
      </div>

      {/* ══════════════════════════════
          Tableau des rendez-vous récents
      ══════════════════════════════ */}
      <div className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">Rendez-vous récents</h2>
          <Link to="/admin/appointments" className="dashboard__section-link">
            Voir tous <i className="fas fa-arrow-right"></i>
          </Link>
        </div>

        <div className="dashboard__table-wrap">
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Client</th>
                <th className="col-date-rdv">Date</th>
                <th className="col-service">Service</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rdv.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="table-client">
                      <span className="table-avatar" aria-hidden="true">
                        {getInitials(row.client_nom)}
                      </span>
                      <span className="table-client__name">{row.client_nom}</span>
                    </div>
                  </td>
                  <td className="col-date-rdv">{formatDate(row.date_rdv)}</td>
                  <td className="col-service">{row.service}</td>
                  <td>
                    <span className={`status-badge ${statusClass(row.statut)}`}>
                      {STATUS_LABEL[row.statut] ?? row.statut}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      {row.statut === 'confirme' && (
                        <button className="action-btn" title="Export iCal" aria-label={`Exporter le RDV de ${row.client_nom}`} onClick={() => handleDashboardIcal(row)}>
                          <i className="fas fa-calendar-alt"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Cards mobiles RDV ── */}
        <div className="dashboard__mobile-cards">
          {rdv.map((row) => (
            <div key={row.id} className="mobile-card">
              <div className="mobile-card__left">
                <div className="mobile-card__header">
                  <span className="table-avatar" aria-hidden="true">
                    {getInitials(row.client_nom)}
                  </span>
                  <div className="mobile-card__info">
                    <span className="mobile-card__name">{row.client_nom}</span>
                    <span className="mobile-card__sub">{formatDate(row.date_rdv)}</span>
                  </div>
                </div>
                {row.service && (
                  <div className="mobile-card__service">{row.service}</div>
                )}
              </div>
              <div className="mobile-card__right">
                <span className={`status-badge ${statusClass(row.statut)}`}>
                  {STATUS_LABEL[row.statut] ?? row.statut}
                </span>
                <div className="mobile-card__actions">
                  {row.statut === 'confirme' && (
                    <button className="action-btn" title="Export iCal" aria-label={`Exporter le RDV de ${row.client_nom}`} onClick={() => handleDashboardIcal(row)}>
                      <i className="fas fa-calendar-alt"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════
          Tableau des clients récents
      ══════════════════════════════ */}
      <div className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">Clients récents</h2>
          <Link to="/admin/clients" className="dashboard__section-link">
            Voir tous <i className="fas fa-arrow-right"></i>
          </Link>
        </div>

        <div className="dashboard__table-wrap">
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Date d'ajout</th>
                <th>Statut</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="table-client">
                      <span className="table-avatar" aria-hidden="true">
                        {getInitials(row.nom)}
                      </span>
                      <span className="table-client__name">{row.nom}</span>
                    </div>
                  </td>
                  <td>{formatDate(row.date_creation)}</td>
                  <td>
                    <span className={`status-badge ${statusClass(row.statut)}`}>
                      {STATUS_LABEL[row.statut] ?? row.statut}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn" title="Voir le profil" aria-label={`Voir le profil de ${row.nom}`} onClick={() => setDetailClient(row)}>
                        <i className="fas fa-info-circle"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Cards mobiles Clients ── */}
        <div className="dashboard__mobile-cards">
          {clients.map((row) => (
            <div key={row.id} className="mobile-card">
              <div className="mobile-card__left">
                <div className="mobile-card__header">
                  <span className="table-avatar" aria-hidden="true">
                    {getInitials(row.nom)}
                  </span>
                  <div className="mobile-card__info">
                    <span className="mobile-card__name">{row.nom}</span>
                    <span className="mobile-card__sub">{formatDate(row.date_creation)}</span>
                  </div>
                </div>
              </div>
              <div className="mobile-card__right">
                <span className={`status-badge ${statusClass(row.statut)}`}>
                  {STATUS_LABEL[row.statut] ?? row.statut}
                </span>
                <div className="mobile-card__actions">
                  <button className="action-btn" title="Voir le profil" aria-label={`Voir le profil de ${row.nom}`} onClick={() => setDetailClient(row)}>
                    <i className="fas fa-info-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modale détail client ── */}
      {detailClient && (
        <div className="dash-client-overlay" onClick={() => setDetailClient(null)}>
          <div className="dash-client-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-client-modal__head">
              <div className="dash-client-modal__avatar">{getInitials(detailClient.nom)}</div>
              <div>
                <p className="dash-client-modal__name">{detailClient.nom}</p>
                <span className={`status-badge ${statusClass(detailClient.statut)}`}>
                  {STATUS_LABEL[detailClient.statut] ?? detailClient.statut}
                </span>
              </div>
              <button className="dash-client-modal__close" onClick={() => setDetailClient(null)} aria-label="Fermer">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="dash-client-modal__body">
              {detailClient.telephone && (
                <div className="dash-client-modal__row">
                  <i className="fas fa-phone"></i>
                  <span>{detailClient.telephone}</span>
                </div>
              )}
              {detailClient.email && (
                <div className="dash-client-modal__row">
                  <i className="fas fa-envelope"></i>
                  <span>{detailClient.email}</span>
                </div>
              )}
              {detailClient.ville && (
                <div className="dash-client-modal__row">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{detailClient.ville}</span>
                </div>
              )}
              <div className="dash-client-modal__row">
                <i className="fas fa-calendar-alt"></i>
                <span>Ajouté le {formatDate(detailClient.date_creation)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
