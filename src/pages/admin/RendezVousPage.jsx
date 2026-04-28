import { useState, useEffect, useCallback } from 'react'
import './styles/RendezVousPage.css'

/* ── Données de démonstration ── */
const MOCK_RDV = [
  {
    id: 1,
    client: 'Jean Dupont',
    date: '2026-04-28',
    service: 'Rénovation toiture',
    statut: 'En attente',
    notes: '',
  },
  {
    id: 2,
    client: 'Marie Martin',
    date: '2026-04-29',
    service: 'Pose neuve',
    statut: 'Confirmé',
    notes: 'Disponible matin uniquement',
  },
  {
    id: 3,
    client: 'Paul Bernard',
    date: '2026-04-30',
    service: 'Zinguerie',
    statut: 'En cours',
    notes: '',
  },
  {
    id: 4,
    client: 'Sophie Leroy',
    date: '2026-05-02',
    service: 'Isolation combles',
    statut: 'Confirmé',
    notes: '',
  },
  {
    id: 5,
    client: 'Luc Moreau',
    date: '2026-05-03',
    service: 'Nettoyage toiture',
    statut: 'Annulé',
    notes: 'Annulé par téléphone le 26/04',
  },
  {
    id: 6,
    client: 'Isabelle Simon',
    date: '2026-05-05',
    service: 'Inspection toiture',
    statut: 'En attente',
    notes: '',
  },
  {
    id: 7,
    client: 'Thomas Petit',
    date: '2026-05-07',
    service: 'Traitement hydrofuge',
    statut: 'Confirmé',
    notes: '',
  },
]

/* Liste de clients disponibles pour la sélection */
const CLIENTS_LIST = [
  'Jean Dupont',
  'Marie Martin',
  'Paul Bernard',
  'Sophie Leroy',
  'Luc Moreau',
  'Isabelle Simon',
  'Thomas Petit',
  'Claire Durand',
]

/* Types de service proposés */
const SERVICES_LIST = [
  'Rénovation toiture',
  'Pose neuve',
  'Zinguerie',
  'Isolation combles',
  'Nettoyage toiture',
  'Réparation urgence',
  'Inspection toiture',
  'Traitement hydrofuge',
]

/* Onglets de filtre et statuts correspondants */
const TABS = [
  { label: 'Tous',        filter: null },
  { label: 'En attente',  filter: 'En attente' },
  { label: 'Confirmé',    filter: 'Confirmé' },
  { label: 'Annulé',      filter: 'Annulé' },
]

/* Formulaire vide pour la création */
const EMPTY_FORM = {
  client: '',
  date: '',
  service: '',
  statut: 'En attente',
  notes: '',
}

/* ── Fonctions utilitaires ── */

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

function statusClass(statut) {
  switch (statut) {
    case 'En attente': return 'status-badge--pending'
    case 'Confirmé':   return 'status-badge--confirmed'
    case 'Annulé':     return 'status-badge--cancelled'
    case 'En cours':   return 'status-badge--in-progress'
    case 'Terminé':    return 'status-badge--done'
    default:           return 'status-badge--done'
  }
}

