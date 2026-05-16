import { useState, useEffect, useRef, useCallback } from 'react'
import { getRdv, createRdv, updateRdv, deleteRdv, exportIcal } from '../../services/api'
import './styles/RendezVousPage.css'

function ActionMenu({ row, openMenu, setOpenMenu, onEdit, onDelete }) {
  const isOpen = openMenu === row.id
  const btnRef = useRef(null)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropPos({ top: rect.bottom + 4, left: rect.right - 160 })
    }
  }, [isOpen])

  return (
    <div className="rdv-menu-wrap">
      <button
        ref={btnRef}
        className={'rdv-dots-btn' + (isOpen ? ' rdv-dots-btn--open' : '')}
        aria-label={`Actions pour ${row.client_nom}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setOpenMenu((prev) => (prev === row.id ? null : row.id))}
      >
        <i className="fas fa-ellipsis-v"></i>
      </button>
      {isOpen && (
        <div className="rdv-dropdown" role="menu" style={{ top: dropPos.top, left: dropPos.left }}>
          <button className="rdv-dropdown__item" role="menuitem" onClick={() => onEdit(row)}>
            <i className="fas fa-pen"></i> Modifier
          </button>
          {row.statut === 'confirme' && (
            <a
              className="rdv-dropdown__item rdv-dropdown__item--ical"
              href={exportIcal(row.id)}
              download
              onClick={() => setOpenMenu(null)}
            >
              <i className="fas fa-calendar-download"></i> Export iCal
            </a>
          )}
          <button
            className="rdv-dropdown__item rdv-dropdown__item--danger"
            role="menuitem"
            onClick={() => onDelete(row.id)}
          >
            <i className="fas fa-trash"></i> Supprimer
          </button>
        </div>
      )}
    </div>
  )
}

const SERVICES_LIST = [
  'Rénovation toiture', 'Pose neuve', 'Zinguerie', 'Isolation combles',
  'Nettoyage toiture', 'Réparation urgence', 'Inspection toiture', 'Traitement hydrofuge',
]

const STATUS_LABEL = {
  en_attente: 'En attente',
  confirme:   'Confirmé',
  annule:     'Annulé',
  termine:    'Terminé',
}

const TABS = [
  { label: 'Tous',       filter: null },
  { label: 'En attente', filter: 'en_attente' },
  { label: 'Confirmé',   filter: 'confirme' },
  { label: 'Annulé',     filter: 'annule' },
]

const EMPTY_FORM = {
  client_id:   '',
  service:     '',
  date_rdv:    '',
  heure_debut: '',
  heure_fin:   '',
  statut:      'en_attente',
  notes:       '',
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
    default:           return 'status-badge--pending'
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso.replace(' ', 'T')).toLocaleDateString('fr-BE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function RendezVousPage() {
  const [rdvList, setRdvList]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [activeTab, setActiveTab]   = useState(null)
  const [openMenu, setOpenMenu]     = useState(null)
  const [modal, setModal]           = useState({ type: null, item: null })
  const [formData, setFormData]     = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getRdv()
      .then(setRdvList)
      .catch((err) => setError(err.message || 'Impossible de charger les rendez-vous.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    document.body.style.overflow = modal.type ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modal.type])

  const visibleRdv = activeTab
    ? rdvList.filter((r) => r.statut === activeTab)
    : rdvList

  function countFor(filter) {
    return filter ? rdvList.filter((r) => r.statut === filter).length : rdvList.length
  }

  function openCreateModal() {
    setFormData(EMPTY_FORM)
    setModal({ type: 'create', item: null })
  }

  function openEditModal(item) {
    setFormData({
      client_id:   item.client_id,
      service:     item.service      ?? '',
      date_rdv:    item.date_rdv     ?? '',
      heure_debut: item.heure_debut  ?? '',
      heure_fin:   item.heure_fin    ?? '',
      statut:      item.statut       ?? 'en_attente',
      notes:       item.notes        ?? '',
    })
    setModal({ type: 'edit', item })
    setOpenMenu(null)
  }

  const closeModal = useCallback(() => {
    setModal({ type: null, item: null })
  }, [])

  function handleFormChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createRdv({
        ...formData,
        date_demande: new Date().toISOString().slice(0, 10),
      })
      const all = await getRdv()
      setRdvList(all)
      closeModal()
    } catch (err) {
      setError(err.message || 'Erreur lors de la création.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await updateRdv(modal.item.id, formData)
      setRdvList((prev) =>
        prev.map((r) => (r.id === modal.item.id ? { ...r, ...formData } : r))
      )
      closeModal()
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    setOpenMenu(null)
    try {
      await deleteRdv(id)
      setRdvList((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression.')
    }
  }

  if (loading) {
    return (
      <div className="rdv-page">
        <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.875rem' }}>Chargement…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rdv-page">
        <p style={{ color: '#c0392b', fontSize: '0.875rem' }}>{error}</p>
      </div>
    )
  }

  return (
    <div className="rdv-page">

      {/* ── En-tête ── */}
      <div className="rdv-page__header">
        <h1 className="rdv-page__title">Rendez-vous</h1>
        <button className="rdv-page__new-btn" onClick={openCreateModal}>
          <i className="fas fa-plus"></i> Nouveau rendez-vous
        </button>
      </div>

      {/* ── Onglets de filtre ── */}
      <div className="rdv-tabs" role="tablist" aria-label="Filtrer par statut">
        {TABS.map(({ label, filter }) => (
          <button
            key={label}
            role="tab"
            aria-selected={activeTab === filter}
            className={'rdv-tab' + (activeTab === filter ? ' rdv-tab--active' : '')}
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
                <th>Horaire</th>
                <th>Service</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRdv.length === 0 ? (
                <tr>
                  <td colSpan={6} className="rdv-table__empty">
                    Aucun rendez-vous pour ce filtre.
                  </td>
                </tr>
              ) : (
                visibleRdv.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="table-client">
                        <span className="table-avatar" aria-hidden="true">
                          {getInitials(row.client_nom)}
                        </span>
                        <span className="table-client__name">{row.client_nom}</span>
                      </div>
                    </td>
                    <td>{formatDate(row.date_rdv)}</td>
                    <td>
                      {row.heure_debut
                        ? `${row.heure_debut}${row.heure_fin ? ` – ${row.heure_fin}` : ''}`
                        : '—'}
                    </td>
                    <td>{row.service}</td>
                    <td>
                      <span className={`status-badge ${statusClass(row.statut)}`}>
                        {STATUS_LABEL[row.statut] ?? row.statut}
                      </span>
                    </td>
                    <td>
                      <ActionMenu
                        row={row}
                        openMenu={openMenu}
                        setOpenMenu={setOpenMenu}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                      />
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
            <div className="rdv-card__header">
              <div className="table-client">
                <span className="table-avatar" aria-hidden="true">
                  {getInitials(row.client_nom)}
                </span>
                <span className="table-client__name">{row.client_nom}</span>
              </div>
              <span className={`status-badge ${statusClass(row.statut)}`}>
                {STATUS_LABEL[row.statut] ?? row.statut}
              </span>
            </div>
            <div className="rdv-card__meta">
              <span className="rdv-card__meta-item">
                <i className="fas fa-calendar-alt"></i> {formatDate(row.date_rdv)}
              </span>
              {row.heure_debut && (
                <span className="rdv-card__meta-item">
                  <i className="fas fa-clock"></i>
                  {row.heure_debut}{row.heure_fin ? ` – ${row.heure_fin}` : ''}
                </span>
              )}
              <span className="rdv-card__meta-item">
                <i className="fas fa-wrench"></i> {row.service}
              </span>
            </div>
            <div className="rdv-card__footer">
              <ActionMenu
                row={row}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Overlay fermeture menu ── */}
      {openMenu !== null && (
        <div
          className="rdv-menu-overlay"
          onClick={() => setOpenMenu(null)}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════
          Modal — Nouveau / Modifier
      ══════════════════════════════ */}
      {modal.type !== null && (
        <div
          className="rdv-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rdv-modal-title"
          onClick={closeModal}
        >
          <div className="rdv-modal__dialog" onClick={(e) => e.stopPropagation()}>

            <div className="rdv-modal__header">
              <h2 className="rdv-modal__title" id="rdv-modal-title">
                {modal.type === 'create' ? 'Nouveau rendez-vous' : 'Modifier le rendez-vous'}
              </h2>
              <button className="rdv-modal__close" onClick={closeModal} aria-label="Fermer">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form
              className="rdv-modal__body"
              onSubmit={modal.type === 'create' ? handleCreate : handleUpdate}
            >
              <div className="rdv-modal__field">
                <label className="rdv-modal__label" htmlFor="rdv-client-id">
                  ID Client *
                </label>
                <input
                  id="rdv-client-id"
                  name="client_id"
                  type="number"
                  min="1"
                  className="rdv-modal__input"
                  value={formData.client_id}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="rdv-modal__field">
                <label className="rdv-modal__label" htmlFor="rdv-date">
                  Date du rendez-vous *
                </label>
                <input
                  id="rdv-date"
                  name="date_rdv"
                  type="date"
                  className="rdv-modal__input"
                  value={formData.date_rdv}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="rdv-modal__row">
                <div className="rdv-modal__field">
                  <label className="rdv-modal__label" htmlFor="rdv-heure-debut">
                    Heure début
                  </label>
                  <input
                    id="rdv-heure-debut"
                    name="heure_debut"
                    type="time"
                    className="rdv-modal__input"
                    value={formData.heure_debut}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="rdv-modal__field">
                  <label className="rdv-modal__label" htmlFor="rdv-heure-fin">
                    Heure fin
                  </label>
                  <input
                    id="rdv-heure-fin"
                    name="heure_fin"
                    type="time"
                    className="rdv-modal__input"
                    value={formData.heure_fin}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="rdv-modal__field">
                <label className="rdv-modal__label" htmlFor="rdv-service">
                  Service *
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
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

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
                  <option value="en_attente">En attente</option>
                  <option value="confirme">Confirmé</option>
                  <option value="annule">Annulé</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>

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

              <div className="rdv-modal__footer">
                <button type="button" className="rdv-modal__cancel" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="rdv-modal__submit" disabled={submitting}>
                  {submitting
                    ? 'En cours…'
                    : modal.type === 'create'
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
