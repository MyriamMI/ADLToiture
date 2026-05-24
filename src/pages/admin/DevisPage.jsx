import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getDevis, createDevis, updateDevis, deleteDevis } from '../../services/api'
import './styles/DevisPage.css'

const TABS = [
  { label: 'Tous',       filter: null },
  { label: 'Brouillon',  filter: 'brouillon' },
  { label: 'Envoyé',     filter: 'envoye' },
  { label: 'Accepté',    filter: 'accepte' },
  { label: 'Refusé',     filter: 'refuse' },
]

const STATUS_LABEL = {
  brouillon: 'Brouillon',
  envoye:    'Envoyé',
  accepte:   'Accepté',
  refuse:    'Refusé',
}

function emptyLigne(id) {
  return { id, description: '', quantite: 1, prix_unitaire: 0 }
}

const EMPTY_FORM = {
  client_id:     '',
  date_creation: '',
  notes:         '',
  tva:           6,
  lignes:        [],
}

/* ── Fonctions utilitaires ── */

function getInitials(name) {
  if (!name) return '?'
  return String(name).split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

function statusClass(statut) {
  switch (statut) {
    case 'brouillon': return 'status-badge--draft'
    case 'envoye':    return 'status-badge--sent'
    case 'accepte':   return 'status-badge--accepted'
    case 'refuse':    return 'status-badge--refused'
    default:          return 'status-badge--draft'
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso.replace(' ', 'T')).toLocaleDateString('fr-BE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatEUR(val) {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency', currency: 'EUR',
  }).format(val ?? 0)
}

function calcSousTotal(lignes) {
  return lignes.reduce((sum, l) => sum + l.quantite * l.prix_unitaire, 0)
}

