import { useState, useEffect, useRef } from 'react'
import {
  getDemandes,
  createClient,
  createRdv,
  updateDemandeStatut,
  deleteDemande,
} from '../../services/api'
import './styles/DemandesPage.css'

const STATUS_CLASS = {
  nouvelle:    'dm-badge--new',
  traitee:     'dm-badge--done',
  refusee:     'dm-badge--refused',
  reportee:    'dm-badge--postponed',
  reorientee:  'dm-badge--redirected',
}

const STATUS_LABEL = {
  nouvelle:    'Nouvelle',
  traitee:     'Traitée',
  refusee:     'Refusée',
  reportee:    'Reportée',
  reorientee:  'Réorientée',
}

const EMPTY_FORM = {
  adresse:     '',
  date_rdv:    '',
  heure_debut: '',
  heure_fin:   '',
  notes:       '',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso.replace(' ', 'T')).toLocaleDateString('fr-BE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function DemandesPage() {
  const [demandes, setDemandes]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [openMenu, setOpenMenu]     = useState(null)
  const [modal, setModal]           = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getDemandes()
      .then(setDemandes)
      .catch((err) => setError(err.message || 'Impossible de charger les demandes.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modal])

  function toggleMenu(id) {
    setOpenMenu((prev) => (prev === id ? null : id))
  }

  function openModal(demande) {
    setForm(EMPTY_FORM)
    setModal(demande)
    setOpenMenu(null)
  }

  function closeModal() {
    setModal(null)
  }

  function handleFormChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleAccepter(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const newClient = await createClient({
        nom:       modal.nom,
        telephone: modal.telephone,
        email:     modal.email ?? null,
        ville:     modal.ville,
        adresse:   form.adresse,
        statut:    'nouveau',
      })
      await createRdv({
        client_id:    newClient.id,
        service:      modal.service,
        date_demande: modal.date_envoi,
        date_rdv:     form.date_rdv,
        heure_debut:  form.heure_debut,
        heure_fin:    form.heure_fin,
        notes:        form.notes,
      })
      await updateDemandeStatut(modal.id, 'traitee', newClient.id)
      setDemandes((prev) =>
        prev.map((d) => (d.id === modal.id ? { ...d, statut: 'traitee' } : d))
      )
      closeModal()
    } catch (err) {
      setError(err.message || 'Erreur lors du traitement de la demande.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatut(id, statut) {
    setOpenMenu(null)
    try {
      console.log('[DemandesPage] handleStatut →', { id, typeId: typeof id, statut })
      await updateDemandeStatut(id, statut)
      setDemandes((prev) =>
        prev.map((d) => (d.id === id ? { ...d, statut } : d))
      )
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour.')
    }
  }

  async function handleSupprimer(id) {
    setOpenMenu(null)
    try {
      await deleteDemande(id)
      setDemandes((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression.')
    }
  }

  /* Composant menu dropdown réutilisé dans tableau et cartes */
  function ActionMenu({ demande }) {
    const isOpen = openMenu === demande.id
    const btnRef = useRef(null)
    const [dropPos, setDropPos] = useState({ top: 0, left: 0 })

    useEffect(() => {
      if (isOpen && btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect()
        setDropPos({
          top:  rect.bottom + 4,
          left: rect.right - 160,
        })
      }
    }, [isOpen])

    return (
      <div className="dm-menu-wrap">
        <button
          ref={btnRef}
          className={`dm-dots-btn${isOpen ? ' dm-dots-btn--open' : ''}`}
          aria-label={`Actions pour ${demande.nom}`}
          aria-haspopup="true"
          aria-expanded={isOpen}
          onClick={() => toggleMenu(demande.id)}
        >
          <i className="fas fa-ellipsis-v"></i>
        </button>
        {isOpen && (
          <div
            className="dm-dropdown"
            role="menu"
            style={{ top: dropPos.top, left: dropPos.left }}
          >
            <button
              className="dm-dropdown__item dm-dropdown__item--accept"
              role="menuitem"
              onClick={() => openModal(demande)}
            >
              <i className="fas fa-check"></i> Accepter
            </button>
            <button
              className="dm-dropdown__item dm-dropdown__item--postpone"
              role="menuitem"
              onClick={() => handleStatut(demande.id, 'reportee')}
            >
              <i className="fas fa-clock"></i> Reporter
            </button>
            <button
              className="dm-dropdown__item dm-dropdown__item--redirect"
              role="menuitem"
              onClick={() => handleStatut(demande.id, 'reorientee')}
            >
              <i className="fas fa-share"></i> Réorienter
            </button>
            <button
              className="dm-dropdown__item dm-dropdown__item--delete"
              role="menuitem"
              onClick={() => handleSupprimer(demande.id)}
            >
              <i className="fas fa-trash"></i> Supprimer
            </button>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="dm-page">
        <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.875rem' }}>Chargement…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dm-page">
        <p style={{ color: '#c0392b', fontSize: '0.875rem' }}>{error}</p>
      </div>
    )
  }

  const nouvellesCount = demandes.filter((d) => d.statut === 'nouvelle').length

  return (
    <div className="dm-page">

      {/* ── En-tête ── */}
      <div className="dm-page__header">
        <h1 className="dm-page__title">Demandes</h1>
        {nouvellesCount > 0 && (
          <span className="dm-page__badge">
            {nouvellesCount} nouvelle{nouvellesCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ══════════════════════════════
          Tableau — bureau
      ══════════════════════════════ */}
      <div className="dm-table-card">
        <div className="dm-table-wrap">
          <table className="dm-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Ville</th>
                <th>Service</th>
                <th>Date d'envoi</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="dm-table__empty">
                    Aucune demande reçue.
                  </td>
                </tr>
              ) : (
                demandes.map((d) => (
                  <tr key={d.id}>
                    <td className="dm-td-name">{d.nom}</td>
                    <td>{d.telephone}</td>
                    <td>{d.ville}</td>
                    <td>{d.service}</td>
                    <td>{formatDate(d.date_envoi)}</td>
                    <td>
                      <span className={`dm-badge ${STATUS_CLASS[d.statut] ?? 'dm-badge--new'}`}>
                        {STATUS_LABEL[d.statut] ?? d.statut}
                      </span>
                    </td>
                    <td>
                      <ActionMenu demande={d} />
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
      <div className="dm-cards">
        {demandes.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(0,0,0,0.35)', fontSize: '0.875rem' }}>
            Aucune demande reçue.
          </p>
        )}
        {demandes.map((d) => (
          <div key={d.id} className="dm-card">
            <div className="dm-card__head">
              <span className="dm-card__name">{d.nom}</span>
              <div className="dm-card__head-right">
                <span className={`dm-badge ${STATUS_CLASS[d.statut] ?? 'dm-badge--new'}`}>
                  {STATUS_LABEL[d.statut] ?? d.statut}
                </span>
                <ActionMenu demande={d} />
              </div>
            </div>
            <div className="dm-card__meta">
              <span><i className="fas fa-phone"></i> {d.telephone}</span>
              <span><i className="fas fa-map-marker-alt"></i> {d.ville}</span>
              <span><i className="fas fa-wrench"></i> {d.service}</span>
              <span><i className="fas fa-calendar-alt"></i> {formatDate(d.date_envoi)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Overlay fermeture menu */}
      {openMenu !== null && (
        <div
          className="dm-menu-overlay"
          onClick={() => setOpenMenu(null)}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════
          Modal — Accepter la demande
      ══════════════════════════════ */}
      {modal && (
        <div
          className="dm-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dm-modal-title"
          onClick={closeModal}
        >
          <div className="dm-modal__dialog" onClick={(e) => e.stopPropagation()}>

            <div className="dm-modal__header">
              <h2 className="dm-modal__title" id="dm-modal-title">
                Accepter la demande
              </h2>
              <button className="dm-modal__close" onClick={closeModal} aria-label="Fermer">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form className="dm-modal__body" onSubmit={handleAccepter}>

              <div className="dm-info-grid">
                <div className="dm-info-item">
                  <span className="dm-info-label">Nom</span>
                  <span className="dm-info-value">{modal.nom}</span>
                </div>
                <div className="dm-info-item">
                  <span className="dm-info-label">Téléphone</span>
                  <span className="dm-info-value">{modal.telephone}</span>
                </div>
                <div className="dm-info-item">
                  <span className="dm-info-label">Ville</span>
                  <span className="dm-info-value">{modal.ville}</span>
                </div>
                <div className="dm-info-item">
                  <span className="dm-info-label">Service</span>
                  <span className="dm-info-value">{modal.service}</span>
                </div>
              </div>

              <hr className="dm-modal__divider" />

              <div className="dm-modal__field">
                <label className="dm-modal__label" htmlFor="dm-adresse">
                  Adresse complète
                </label>
                <input
                  id="dm-adresse"
                  name="adresse"
                  type="text"
                  className="dm-modal__input"
                  placeholder="Rue, numéro, code postal"
                  value={form.adresse}
                  onChange={handleFormChange}
                />
              </div>

              <div className="dm-modal__field">
                <label className="dm-modal__label" htmlFor="dm-date-rdv">
                  Date du rendez-vous *
                </label>
                <input
                  id="dm-date-rdv"
                  name="date_rdv"
                  type="date"
                  className="dm-modal__input"
                  value={form.date_rdv}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="dm-modal__row">
                <div className="dm-modal__field">
                  <label className="dm-modal__label" htmlFor="dm-heure-debut">
                    Heure de début *
                  </label>
                  <input
                    id="dm-heure-debut"
                    name="heure_debut"
                    type="time"
                    className="dm-modal__input"
                    value={form.heure_debut}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="dm-modal__field">
                  <label className="dm-modal__label" htmlFor="dm-heure-fin">
                    Heure de fin
                  </label>
                  <input
                    id="dm-heure-fin"
                    name="heure_fin"
                    type="time"
                    className="dm-modal__input"
                    value={form.heure_fin}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="dm-modal__field">
                <label className="dm-modal__label" htmlFor="dm-notes">
                  Notes
                </label>
                <textarea
                  id="dm-notes"
                  name="notes"
                  className="dm-modal__textarea"
                  placeholder="Informations complémentaires…"
                  value={form.notes}
                  onChange={handleFormChange}
                />
              </div>

              <div className="dm-modal__footer">
                <button type="button" className="dm-modal__cancel" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="dm-modal__submit" disabled={submitting}>
                  {submitting ? 'En cours…' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