/* Formate une date ISO en format court français */
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('fr-BE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/* ══════════════════════════════════════════
   Composant principal
══════════════════════════════════════════ */
export default function RendezVousPage() {
  /* ── État principal ── */
  const [rdvList, setRdvList] = useState([])
  const [loading, setLoading] = useState(true)

  /* Onglet de filtre actif */
  const [activeTab, setActiveTab] = useState(null)

  /* Id du RDV dont le menu "···" est ouvert (null = aucun) */
  const [openMenu, setOpenMenu] = useState(null)

  /* Modal : { type: 'create'|'edit'|null, item: object|null } */
  const [modal, setModal] = useState({ type: null, item: null })

  /* Valeurs du formulaire de la modal */
  const [formData, setFormData] = useState(EMPTY_FORM)

  /* ── Chargement des données ── */
  useEffect(() => {
    async function fetchRdv() {
      try {
        const res = await fetch('/api/rdv.php')
        if (!res.ok) throw new Error()
        const json = await res.json()
        setRdvList(json)
      } catch {
        /* Repli sur les données de démonstration */
        setRdvList(MOCK_RDV)
      } finally {
        setLoading(false)
      }
    }
    fetchRdv()
  }, [])

  /* ── Verrouillage du défilement quand la modal est ouverte ── */
  useEffect(() => {
    document.body.style.overflow = modal.type ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [modal.type])

  /* ── Filtrage côté client ── */
  const visibleRdv = activeTab
    ? rdvList.filter((r) => r.statut === activeTab)
    : rdvList

  /* ── Compteur par statut pour les onglets ── */
  function countFor(filter) {
    return filter ? rdvList.filter((r) => r.statut === filter).length : rdvList.length
  }

  /* ══════════════════════════════
     Actions CRUD
  ══════════════════════════════ */

  /* Ouvrir la modal de création */
  function openCreateModal() {
    setFormData(EMPTY_FORM)
    setModal({ type: 'create', item: null })
  }

  /* Ouvrir la modal de modification */
  function openEditModal(item) {
    setFormData({
      client: item.client,
      date: item.date,
      service: item.service,
      statut: item.statut,
      notes: item.notes || '',
    })
    setModal({ type: 'edit', item })
    setOpenMenu(null)
  }

  /* Fermer la modal */
  const closeModal = useCallback(() => {
    setModal({ type: null, item: null })
  }, [])

  /* Mise à jour des champs du formulaire */
  function handleFormChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /* Créer un nouveau RDV */
  async function handleCreate(e) {
    e.preventDefault()
    const newItem = { ...formData, id: Date.now() }

    try {
      const res = await fetch('/api/rdv.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        const created = await res.json()
        setRdvList((prev) => [...prev, created])
        closeModal()
        return
      }
    } catch {
      /* API indisponible — mise à jour locale uniquement */
    }

    setRdvList((prev) => [...prev, newItem])
    closeModal()
  }

  /* Enregistrer les modifications d'un RDV */
  async function handleUpdate(e) {
    e.preventDefault()
    const updated = { ...modal.item, ...formData }

    try {
      await fetch('/api/rdv.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
    } catch {
      /* API indisponible — mise à jour locale uniquement */
    }

    setRdvList((prev) =>
      prev.map((r) => (r.id === modal.item.id ? updated : r))
    )
    closeModal()
  }

  /* Supprimer un RDV */
  async function handleDelete(id) {
    try {
      await fetch(`/api/rdv.php?id=${id}`, { method: 'DELETE' })
    } catch {
      /* API indisponible — suppression locale uniquement */
    }
    setRdvList((prev) => prev.filter((r) => r.id !== id))
    setOpenMenu(null)
  }

  /* ── Rendu ── */
  if (loading) {
    return (
      <div className="rdv-page">
        <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.875rem' }}>
          Chargement…
        </p>
      </div>
    )
  }

  return (
    <div className="rdv-page">
      {/* ── En-tête de page ── */}
      <div className="rdv-page__header">
        <h1 className="rdv-page__title">Rendez-vous</h1>
        <button className="rdv-page__new-btn" onClick={openCreateModal}>
          + Nouveau Rendez-vous
        </button>
      </div>

      {/* ── Onglets de filtre ── */}
      <div className="rdv-tabs" role="tablist" aria-label="Filtrer par statut">
        {TABS.map(({ label, filter }) => (
          <button
            key={label}
            role="tab"
            aria-selected={activeTab === filter}
            className={
              'rdv-tab' + (activeTab === filter ? ' rdv-tab--active' : '')
            }
            onClick={() => setActiveTab(filter)}
          >
            {label}
            <span className="rdv-tab__count">{countFor(filter)}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════
          Tableau — bureau
      ══════════════════════════════ */}
      <div className="rdv-table-card">
        <div className="rdv-table-wrap">
          <table className="rdv-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Date</th>
                <th>Service</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRdv.length === 0 ? (
                <tr>
                  <td colSpan={5} className="rdv-table__empty">
                    Aucun rendez-vous pour ce filtre.
                  </td>
                </tr>
              ) : (
                visibleRdv.map((row) => (
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
                    <td>{formatDate(row.date)}</td>

                    {/* Type de prestation */}
                    <td>{row.service}</td>

                    {/* Badge de statut */}
                    <td>
                      <span className={`status-badge ${statusClass(row.statut)}`}>
                        {row.statut}
                      </span>
                    </td>

                    {/* Menu d'actions "···" */}
                    <td>
                      <div className="rdv-menu-wrap">
                        <button
                          className={
                            'rdv-dots-btn' +
                            (openMenu === row.id ? ' rdv-dots-btn--open' : '')
                          }
                          aria-label={`Actions pour ${row.client}`}
                          aria-haspopup="true"
                          aria-expanded={openMenu === row.id}
                          onClick={() =>
                            setOpenMenu((prev) =>
                              prev === row.id ? null : row.id
                            )
                          }
                        >
                          ···
                        </button>

                        {/* Menu déroulant */}
                        {openMenu === row.id && (
                          <div className="rdv-dropdown" role="menu">
                            <button
                              className="rdv-dropdown__item"
                              role="menuitem"
                              onClick={() => openEditModal(row)}
                            >
                              ✏ Modifier
                            </button>
                            <button
                              className="rdv-dropdown__item rdv-dropdown__item--danger"
                              role="menuitem"
                              onClick={() => handleDelete(row.id)}
                            >
                              🗑 Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════
          Cartes — mobile
      ══════════════════════════════ */}
      <div className="rdv-cards">
        {visibleRdv.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(0,0,0,0.35)', fontSize: '0.875rem' }}>
            Aucun rendez-vous pour ce filtre.
          </p>
        )}
        {visibleRdv.map((row) => (
          <div className="rdv-card" key={row.id}>
            {/* En-tête de carte : client + statut */}
            <div className="rdv-card__header">
              <div className="table-client">
                <span className="table-avatar" aria-hidden="true">
                  {getInitials(row.client)}
                </span>
                <span className="table-client__name">{row.client}</span>
              </div>
              <span className={`status-badge ${statusClass(row.statut)}`}>
                {row.statut}
              </span>
            </div>

            {/* Métadonnées : date et service */}
            <div className="rdv-card__meta">
              <span className="rdv-card__meta-item">📅 {formatDate(row.date)}</span>
              <span className="rdv-card__meta-item">🔧 {row.service}</span>
            </div>

            {/* Menu d'actions */}
            <div className="rdv-card__footer">
              <div className="rdv-menu-wrap">
                <button
                  className={
                    'rdv-dots-btn' +
                    (openMenu === row.id ? ' rdv-dots-btn--open' : '')
                  }
                  aria-label={`Actions pour ${row.client}`}
                  onClick={() =>
                    setOpenMenu((prev) => (prev === row.id ? null : row.id))
                  }
                >
                  ···
                </button>

                {openMenu === row.id && (
                  <div className="rdv-dropdown" role="menu">
                    <button
                      className="rdv-dropdown__item"
                      role="menuitem"
                      onClick={() => openEditModal(row)}
                    >
                      ✏ Modifier
                    </button>
                    <button
                      className="rdv-dropdown__item rdv-dropdown__item--danger"
                      role="menuitem"
                      onClick={() => handleDelete(row.id)}
                    >
                      🗑 Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Couche transparente pour fermer le menu ouvert ── */}
      {openMenu !== null && (
        <div
          className="rdv-menu-overlay"
          onClick={() => setOpenMenu(null)}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════
          Modal — Nouveau / Modifier rendez-vous
      ══════════════════════════════ */}
      {modal.type !== null && (
        /* Fermeture en cliquant sur le fond */
        <div
          className="rdv-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rdv-modal-title"
          onClick={closeModal}
        >
          <div
            className="rdv-modal__dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête rouge foncé */}
            <div className="rdv-modal__header">
              <h2 className="rdv-modal__title" id="rdv-modal-title">
                {modal.type === 'create'
                  ? 'Nouveau rendez-vous'
                  : 'Modifier le rendez-vous'}
              </h2>
              <button
                className="rdv-modal__close"
                onClick={closeModal}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            {/* Corps — formulaire */}
            <form
              className="rdv-modal__body"
              onSubmit={modal.type === 'create' ? handleCreate : handleUpdate}
            >
              {/* Sélection du client */}
              <div className="rdv-modal__field">
                <label className="rdv-modal__label" htmlFor="rdv-client">
                  Client
                </label>
                <select
                  id="rdv-client"
                  name="client"
                  className="rdv-modal__select"
                  value={formData.client}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">— Sélectionner un client —</option>
                  {CLIENTS_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date du rendez-vous */}
              <div className="rdv-modal__field">
                <label className="rdv-modal__label" htmlFor="rdv-date">
                  Date
                </label>
                <input
                  id="rdv-date"
                  name="date"
                  type="date"
                  className="rdv-modal__input"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                />
              </div>

              {/* Type de service */}
              <div className="rdv-modal__field">
                <label className="rdv-modal__label" htmlFor="rdv-service">
                  Service
                </label>
                <select
                  id="rdv-service"
                  name="service"
                  className="rdv-modal__select"
                  value={formData.service}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">— Sélectionner un service —</option>
                  {SERVICES_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statut — En attente par défaut */}
              <div className="rdv-modal__field">
                <label className="rdv-modal__label" htmlFor="rdv-statut">
                  Statut
                </label>
                <select
                  id="rdv-statut"
                  name="statut"
                  className="rdv-modal__select"
                  value={formData.statut}
                  onChange={handleFormChange}
                >
                  <option value="En attente">En attente</option>
                  <option value="Confirmé">Confirmé</option>
                  <option value="En cours">En cours</option>
                  <option value="Annulé">Annulé</option>
                  <option value="Terminé">Terminé</option>
                </select>
              </div>

              {/* Notes libres */}
              <div className="rdv-modal__field">
                <label className="rdv-modal__label" htmlFor="rdv-notes">
                  Notes
                </label>
                <textarea
                  id="rdv-notes"
                  name="notes"
                  className="rdv-modal__textarea"
                  placeholder="Informations complémentaires…"
                  value={formData.notes}
                  onChange={handleFormChange}
                />
              </div>

              {/* Pied de modal — annuler / soumettre */}
              <div className="rdv-modal__footer">
                <button
                  type="button"
                  className="rdv-modal__cancel"
                  onClick={closeModal}
                >
                  Annuler
                </button>
                <button type="submit" className="rdv-modal__submit">
                  {modal.type === 'create'
                    ? 'Créer le rendez-vous'
                    : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