/* ══════════════════════════════════════════
   Composant principal
══════════════════════════════════════════ */
export default function DevisPage() {
  const [devisList, setDevisList] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [activeTab, setActiveTab] = useState(null)
  const [openMenu, setOpenMenu]   = useState(null)

  const [modal, setModal]       = useState({ type: null, devis: null })
  const [formData, setFormData] = useState(EMPTY_FORM)

  const nextLineId = useRef(200)

  /* ── Chargement des données ── */
  useEffect(() => {
    getDevis()
      .then(setDevisList)
      .catch(() => setDevisList([]))
      .finally(() => setLoading(false))
  }, [])

  /* ── Verrouillage du défilement quand la modal est ouverte ── */
  useEffect(() => {
    document.body.style.overflow = modal.type ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modal.type])

  /* ── Filtrage combiné ── */
  const filtered = devisList.filter((d) => {
    const matchSearch = (d.client_nom ?? '').toLowerCase().includes(search.toLowerCase())
    const matchTab    = activeTab === null || d.statut === activeTab
    return matchSearch && matchTab
  })

  function countFor(filter) {
    const base = search
      ? devisList.filter((d) => (d.client_nom ?? '').toLowerCase().includes(search.toLowerCase()))
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
      client_id:     devis.client_id ?? '',
      date_creation: devis.date_creation ? devis.date_creation.slice(0, 10) : '',
      notes:         devis.notes ?? '',
      tva:           devis.tva ?? 6,
      lignes:        (devis.lignes ?? []).map((l) => ({
        id:           l.id ?? nextLineId.current++,
        description:  l.description ?? '',
        quantite:     l.quantite ?? 1,
        prix_unitaire: l.prix_unitaire ?? 0,
      })),
    })
    setModal({ type: 'edit', devis })
    setOpenMenu(null)
  }

  const closeModal = useCallback(() => {
    setModal({ type: null, devis: null })
  }, [])

  function handleFormChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleLigneChange(id, field, raw) {
    const value = field === 'description' ? raw : parseFloat(raw) || 0
    setFormData((prev) => ({
      ...prev,
      lignes: prev.lignes.map((l) =>
        l.id === id ? { ...l, [field]: value } : l
      ),
    }))
  }

  function addLigne() {
    setFormData((prev) => ({
      ...prev,
      lignes: [...prev.lignes, emptyLigne(nextLineId.current++)],
    }))
  }

  function removeLigne(id) {
    setFormData((prev) => ({
      ...prev,
      lignes: prev.lignes.filter((l) => l.id !== id),
    }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    const payload = {
      client_id:     parseInt(formData.client_id, 10),
      service:       formData.lignes[0]?.description || 'Divers',
      statut:        'brouillon',
      date_creation: formData.date_creation || new Date().toISOString().slice(0, 10),
      tva:           formData.tva,
      montant_ht:    sousTotal,
      montant_tva:   tvaAmount,
      montant_ttc:   totalTTC,
      notes:         formData.notes,
      lignes:        formData.lignes.map(({ description, quantite, prix_unitaire }) => ({
        description, quantite, prix_unitaire,
      })),
    }
    try {
      const created = await createDevis(payload)
      setDevisList((prev) => [created, ...prev])
    } catch {
      /* Optimiste local si l'API échoue */
      setDevisList((prev) => [{ ...payload, id: Date.now(), client_nom: '' }, ...prev])
    }
    closeModal()
  }

  async function handleUpdate(e) {
    e.preventDefault()
    const payload = {
      client_id:    parseInt(formData.client_id, 10),
      service:      formData.lignes[0]?.description || modal.devis.service,
      tva:          formData.tva,
      montant_ht:   sousTotal,
      montant_tva:  tvaAmount,
      montant_ttc:  totalTTC,
      notes:        formData.notes,
      lignes:       formData.lignes.map(({ description, quantite, prix_unitaire }) => ({
        description, quantite, prix_unitaire,
      })),
    }
    try {
      await updateDevis(modal.devis.id, payload)
    } catch { /* API indisponible */ }
    setDevisList((prev) =>
      prev.map((d) => (d.id === modal.devis.id ? { ...d, ...payload } : d))
    )
    closeModal()
  }

  async function handleDelete(id) {
    try {
      await deleteDevis(id)
    } catch { /* API indisponible */ }
    setDevisList((prev) => prev.filter((d) => d.id !== id))
    setOpenMenu(null)
  }

  function handleGeneratePDF(devis) {
    console.info('Génération PDF pour :', devis.client_nom, devis.id)
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

        <div className="dv-page__actions">
<button className="dv-page__new-btn" onClick={openCreateModal}>
            <i className="fas fa-plus"></i> Nouveau Devis
          </button>
        </div>
      </div>

      {/* ── Barre d'outils : recherche + onglets ── */}
      <div className="dv-toolbar">
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

        <div className="dv-tabs" role="tablist" aria-label="Filtrer par statut">
          {TABS.map(({ label, filter }) => (
            <button
              key={label}
              role="tab"
              aria-selected={activeTab === filter}
              className={'dv-tab' + (activeTab === filter ? ' dv-tab--active' : '')}
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
                    <td>
                      <div className="table-client">
                        <span className="table-avatar" aria-hidden="true">
                          {getInitials(devis.client_nom)}
                        </span>
                        <span className="table-client__name">{devis.client_nom}</span>
                      </div>
                    </td>

                    <td>{formatDate(devis.date_creation)}</td>

                    <td>{devis.service}</td>

                    <td>
                      <span className="dv-montant">{formatEUR(devis.montant_ttc)}</span>
                    </td>

                    <td>
                      <span className={`status-badge ${statusClass(devis.statut)}`}>
                        {STATUS_LABEL[devis.statut] ?? devis.statut}
                      </span>
                    </td>

                    <td>
                      <div className="dv-menu-wrap">
                        <button
                          className={
                            'dv-dots-btn' +
                            (openMenu === devis.id ? ' dv-dots-btn--open' : '')
                          }
                          aria-label={`Actions pour ${devis.client_nom}`}
                          aria-haspopup="true"
                          aria-expanded={openMenu === devis.id}
                          onClick={() =>
                            setOpenMenu((prev) => prev === devis.id ? null : devis.id)
                          }
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </button>

                        {openMenu === devis.id && (
                          <div className="dv-dropdown" role="menu">
                            <button
                              className="dv-dropdown__item"
                              role="menuitem"
                              onClick={() => openEditModal(devis)}
                            >
                              <i className="fas fa-pen"></i> Modifier
                            </button>
                            <button
                              className="dv-dropdown__item"
                              role="menuitem"
                              onClick={() => handleGeneratePDF(devis)}
                            >
                              <i className="fas fa-file-pdf"></i> Générer PDF
                            </button>
                            <button
                              className="dv-dropdown__item dv-dropdown__item--danger"
                              role="menuitem"
                              onClick={() => handleDelete(devis.id)}
                            >
                              <i className="fas fa-trash"></i> Supprimer
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
          <div className="dv-modal__dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dv-modal__header">
              <h2 className="dv-modal__title" id="dv-modal-title">
                {modal.type === 'create' ? 'Nouveau devis' : 'Modifier le devis'}
              </h2>
              <button className="dv-modal__close" onClick={closeModal} aria-label="Fermer">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form
              className="dv-modal__body"
              onSubmit={modal.type === 'create' ? handleCreate : handleUpdate}
            >
              {/* Client ID + Date sur la même ligne */}
              <div className="dv-modal__row">
                <div className="dv-modal__field">
                  <label className="dv-modal__label" htmlFor="dv-client-id">
                    ID Client
                  </label>
                  <input
                    id="dv-client-id"
                    name="client_id"
                    type="number"
                    min="1"
                    className="dv-modal__input"
                    placeholder="Ex : 12"
                    value={formData.client_id}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="dv-modal__field">
                  <label className="dv-modal__label" htmlFor="dv-date">
                    Date du devis
                  </label>
                  <input
                    id="dv-date"
                    name="date_creation"
                    type="date"
                    className="dv-modal__input"
                    value={formData.date_creation}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              {/* ── Tableau des lignes de devis ── */}
              <div>
                <p className="dv-modal__section-title">Lignes du devis</p>

                <div className="dv-lines">
                  <div className="dv-lines__wrap">
                    <table className="dv-lines__table">
                      <thead>
                        <tr>
                          <th className="dv-lines__col-desc">Service / Description</th>
                          <th className="dv-lines__col-qty">Qté</th>
                          <th className="dv-lines__col-price">Prix unit. (€)</th>
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
                              <td className="dv-lines__col-desc">
                                <input
                                  type="text"
                                  className="dv-lines__input"
                                  placeholder="Description…"
                                  value={ligne.description}
                                  onChange={(e) =>
                                    handleLigneChange(ligne.id, 'description', e.target.value)
                                  }
                                />
                              </td>

                              <td className="dv-lines__col-qty">
                                <input
                                  type="number"
                                  className="dv-lines__input dv-lines__input--number"
                                  min="0"
                                  step="1"
                                  value={ligne.quantite}
                                  onChange={(e) =>
                                    handleLigneChange(ligne.id, 'quantite', e.target.value)
                                  }
                                />
                              </td>

                              <td className="dv-lines__col-price">
                                <input
                                  type="number"
                                  className="dv-lines__input dv-lines__input--number"
                                  min="0"
                                  step="0.01"
                                  value={ligne.prix_unitaire}
                                  onChange={(e) =>
                                    handleLigneChange(ligne.id, 'prix_unitaire', e.target.value)
                                  }
                                />
                              </td>

                              <td className="dv-lines__col-total">
                                <span className="dv-lines__total">
                                  {formatEUR(ligne.quantite * ligne.prix_unitaire)}
                                </span>
                              </td>

                              <td className="dv-lines__col-del">
                                <button
                                  type="button"
                                  className="dv-lines__del-btn"
                                  aria-label="Supprimer cette ligne"
                                  onClick={() => removeLigne(ligne.id)}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <button type="button" className="dv-lines__add-btn" onClick={addLigne}>
                    <i className="fas fa-plus"></i> Ajouter une ligne
                  </button>
                </div>
              </div>

              {/* ── Notes libres ── */}
              <div className="dv-modal__field">
                <label className="dv-modal__label" htmlFor="dv-notes">Notes</label>
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
                <div className="dv-summary__row">
                  <span className="dv-summary__label">Sous-total HT</span>
                  <span className="dv-summary__value">{formatEUR(sousTotal)}</span>
                </div>

                <div className="dv-summary__tva-row">
                  <span className="dv-summary__tva-label">
                    TVA
                    <div className="dv-tva-toggle" role="group" aria-label="Taux de TVA">
                      <button
                        type="button"
                        className={'dv-tva-btn' + (formData.tva === 6 ? ' dv-tva-btn--active' : '')}
                        onClick={() => setFormData((prev) => ({ ...prev, tva: 6 }))}
                      >
                        6%
                      </button>
                      <button
                        type="button"
                        className={'dv-tva-btn' + (formData.tva === 21 ? ' dv-tva-btn--active' : '')}
                        onClick={() => setFormData((prev) => ({ ...prev, tva: 21 }))}
                      >
                        21%
                      </button>
                    </div>
                  </span>
                  <span className="dv-summary__value">{formatEUR(tvaAmount)}</span>
                </div>

                <hr className="dv-summary__divider" />

                <div className="dv-summary__total-row">
                  <span className="dv-summary__total-label">Total TTC</span>
                  <span className="dv-summary__total-value">{formatEUR(totalTTC)}</span>
                </div>
              </div>

              <div className="dv-modal__footer">
                <button type="button" className="dv-modal__cancel" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="dv-modal__submit">
                  {modal.type === 'create' ? 'Créer le devis' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
