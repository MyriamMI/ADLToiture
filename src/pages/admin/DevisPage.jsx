import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './styles/DevisPage.css'

/* ── Données de démonstration — remplacées par /api/devis.php ── */
const MOCK_DEVIS = [
  {
    id: 1,
    client: 'Jean Dupont',
    date: '2026-04-28',
    service: 'Rénovation toiture',
    montant: 4408.48,
    statut: 'En attente',
    notes: 'Toiture en ardoises naturelles, accès difficile',
    tva: 6,
    lignes: [
      { id: 1, description: 'Dépose ancienne toiture',    qte: 1,  prixUnit: 800 },
      { id: 2, description: 'Fourniture ardoises (m²)',   qte: 80, prixUnit: 42  },
      { id: 3, description: 'Pose et finitions',          qte: 1,  prixUnit: 660 },
    ],
  },
  {
    id: 2,
    client: 'Marie Martin',
    date: '2026-04-22',
    service: 'Pose neuve',
    montant: 15125.00,
    statut: 'Accepté',
    notes: '',
    tva: 21,
    lignes: [
      { id: 4, description: 'Charpente et lattage',       qte: 1,  prixUnit: 3500 },
      { id: 5, description: 'Tuiles en béton (m²)',       qte: 120, prixUnit: 48  },
      { id: 6, description: 'Isolation et pare-vapeur',   qte: 1,  prixUnit: 2500 },
    ],
  },
  {
    id: 3,
    client: 'Paul Bernard',
    date: '2026-04-18',
    service: 'Zinguerie',
    montant: 1909.80,
    statut: 'Envoyé',
    notes: 'Remplacement gouttières zinc',
    tva: 6,
    lignes: [
      { id: 7, description: 'Fourniture gouttières zinc', qte: 24, prixUnit: 35 },
      { id: 8, description: 'Pose et soudures',           qte: 1,  prixUnit: 680 },
    ],
  },
  {
    id: 4,
    client: 'Sophie Leroy',
    date: '2026-04-15',
    service: 'Isolation combles',
    montant: 3872.00,
    statut: 'Refusé',
    notes: '',
    tva: 21,
    lignes: [
      { id: 9,  description: 'Laine de verre (m²)',       qte: 90, prixUnit: 18 },
      { id: 10, description: 'Pose et finitions',         qte: 1,  prixUnit: 980 },
    ],
  },
  {
    id: 5,
    client: 'Isabelle Simon',
    date: '2026-04-10',
    service: 'Inspection toiture',
    montant: 477.00,
    statut: 'Envoyé',
    notes: '',
    tva: 6,
    lignes: [
      { id: 11, description: 'Inspection complète',       qte: 1,  prixUnit: 450 },
    ],
  },
  {
    id: 6,
    client: 'Thomas Petit',
    date: '2026-04-08',
    service: 'Traitement hydrofuge',
    montant: 826.80,
    statut: 'Accepté',
    notes: '',
    tva: 6,
    lignes: [
      { id: 12, description: 'Produit hydrofuge (L)',     qte: 20, prixUnit: 18 },
      { id: 13, description: 'Application',               qte: 1,  prixUnit: 441 },
    ],
  },
]

/* Clients disponibles pour le formulaire */
const CLIENTS_LIST = [
  'Jean Dupont', 'Marie Martin', 'Paul Bernard',
  'Sophie Leroy', 'Luc Moreau', 'Isabelle Simon',
  'Thomas Petit', 'Claire Durand',
]

/* Onglets de filtre */
const TABS = [
  { label: 'Tous',       filter: null },
  { label: 'En attente', filter: 'En attente' },
  { label: 'Envoyé',     filter: 'Envoyé' },
  { label: 'Accepté',    filter: 'Accepté' },
  { label: 'Refusé',     filter: 'Refusé' },
]

/* Ligne vide pour le formulaire */
function emptyLigne(id) {
  return { id, description: '', qte: 1, prixUnit: 0 }
}

const EMPTY_FORM = {
  client: '',
  date: '',
  notes: '',
  tva: 6,
  lignes: [],
}

/* ── Fonctions utilitaires ── */

