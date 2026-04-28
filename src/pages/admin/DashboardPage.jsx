import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './styles/DashboardPage.css'

/* ── Données de démonstration — remplacées par l'API en production ── */
const MOCK_DATA = {
  kpi: {
    rdvEnAttente: 5,
    rdvConfirmes: 12,
    clientsActifs: 48,
    travauxTermines: 156,
  },
  rdv: [
    {
      id: 1,
      client: 'Jean Dupont',
      date: '28 avr. 2026',
      service: 'Rénovation toiture',
      statut: 'En attente',
    },
    {
      id: 2,
      client: 'Marie Martin',
      date: '29 avr. 2026',
      service: 'Pose neuve',
      statut: 'Confirmé',
    },
    {
      id: 3,
      client: 'Paul Bernard',
      date: '30 avr. 2026',
      service: 'Zinguerie',
      statut: 'En cours',
    },
    {
      id: 4,
      client: 'Sophie Leroy',
      date: '02 mai 2026',
      service: 'Isolation combles',
      statut: 'Confirmé',
    },
    {
      id: 5,
      client: 'Luc Moreau',
      date: '03 mai 2026',
      service: 'Nettoyage toiture',
      statut: 'Annulé',
    },
  ],
  clients: [
    { id: 1, client: 'Jean Dupont',     date: '24 avr. 2026', statut: 'Actif' },
    { id: 2, client: 'Marie Martin',    date: '22 avr. 2026', statut: 'Actif' },
    { id: 3, client: 'Paul Bernard',    date: '20 avr. 2026', statut: 'En cours' },
    { id: 4, client: 'Isabelle Simon',  date: '18 avr. 2026', statut: 'Terminé' },
  ],
}

/* Retourne les deux premières initiales d'un nom complet */
function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

/* Retourne la classe CSS correspondant au statut */
function statusClass(statut) {
  switch (statut) {
    case 'En attente': return 'status-badge--pending'
    case 'Confirmé':   return 'status-badge--confirmed'
    case 'Annulé':     return 'status-badge--cancelled'
    case 'En cours':   return 'status-badge--in-progress'
    case 'Terminé':    return 'status-badge--done'
    case 'Actif':      return 'status-badge--active'
    default:           return 'status-badge--done'
  }
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
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  /* Chargement des données depuis l'API ou les données de démonstration */
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/dashboard.php')
        if (!res.ok) throw new Error('API non disponible')
        const json = await res.json()
        setData(json)
      } catch {
        /* Repli sur les données de démonstration si l'API est inaccessible */
        setData(MOCK_DATA)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading">Chargement…</div>
      </div>
    )
  }

  const { kpi, rdv, clients } = data

  return (
    <div className="dashboard">
      {/* ── En-tête de la page ── */}
      <div className="dashboard__header">
        <h1 className="dashboard__title">Tableau de bord</h1>
        <p className="dashboard__subtitle">{todayLabel()}</p>
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
            Voir tous →
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
                  {/* Cellule client avec avatar initiales */}
                  <td>
                    <div className="table-client">
                      <span className="table-avatar" aria-hidden="true">
                        {getInitials(row.client)}
                      </span>
                      <span className="table-client__name">{row.client}</span>
                    </div>
                  </td>

                  {/* Date du rendez-vous */}
                  <td className="col-date-rdv">{row.date}</td>

                  {/* Type de service */}
                  <td className="col-service">{row.service}</td>

                  {/* Badge de statut */}
                  <td>
                    <span className={`status-badge ${statusClass(row.statut)}`}>
                      {row.statut}
                    </span>
                  </td>

                  {/* Boutons d'action — modifier, calendrier, supprimer */}
                  <td>
                    <div className="action-btns">
                      <button
                        className="action-btn"
                        title="Modifier"
                        aria-label={`Modifier le RDV de ${row.client}`}
                      >
                        ✏
                      </button>
                      <button
                        className="action-btn"
                        title="Replanifier"
                        aria-label={`Replanifier le RDV de ${row.client}`}
                      >
                        📅
                      </button>
                      <button
                        className="action-btn action-btn--delete"
                        title="Supprimer"
                        aria-label={`Supprimer le RDV de ${row.client}`}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════
          Tableau des clients récents
      ══════════════════════════════ */}
      <div className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">Clients récents</h2>
          <Link to="/admin/clients" className="dashboard__section-link">
            Voir tous →
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
                  {/* Cellule client avec avatar initiales */}
                  <td>
                    <div className="table-client">
                      <span className="table-avatar" aria-hidden="true">
                        {getInitials(row.client)}
                      </span>
                      <span className="table-client__name">{row.client}</span>
                    </div>
                  </td>

                  {/* Date d'ajout ou dernier contact */}
                  <td>{row.date}</td>

                  {/* Badge de statut */}
                  <td>
                    <span className={`status-badge ${statusClass(row.statut)}`}>
                      {row.statut}
                    </span>
                  </td>

                  {/* Bouton d'information */}
                  <td>
                    <div className="action-btns">
                      <button
                        className="action-btn"
                        title="Voir le profil"
                        aria-label={`Voir le profil de ${row.client}`}
                      >
                        ℹ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
