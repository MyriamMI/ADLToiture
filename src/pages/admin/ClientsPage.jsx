import { useState, useEffect, useCallback } from 'react'
import './styles/ClientsPage.css'

/* ── Données de démonstration — remplacées par /api/clients.php ── */
const MOCK_CLIENTS = [
  {
    id: 1,
    nom: 'Jean Dupont',
    telephone: '+32 475 123 456',
    email: 'jean.dupont@email.com',
    localite: 'Namur',
    statut: 'Confirmé',
    date: '2026-04-24',
    notes: '',
  },
  {
    id: 2,
    nom: 'Marie Martin',
    telephone: '+32 498 234 567',
    email: 'marie.martin@email.com',
    localite: 'Liège',
    statut: 'Actif',
    date: '2026-04-22',
    notes: 'Cliente fidèle depuis 2 ans',
  },
  {
    id: 3,
    nom: 'Paul Bernard',
    telephone: '+32 471 345 678',
    email: 'paul.bernard@email.com',
    localite: 'Charleroi',
    statut: 'En attente',
    date: '2026-04-20',
    notes: '',
  },
  {
    id: 4,
    nom: 'Sophie Leroy',
    telephone: '+32 489 456 789',
    email: 'sophie.leroy@email.com',
    localite: 'Bruxelles',
    statut: 'Confirmé',
    date: '2026-04-18',
    notes: 'Préfère les RDV le matin',
  },
  {
    id: 5,
    nom: 'Luc Moreau',
    telephone: '+32 476 567 890',
    email: 'luc.moreau@email.com',
    localite: 'Mons',
    statut: 'Annulé',
    date: '2026-04-15',
    notes: 'Annulé suite déménagement',
  },
  {
    id: 6,
    nom: 'Isabelle Simon',
    telephone: '+32 495 678 901',
    email: 'isabelle.simon@email.com',
    localite: 'Namur',
    statut: 'Nouveau contact',
    date: '2026-04-12',
    notes: '',
  },
  {
    id: 7,
    nom: 'Thomas Petit',
    telephone: '+32 472 789 012',
    email: 'thomas.petit@email.com',
    localite: 'Gembloux',
    statut: 'Confirmé',
    date: '2026-04-10',
    notes: '',
  },
  {
    id: 8,
    nom: 'Claire Durand',
    telephone: '+32 499 890 123',
    email: 'claire.durand@email.com',
    localite: 'Namur',
    statut: 'En attente',
    date: '2026-04-08',
    notes: 'Devis demandé pour toiture plate',
  },
]

/* Onglets de filtre */
const TABS = [
  { label: 'Tous',        filter: null },
  { label: 'En Attente',  filter: 'En attente' },
  { label: 'Confirmé',    filter: 'Confirmé' },
  { label: 'Annulé',      filter: 'Annulé' },
]

/* Statuts disponibles dans le formulaire */
const STATUTS = [
  'Nouveau contact',
  'En attente',
  'Confirmé',
  'Actif',
  'Annulé',
  'Terminé',
]

/* Formulaire vide */
const EMPTY_FORM = {
  nom: '',
  telephone: '',
  email: '',
  localite: '',
  statut: 'Nouveau contact',
  notes: '',
}

/* ── Fonctions utilitaires ── */