function getInitials(name) {
  return name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

function statusClass(statut) {
  switch (statut) {
    case 'En attente': return 'status-badge--pending'
    case 'Envoyé':     return 'status-badge--sent'
    case 'Accepté':    return 'status-badge--accepted'
    case 'Refusé':     return 'status-badge--refused'
    default:           return 'status-badge--pending'
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('fr-BE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatEUR(val) {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency', currency: 'EUR',
  }).format(val)
}

/* Calcule le sous-total HT à partir des lignes */
function calcSousTotal(lignes) {
  return lignes.reduce((sum, l) => sum + l.qte * l.prixUnit, 0)
}

/* ══════════════════════════════════════════
   Composant principal
══════════════════════════════════════════ */
export default function DevisPage() {
  /* ── État principal ── */
  const [devisList, setDevisList] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [activeTab, setActiveTab] = useState(null)
  const [openMenu, setOpenMenu]   = useState(null)

  /* Modal : { type: null|'create'|'edit', devis: null|object } */
  const [modal, setModal]       = useState({ type: null, devis: null })
  const [formData, setFormData] = useState(EMPTY_FORM)

  /* Compteur d'identifiants pour les nouvelles lignes */
  const nextLineId = useRef(200)

  /* ── Chargement des données ── */
  useEffect(() => {
    async function fetchDevis() {
      try {
        const res = await fetch('/api/devis.php')
        if (!res.ok) throw new Error()
        const json = await res.json()
        setDevisList(json)
      } catch {
        /* Repli sur les données de démonstration */
        setDevisList(MOCK_DEVIS)
      } finally {
        setLoading(false)
      }
    }
    fetchDevis()
  }, [])

  /* ── Verrouillage du défilement quand la modal est ouverte ── */
  useEffect(() => {
    document.body.style.overflow = modal.type ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modal.type])

  /* ── Filtrage combiné ── */
  const filtered = devisList.filter((d) => {
    const matchSearch = d.client.toLowerCase().includes(search.toLowerCase())
    const matchTab    = activeTab === null || d.statut === activeTab
    return matchSearch && matchTab
  })

  function countFor(filter) {
    const base = search
      ? devisList.filter((d) => d.client.toLowerCase().includes(search.toLowerCase()))
      : devisList
    return filter ? base.filter((d) => d.statut === filter).length : base.length
  }

  /* ── Calculs du récapitulatif financier ── */
  const sousTotal = calcSousTotal(formData.lignes)
  const tvaAmount = sousTotal * (formData.tva / 100)
  const totalTTC  = sousTotal + tvaAmount

  /* ══════════════════════════════
     Actions CRUD
  ══════════════════════════════ */

  function openCreateModal() {
    setFormData({
      ...EMPTY_FORM,
      lignes: [emptyLigne(nextLineId.current++)],
    })
    setModal({ type: 'create', devis: null })
  }

  function openEditModal(devis) {
    setFormData({
      client: devis.client,
      date:   devis.date,
      notes:  devis.notes || '',
      tva:    devis.tva ?? 6,
      /* Copie profonde des lignes pour éviter de muter le state principal */
      lignes: devis.lignes.map((l) => ({ ...l })),
    })
    setModal({ type: 'edit', devis })
    setOpenMenu(null)
  }

  const closeModal = useCallback(() => {
    setModal({ type: null, devis: null })
  }, [])

  /* Mise à jour des champs simples du formulaire */
  function handleFormChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /* Mise à jour d'un champ d'une ligne */
  function handleLigneChange(id, field, raw) {
    const value = field === 'description' ? raw : parseFloat(raw) || 0
    setFormData((prev) => ({
      ...prev,
      lignes: prev.lignes.map((l) =>
        l.id === id ? { ...l, [field]: value } : l
      ),
    }))
  }

  /* Ajout d'une nouvelle ligne vide */
  function addLigne() {
    setFormData((prev) => ({
      ...prev,
      lignes: [...prev.lignes, emptyLigne(nextLineId.current++)],
    }))
  }

  /* Suppression d'une ligne */
  function removeLigne(id) {
    setFormData((prev) => ({
      ...prev,
      lignes: prev.lignes.filter((l) => l.id !== id),
    }))
  }

  /* Créer un nouveau devis */
  async function handleCreate(e) {
    e.preventDefault()
    const newDevis = {
      ...formData,
      id:      Date.now(),
      service: formData.lignes[0]?.description || 'Divers',
      montant: totalTTC,
      statut:  'En attente',
    }

    try {
      const res = await fetch('/api/devis.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, montant: totalTTC }),
      })
      if (res.ok) {
        const created = await res.json()
        setDevisList((prev) => [created, ...prev])
        closeModal()
        return
      }
    } catch {
      /* API indisponible — mise à jour locale */
    }

    setDevisList((prev) => [newDevis, ...prev])
    closeModal()
  }

  /* Enregistrer les modifications */
  async function handleUpdate(e) {
    e.preventDefault()
    const updated = {
      ...modal.devis,
      ...formData,
      service: formData.lignes[0]?.description || modal.devis.service,
      montant: totalTTC,
    }

    try {
      await fetch('/api/devis.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
    } catch {
      /* API indisponible — mise à jour locale */
    }

    setDevisList((prev) =>
      prev.map((d) => (d.id === modal.devis.id ? updated : d))
    )
    closeModal()
  }

  /* Supprimer un devis */
  async function handleDelete(id) {
    try {
      await fetch(`/api/devis.php?id=${id}`, { method: 'DELETE' })
    } catch {
      /* API indisponible — suppression locale */
    }
    setDevisList((prev) => prev.filter((d) => d.id !== id))
    setOpenMenu(null)
  }

  /* Générer le PDF — à implémenter avec une bibliothèque PDF */
  function handleGeneratePDF(devis) {
    console.info('Génération PDF pour :', devis.client, devis.id)
    setOpenMenu(null)
  }

  /* ── Rendu ── */
  if (loading) {
    return (
      <div className="dv-page">
        <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.875rem' }}>
          Chargement…
        </p>
      </div>
    )
  }

  return (
    <div className="dv-page">
      {/* ── En-tête de page ── */}
      <div className="dv-page__header">
        <h1 className="dv-page__title">Devis</h1>

        {/* Groupe de boutons */}
        <div className="dv-page__actions">
          {/* Lien vers le calculateur — construit dans la prochaine étape */}
          <Link
            to="/admin/devis/calculateur"
            className="dv-page__calc-btn"
          >
            Calculateur Devis →
          </Link>
          <button className="dv-page__new-btn" onClick={openCreateModal}>
            + Nouveau Devis
          </button>
        </div>
      </div>

      {/* ── Barre d'outils : recherche + onglets ── */}
      <div className="dv-toolbar">
        {/* Champ de recherche */}
        <div className="dv-search-wrap">
          <input
            type="search"
            className="dv-search"
            placeholder="Rechercher un client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher un devis"
          />
        </div>

        {/* Onglets de filtre par statut */}
        <div className="dv-tabs" role="tablist" aria-label="Filtrer par statut">
          {TABS.map(({ label, filter }) => (
            <button
              key={label}
              role="tab"
              aria-selected={activeTab === filter}
              className={
                'dv-tab' + (activeTab === filter ? ' dv-tab--active' : '')
              }
              onClick={() => setActiveTab(filter)}
            >
              {label}
              <span className="dv-tab__count">{countFor(filter)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tableau des devis ── */}
      <div className="dv-table-card">
        <div className="dv-table-wrap">
          <table className="dv-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Date</th>
                <th>Service</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="dv-table__empty">
                    Aucun devis trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((devis) => (
                  <tr key={devis.id}>
                    {/* Cellule client avec avatar */}
                    <td>
                      <div className="table-client">
                        <span className="table-avatar" aria-hidden="true">
                          {getInitials(devis.client)}
                        </span>
                        <span className="table-client__name">
                          {devis.client}
                        </span>
                      </div>
                    </td>

                    {/* Date du devis */}
                    <td>{formatDate(devis.date)}</td>

                    {/* Service principal */}
                    <td>{devis.service}</td>

                    {/* Montant TTC en rouge gras */}
                    <td>
                      <span className="dv-montant">
                        {formatEUR(devis.montant)}
                      </span>
                    </td>

                    {/* Badge de statut */}
                    <td>
                      <span
                        className={`status-badge ${statusClass(devis.statut)}`}
                      >
                        {devis.statut}
                      </span>
                    </td>

                    {/* Menu d'actions "···" */}
                    <td>
                      <div className="dv-menu-wrap">
                        <button
                          className={
                            'dv-dots-btn' +
                            (openMenu === devis.id ? ' dv-dots-btn--open' : '')
                          }
                          aria-label={`Actions pour ${devis.client}`}
                          aria-haspopup="true"
                          aria-expanded={openMenu === devis.id}
                          onClick={() =>
                            setOpenMenu((prev) =>
                              prev === devis.id ? null : devis.id
                            )
                          }
                        >
                          ···
                        </button>

                        {/* Menu déroulant */}
                        {openMenu === devis.id && (
                          <div className="dv-dropdown" role="menu">
                            <button
                              className="dv-dropdown__item"
                              role="menuitem"
                              onClick={() => openEditModal(devis)}
                            >
                              ✏ Modifier
                            </button>
                            <button
                              className="dv-dropdown__item"
                              role="menuitem"
                              onClick={() => handleGeneratePDF(devis)}
                            >
                              📄 Générer PDF
                            </button>
                            <button
                              className="dv-dropdown__item dv-dropdown__item--danger"
                              role="menuitem"
                              onClick={() => handleDelete(devis.id)}
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

      {/* ── Couche transparente pour fermer le menu ouvert ── */}
      {openMenu !== null && (
        <div
          className="dv-menu-overlay"
          onClick={() => setOpenMenu(null)}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════
          Modal — Nouveau / Modifier devis
      ══════════════════════════════ */}
      {modal.type !== null && (
        <div
          className="dv-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dv-modal-title"
          onClick={closeModal}
        >
          <div
            className="dv-modal__dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête rouge foncé */}
            <div className="dv-modal__header">
              <h2 className="dv-modal__title" id="dv-modal-title">
                {modal.type === 'create' ? 'Nouveau devis' : 'Modifier le devis'}
              </h2>
              <button
                className="dv-modal__close"
                onClick={closeModal}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            {/* Corps — formulaire */}
            <form
              className="dv-modal__body"
              onSubmit={modal.type === 'create' ? handleCreate : handleUpdate}
            >
              {/* Client + Date sur la même ligne */}
              <div className="dv-modal__row">
                {/* Sélection du client */}
                <div className="dv-modal__field">
                  <label className="dv-modal__label" htmlFor="dv-client">
                    Client
                  </label>
                  <select
                    id="dv-client"
                    name="client"
                    className="dv-modal__select"
                    value={formData.client}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">— Sélectionner —</option>
                    {CLIENTS_LIST.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Date du devis */}
                <div className="dv-modal__field">
                  <label className="dv-modal__label" htmlFor="dv-date">
                    Date du devis
                  </label>
                  <input
                    id="dv-date"
                    name="date"
                    type="date"
                    className="dv-modal__input"
                    value={formData.date}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              {/* ── Tableau des lignes de devis ── */}
              <div>
                <p className="dv-modal__section-title">Lignes du devis</p>

                <div className="dv-lines">
                  {/* Tableau des prestations */}
                  <div className="dv-lines__wrap">
                    <table className="dv-lines__table">
                      <thead>
                        <tr>
                          <th className="dv-lines__col-desc">
                            Service / Description
                          </th>
                          <th className="dv-lines__col-qty">Qté</th>
                          <th className="dv-lines__col-price">
                            Prix unit. (€)
                          </th>
                          <th className="dv-lines__col-total">Total</th>
                          <th className="dv-lines__col-del" />
                        </tr>
                      </thead>
                      <tbody>
                        {formData.lignes.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              style={{
                                textAlign: 'center',
                                padding: '1rem',
                                color: 'rgba(0,0,0,0.35)',
                                fontSize: '0.8125rem',
                              }}
                            >
                              Aucune ligne — cliquez sur « + Ajouter une ligne »
                            </td>
                          </tr>
                        ) : (
                          formData.lignes.map((ligne) => (
                            <tr key={ligne.id}>
                              {/* Description de la prestation */}
                              <td className="dv-lines__col-desc">
                                <input
                                  type="text"
                                  className="dv-lines__input"
                                  placeholder="Description…"
                                  value={ligne.description}
                                  onChange={(e) =>
                                    handleLigneChange(
                                      ligne.id,
                                      'description',
                                      e.target.value
                                    )
                                  }
                                />
                              </td>

                              {/* Quantité */}
                              <td className="dv-lines__col-qty">
                                <input
                                  type="number"
                                  className="dv-lines__input dv-lines__input--number"
                                  min="0"
                                  step="1"
                                  value={ligne.qte}
                                  onChange={(e) =>
                                    handleLigneChange(
                                      ligne.id,
                                      'qte',
                                      e.target.value
                                    )
                                  }
                                />
                              </td>

                              {/* Prix unitaire */}
                              <td className="dv-lines__col-price">
                                <input
                                  type="number"
                                  className="dv-lines__input dv-lines__input--number"
                                  min="0"
                                  step="0.01"
                                  value={ligne.prixUnit}
                                  onChange={(e) =>
                                    handleLigneChange(
                                      ligne.id,
                                      'prixUnit',
                                      e.target.value
                                    )
                                  }
                                />
                              </td>

                              {/* Total calculé — lecture seule */}
                              <td className="dv-lines__col-total">
                                <span className="dv-lines__total">
                                  {formatEUR(ligne.qte * ligne.prixUnit)}
                                </span>
                              </td>

                              {/* Bouton suppression de la ligne */}
                              <td className="dv-lines__col-del">
                                <button
                                  type="button"
                                  className="dv-lines__del-btn"
                                  aria-label="Supprimer cette ligne"
                                  onClick={() => removeLigne(ligne.id)}
                                >
                                  ×
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Bouton ajout d'une nouvelle ligne */}
                  <button
                    type="button"
                    className="dv-lines__add-btn"
                    onClick={addLigne}
                  >
                    + Ajouter une ligne
                  </button>
                </div>
              </div>

              {/* ── Notes libres ── */}
              <div className="dv-modal__field">
                <label className="dv-modal__label" htmlFor="dv-notes">
                  Notes
                </label>
                <textarea
                  id="dv-notes"
                  name="notes"
                  className="dv-modal__textarea"
                  placeholder="Informations complémentaires…"
                  value={formData.notes}
                  onChange={handleFormChange}
                />
              </div>

              {/* ── Récapitulatif financier ── */}
              <div className="dv-summary">
                {/* Sous-total hors taxes */}
                <div className="dv-summary__row">
                  <span className="dv-summary__label">Sous-total HT</span>
                  <span className="dv-summary__value">
                    {formatEUR(sousTotal)}
                  </span>
                </div>

                {/* Sélection du taux de TVA */}
                <div className="dv-summary__tva-row">
                  <span className="dv-summary__tva-label">
                    TVA
                    <div className="dv-tva-toggle" role="group" aria-label="Taux de TVA">
                      <button
                        type="button"
                        className={
                          'dv-tva-btn' +
                          (formData.tva === 6 ? ' dv-tva-btn--active' : '')
                        }
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, tva: 6 }))
                        }
                      >
                        6%
                      </button>
                      <button
                        type="button"
                        className={
                          'dv-tva-btn' +
                          (formData.tva === 21 ? ' dv-tva-btn--active' : '')
                        }
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, tva: 21 }))
                        }
                      >
                        21%
                      </button>
                    </div>
                  </span>
                  <span className="dv-summary__value">
                    {formatEUR(tvaAmount)}
                  </span>
                </div>

                <hr className="dv-summary__divider" />

                {/* Total TTC mis en évidence */}
                <div className="dv-summary__total-row">
                  <span className="dv-summary__total-label">Total TTC</span>
                  <span className="dv-summary__total-value">
                    {formatEUR(totalTTC)}
                  </span>
                </div>
              </div>

              {/* Pied de modal — annuler / soumettre */}
              <div className="dv-modal__footer">
                <button
                  type="button"
                  className="dv-modal__cancel"
                  onClick={closeModal}
                >
                  Annuler
                </button>
                <button type="submit" className="dv-modal__submit">
                  {modal.type === 'create'
                    ? 'Créer le devis'
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