function getInitials(nom) {
  return nom
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

function statusClass(statut) {
  switch (statut) {
    case 'En attente':     return 'status-badge--pending'
    case 'Confirmé':       return 'status-badge--confirmed'
    case 'Annulé':         return 'status-badge--cancelled'
    case 'Actif':          return 'status-badge--active'
    case 'Terminé':        return 'status-badge--done'
    case 'Nouveau contact':return 'status-badge--new'
    default:               return 'status-badge--new'
  }
}

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
export default function ClientsPage() {
  /* ── État ── */
  const [clients, setClients]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [activeTab, setActiveTab] = useState(null)

  /* Client sélectionné pour le panneau de détail */
  const [detail, setDetail] = useState(null)

  /* Modal formulaire : { type: 'create'|'edit'|null, client: null|object } */
  const [modal, setModal]     = useState({ type: null, client: null })
  const [formData, setFormData] = useState(EMPTY_FORM)

  /* ── Chargement des données ── */
  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('/api/clients.php')
        if (!res.ok) throw new Error()
        const json = await res.json()
        setClients(json)
      } catch {
        /* Repli sur les données de démonstration */
        setClients(MOCK_CLIENTS)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  /* ── Verrouillage du défilement quand une modal est ouverte ── */
  useEffect(() => {
    const isOpen = detail !== null || modal.type !== null
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [detail, modal.type])

  /* ── Filtrage combiné : recherche + onglet ── */
  const filtered = clients.filter((c) => {
    const matchSearch = c.nom.toLowerCase().includes(search.toLowerCase())
    const matchTab    = activeTab === null || c.statut === activeTab
    return matchSearch && matchTab
  })

  /* Compteur par statut pour les onglets */
  function countFor(filter) {
    if (!filter) {
      return search
        ? clients.filter((c) =>
            c.nom.toLowerCase().includes(search.toLowerCase())
          ).length
        : clients.length
    }
    return clients.filter(
      (c) =>
        c.statut === filter &&
        c.nom.toLowerCase().includes(search.toLowerCase())
    ).length
  }

  /* ══════════════════════════════
     Panneau de détail
  ══════════════════════════════ */

  function openDetail(client) {
    setDetail(client)
  }

  const closeDetail = useCallback(() => {
    setDetail(null)
  }, [])

  /* ══════════════════════════════
     Actions CRUD
  ══════════════════════════════ */

  function openCreateModal() {
    setFormData(EMPTY_FORM)
    setModal({ type: 'create', client: null })
  }

  function openEditModal(client) {
    setFormData({
      nom:       client.nom,
      telephone: client.telephone,
      email:     client.email,
      localite:  client.localite,
      statut:    client.statut,
      notes:     client.notes || '',
    })
    setModal({ type: 'edit', client })
    /* Fermer le panneau de détail avant d'ouvrir le formulaire */
    setDetail(null)
  }

  const closeModal = useCallback(() => {
    setModal({ type: null, client: null })
  }, [])

  function handleFormChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /* Créer un nouveau client */
  async function handleCreate(e) {
    e.preventDefault()
    const newClient = { ...formData, id: Date.now(), date: new Date().toISOString().slice(0, 10) }

    try {
      const res = await fetch('/api/clients.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        const created = await res.json()
        setClients((prev) => [created, ...prev])
        closeModal()
        return
      }
    } catch {
      /* API indisponible — mise à jour locale */
    }

    setClients((prev) => [newClient, ...prev])
    closeModal()
  }

  /* Enregistrer les modifications */
  async function handleUpdate(e) {
    e.preventDefault()
    const updated = { ...modal.client, ...formData }

    try {
      await fetch('/api/clients.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
    } catch {
      /* API indisponible — mise à jour locale */
    }

    setClients((prev) =>
      prev.map((c) => (c.id === modal.client.id ? updated : c))
    )
    closeModal()
  }

  /* Supprimer un client */
  async function handleDelete(id) {
    try {
      await fetch(`/api/clients.php?id=${id}`, { method: 'DELETE' })
    } catch {
      /* API indisponible — suppression locale */
    }
    setClients((prev) => prev.filter((c) => c.id !== id))
    closeDetail()
  }

  /* ── Rendu ── */
  if (loading) {
    return (
      <div className="cli-page">
        <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.875rem' }}>
          Chargement…
        </p>
      </div>
    )
  }

  return (
    <div className="cli-page">
      {/* ── En-tête de page ── */}
      <div className="cli-page__header">
        <h1 className="cli-page__title">Clients</h1>
        <button className="cli-page__new-btn" onClick={openCreateModal}>
          + Nouveau client
        </button>
      </div>

      {/* ── Champ de recherche ── */}
      <div className="cli-search-wrap">
        <input
          type="search"
          className="cli-search"
          placeholder="Rechercher un client…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Rechercher un client"
        />
      </div>

      {/* ── Onglets de filtre ── */}
      <div className="cli-tabs" role="tablist" aria-label="Filtrer par statut">
        {TABS.map(({ label, filter }) => (
          <button
            key={label}
            role="tab"
            aria-selected={activeTab === filter}
            className={
              'cli-tab' + (activeTab === filter ? ' cli-tab--active' : '')
            }
            onClick={() => setActiveTab(filter)}
          >
            {label}
            <span className="cli-tab__count">{countFor(filter)}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════
          Tableau — bureau
      ══════════════════════════════ */}
      <div className="cli-table-card">
        <div className="cli-table-wrap">
          <table className="cli-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Localité</th>
                <th>Date d'ajout</th>
                <th>Statut</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="cli-table__empty">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr key={client.id}>
                    {/* Cellule client avec avatar initiales */}
                    <td>
                      <div className="table-client">
                        <span className="table-avatar" aria-hidden="true">
                          {getInitials(client.nom)}
                        </span>
                        <span className="table-client__name">{client.nom}</span>
                      </div>
                    </td>

                    {/* Localité */}
                    <td>{client.localite}</td>

                    {/* Date d'ajout */}
                    <td>{formatDate(client.date)}</td>

                    {/* Badge de statut */}
                    <td>
                      <span
                        className={`status-badge ${statusClass(client.statut)}`}
                      >
                        {client.statut}
                      </span>
                    </td>

                    {/* Bouton d'information — ouvre le panneau de détail */}
                    <td>
                      <button
                        className="cli-info-btn"
                        title="Voir le profil"
                        aria-label={`Voir le profil de ${client.nom}`}
                        onClick={() => openDetail(client)}
                      >
                        ℹ
                      </button>
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
      <div className="cli-cards">
        {filtered.length === 0 && (
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(0,0,0,0.35)',
              fontSize: '0.875rem',
            }}
          >
            Aucun client trouvé.
          </p>
        )}
        {filtered.map((client) => (
          /* Toute la carte est cliquable pour ouvrir le détail */
          <div
            key={client.id}
            className="cli-card"
            role="button"
            tabIndex={0}
            aria-label={`Voir le profil de ${client.nom}`}
            onClick={() => openDetail(client)}
            onKeyDown={(e) => e.key === 'Enter' && openDetail(client)}
          >
            {/* Avatar initiales */}
            <span className="table-avatar" aria-hidden="true">
              {getInitials(client.nom)}
            </span>

            {/* Informations textuelles */}
            <div className="cli-card__info">
              <p className="cli-card__name">{client.nom}</p>
              <p className="cli-card__meta">
                {client.localite} · {formatDate(client.date)}
              </p>
            </div>

            {/* Badge de statut */}
            <span className={`status-badge ${statusClass(client.statut)}`}>
              {client.statut}
            </span>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════
          Panneau de détail client
      ══════════════════════════════ */}
      {detail !== null && (
        /* Fermeture en cliquant sur le fond */
        <div
          className="cli-detail"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cli-detail-name"
          onClick={closeDetail}
        >
          <div
            className="cli-detail__panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête — grand avatar + nom + statut */}
            <div className="cli-detail__head">
              <button
                className="cli-detail__close"
                onClick={closeDetail}
                aria-label="Fermer"
              >
                ×
              </button>
              <div className="cli-detail__avatar" aria-hidden="true">
                {getInitials(detail.nom)}
              </div>
              <h2 className="cli-detail__name" id="cli-detail-name">
                {detail.nom}
              </h2>
              <span
                className={`status-badge ${statusClass(detail.statut)}`}
              >
                {detail.statut}
              </span>
            </div>

            {/* Corps — informations du contact */}
            <div className="cli-detail__body">
              {/* Téléphone */}
              <div className="cli-detail__row">
                <span className="cli-detail__row-icon" aria-hidden="true">
                  📞
                </span>
                <div>
                  <p className="cli-detail__row-label">Téléphone</p>
                  <p className="cli-detail__row-value">
                    {detail.telephone || '—'}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="cli-detail__row">
                <span className="cli-detail__row-icon" aria-hidden="true">
                  ✉
                </span>
                <div>
                  <p className="cli-detail__row-label">Email</p>
                  <p className="cli-detail__row-value">
                    {detail.email || '—'}
                  </p>
                </div>
              </div>

              {/* Localité */}
              <div className="cli-detail__row">
                <span className="cli-detail__row-icon" aria-hidden="true">
                  📍
                </span>
                <div>
                  <p className="cli-detail__row-label">Localité</p>
                  <p className="cli-detail__row-value">
                    {detail.localite || '—'}
                  </p>
                </div>
              </div>

              {/* Date d'ajout */}
              <div className="cli-detail__row">
                <span className="cli-detail__row-icon" aria-hidden="true">
                  📅
                </span>
                <div>
                  <p className="cli-detail__row-label">Ajouté le</p>
                  <p className="cli-detail__row-value">
                    {formatDate(detail.date)}
                  </p>
                </div>
              </div>

              {/* Notes — affichées uniquement si présentes */}
              {detail.notes && (
                <>
                  <hr className="cli-detail__divider" />
                  <div className="cli-detail__row">
                    <span className="cli-detail__row-icon" aria-hidden="true">
                      📝
                    </span>
                    <div>
                      <p className="cli-detail__row-label">Notes</p>
                      <p className="cli-detail__notes">{detail.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pied — actions */}
            <div className="cli-detail__footer">
              {/* Suppression du contact */}
              <button
                className="cli-detail__delete-btn"
                onClick={() => handleDelete(detail.id)}
              >
                Supprimer le contact
              </button>
              {/* Ouverture du formulaire de modification */}
              <button
                className="cli-detail__edit-btn"
                onClick={() => openEditModal(detail)}
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          Modal — Nouveau / Modifier client
      ══════════════════════════════ */}
      {modal.type !== null && (
        <div
          className="cli-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cli-modal-title"
          onClick={closeModal}
        >
          <div
            className="cli-modal__dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête rouge foncé */}
            <div className="cli-modal__header">
              <h2 className="cli-modal__title" id="cli-modal-title">
                {modal.type === 'create' ? 'Nouveau client' : 'Modifier le client'}
              </h2>
              <button
                className="cli-modal__close"
                onClick={closeModal}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            {/* Corps — formulaire */}
            <form
              className="cli-modal__body"
              onSubmit={modal.type === 'create' ? handleCreate : handleUpdate}
            >
              {/* Nom complet */}
              <div className="cli-modal__field">
                <label className="cli-modal__label" htmlFor="cli-nom">
                  Nom complet
                </label>
                <input
                  id="cli-nom"
                  name="nom"
                  type="text"
                  className="cli-modal__input"
                  placeholder="Prénom Nom"
                  value={formData.nom}
                  onChange={handleFormChange}
                  required
                />
              </div>

              {/* Téléphone */}
              <div className="cli-modal__field">
                <label className="cli-modal__label" htmlFor="cli-telephone">
                  Téléphone
                </label>
                <input
                  id="cli-telephone"
                  name="telephone"
                  type="tel"
                  className="cli-modal__input"
                  placeholder="+32 4XX XXX XXX"
                  value={formData.telephone}
                  onChange={handleFormChange}
                />
              </div>

              {/* Email */}
              <div className="cli-modal__field">
                <label className="cli-modal__label" htmlFor="cli-email">
                  Email
                </label>
                <input
                  id="cli-email"
                  name="email"
                  type="email"
                  className="cli-modal__input"
                  placeholder="adresse@email.com"
                  value={formData.email}
                  onChange={handleFormChange}
                />
              </div>

              {/* Localité */}
              <div className="cli-modal__field">
                <label className="cli-modal__label" htmlFor="cli-localite">
                  Localité
                </label>
                <input
                  id="cli-localite"
                  name="localite"
                  type="text"
                  className="cli-modal__input"
                  placeholder="Ville ou commune"
                  value={formData.localite}
                  onChange={handleFormChange}
                />
              </div>

              {/* Statut — Nouveau contact par défaut */}
              <div className="cli-modal__field">
                <label className="cli-modal__label" htmlFor="cli-statut">
                  Statut
                </label>
                <select
                  id="cli-statut"
                  name="statut"
                  className="cli-modal__select"
                  value={formData.statut}
                  onChange={handleFormChange}
                >
                  {STATUTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes libres */}
              <div className="cli-modal__field">
                <label className="cli-modal__label" htmlFor="cli-notes">
                  Notes
                </label>
                <textarea
                  id="cli-notes"
                  name="notes"
                  className="cli-modal__textarea"
                  placeholder="Informations complémentaires…"
                  value={formData.notes}
                  onChange={handleFormChange}
                />
              </div>

              {/* Pied — annuler / soumettre */}
              <div className="cli-modal__footer">
                <button
                  type="button"
                  className="cli-modal__cancel"
                  onClick={closeModal}
                >
                  Annuler
                </button>
                <button type="submit" className="cli-modal__submit">
                  {modal.type === 'create'
                    ? 'Créer le client'
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
