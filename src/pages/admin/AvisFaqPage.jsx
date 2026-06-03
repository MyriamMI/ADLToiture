import { useState, useEffect } from 'react'
import {
  getAvis, updateAvisStatut, deleteAvis, getDeletedAvis, restoreAvis,
  getFaq, createFaq, updateFaq, deleteFaq,
} from '../../services/api'
import './styles/AvisFaqPage.css'

const AVIS_LABEL = { en_attente: 'En attente', valide: 'Validé' }

const MOCK_AVIS_REMOVED = [
  {
    id: 1,
    client: 'Martin Dupont',
    texte:
      'Travail sérieux et soigné. Équipe ponctuelle et très professionnelle. Je recommande vivement ADL Toiture pour tout projet de rénovation.',
    note: 5,
    date: '2024-03-12',
    statut: 'Validé',
  },
  {
    id: 2,
    client: 'Sophie Lambert',
    texte:
      "Bonne prestation dans l\u2019ensemble. Quelques petits retards au démarrage mais le résultat final est impeccable.",
    note: 4,
    date: '2024-04-02',
    statut: 'En attente',
  },
  {
    id: 3,
    client: 'Jean-Pierre Renard',
    texte:
      "Très satisfait de l\u2019intervention rapide suite à la tempête. Devis clair et travail réalisé en deux jours.",
    note: 5,
    date: '2024-04-18',
    statut: 'En attente',
  },
  {
    id: 4,
    client: 'Marie Lecomte',
    texte:
      'Équipe sympathique. Le prix était un peu élevé mais la qualité est au rendez-vous.',
    note: 3,
    date: '2024-05-05',
    statut: 'Validé',
  },
  {
    id: 5,
    client: 'Ahmed Benali',
    texte:
      'Service client réactif, réponse rapide à mes questions. Chantier propre et bien géré.',
    note: 4,
    date: '2024-05-20',
    statut: 'En attente',
  },
  {
    id: 6,
    client: 'Claire Fontaine',
    texte:
      'Travaux réalisés dans les délais prévus. Je suis pleinement satisfaite du résultat.',
    note: 5,
    date: '2024-06-01',
    statut: 'Validé',
  },
]

const MOCK_FAQ_REMOVED = [
  {
    id: 1,
    question: 'Quels types de toitures rénovez-vous ?',
    reponse:
      'Nous intervenons sur tous types de toitures : tuiles plates ou romanes, ardoises naturelles ou synthétiques, zinc, EPDM, toitures plates, shingle bitumé, etc.',
    categorie: 'Services',
  },
  {
    id: 2,
    question: 'Proposez-vous des devis gratuits ?',
    reponse:
      "Oui, tous nos devis sont gratuits et sans engagement. Contactez-nous via le formulaire ou par téléphone pour convenir d\u2019un rendez-vous.",
    categorie: 'Devis',
  },
  {
    id: 3,
    question: 'Dans quelles communes intervenez-vous ?',
    reponse:
      "Nous opérons principalement en province de Liège et en province de Namur. N\u2019hésitez pas à nous contacter pour vérifier votre commune.",
    categorie: 'Zone',
  },
  {
    id: 4,
    question: "Que faire en cas de fuite d\u2019urgence ?",
    reponse:
      "Appelez-nous directement au numéro d\u2019urgence disponible sur notre site. Nous nous engageons à intervenir sous 24 h pour toute fuite active.",
    categorie: 'Urgences',
  },
  {
    id: 5,
    question: 'Quelle garantie offrez-vous sur vos travaux ?',
    reponse:
      "Nos travaux sont couverts par une garantie de 10 ans sur la main d\u2019\u0153uvre. Les matériaux bénéficient des garanties fabricant (généralement 20 à 30 ans).",
    categorie: 'Garanties',
  },
  {
    id: 6,
    question: "Faites-vous de l\u2019entretien préventif ?",
    reponse:
      "Oui, nous proposons des contrats d\u2019entretien annuel incluant inspection, nettoyage des gouttières et traitement anti-mousse.",
    categorie: 'Services',
  },
]

const CATEGORIES = ['Services', 'Devis', 'Zone', 'Urgences', 'Garanties']

/* ── Helpers ── */
function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function Stars({ note }) {
  return (
    <span className="af-stars" aria-label={`${note} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < note ? 'af-star--on' : 'af-star--off'}>
          ★
        </span>
      ))}
    </span>
  )
}

function truncate(str, max = 80) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/* ══════════════════════════════
   Composant principal
══════════════════════════════ */
export default function AvisFaqPage() {
  /* ── État — Avis ── */
  const [avisList, setAvisList] = useState([])
  const [deletedAvisList, setDeletedAvisList] = useState([])
  const [avisTab, setAvisTab] = useState(null) /* null = Tous */

  /* ── État — FAQ ── */
  const [faqList, setFaqList] = useState([])
  const [faqModal, setFaqModal] = useState(null) /* null | { type:'create'|'edit', item? } */
  const [faqForm, setFaqForm] = useState({ question: '', reponse: '', categorie: 'Services' })

  /* ── Chargement initial ── */
  useEffect(() => {
    getAvis().then(setAvisList).catch(() => {})
    getFaq().then(setFaqList).catch(() => {})
  }, [])

  /* ── Chargement des avis supprimés quand l'onglet est actif ── */
  useEffect(() => {
    if (avisTab === 'deleted') {
      getDeletedAvis().then(setDeletedAvisList).catch(() => {})
    }
  }, [avisTab])

  /* ── Scroll lock quand la modal FAQ est ouverte ── */
  useEffect(() => {
    document.body.style.overflow = faqModal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [faqModal])

  /* ══════════════════════════════
     Actions — Avis
  ══════════════════════════════ */
  const handleValiderAvis = (id) => {
    setAvisList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, statut: 'valide' } : a))
    )
    updateAvisStatut(id, 'valide').catch(() => {})
  }

  const handleSupprimerAvis = async (id) => {
    if (!window.confirm('Supprimer cet avis ?')) return
    await deleteAvis(id)
    const updated = await getAvis()
    setAvisList(updated)
  }

  const handleRestoreAvis = async (id) => {
    await restoreAvis(id)
    const [allAvis, deletedAvis] = await Promise.all([
      getAvis(),
      getDeletedAvis()
    ])
    setAvisList(allAvis)
    setDeletedAvisList(deletedAvis)
  }

  /* ══════════════════════════════
     Actions — FAQ
  ══════════════════════════════ */
  const openFaqCreate = () => {
    setFaqForm({ question: '', reponse: '', categorie: 'Services' })
    setFaqModal({ type: 'create' })
  }

  const openFaqEdit = (item) => {
    setFaqForm({ question: item.question, reponse: item.reponse, categorie: item.categorie })
    setFaqModal({ type: 'edit', item })
  }

  const closeFaqModal = () => setFaqModal(null)

  const handleFaqSubmit = async () => {
    if (!faqForm.question.trim() || !faqForm.reponse.trim()) return

    if (faqModal.type === 'create') {
      try {
        await createFaq(faqForm)
        const all = await getFaq()
        setFaqList(all)
      } catch {}
    } else {
      setFaqList((prev) =>
        prev.map((f) => (f.id === faqModal.item.id ? { ...f, ...faqForm } : f))
      )
      updateFaq(faqModal.item.id, faqForm).catch(() => {})
    }
    closeFaqModal()
  }

  const handleSupprimerFaq = (id) => {
    if (!window.confirm('Supprimer cette question ?')) return
    setFaqList((prev) => prev.filter((f) => f.id !== id))
    deleteFaq(id).catch(() => {})
  }

  /* ── Filtrage des avis ── */
  const avisFiltered = avisTab === 'deleted'
    ? deletedAvisList
    : avisTab
      ? avisList.filter((a) => a.statut === avisTab)
      : avisList

  const AVIS_TABS = [
    { label: 'Tous',       value: null },
    { label: 'En attente', value: 'en_attente' },
    { label: 'Validés',    value: 'valide' },
    { label: 'Supprimés',  value: 'deleted' },
  ]

  return (
    <div className="af-page">

      {/* ══════════════════════════════
          Section 1 — Gestion des avis
      ══════════════════════════════ */}
      <section className="af-section">

        {/* En-tête de section */}
        <div className="af-section__head">
          <div>
            <h1 className="af-section__title">Gestion des avis</h1>
            <p className="af-section__subtitle">
              {avisList.filter((a) => a.statut === 'en_attente').length} avis en attente
              de validation
            </p>
          </div>
        </div>

        {/* Onglets de filtre */}
        <div className="af-tabs">
          {AVIS_TABS.map((t) => (
            <button
              key={String(t.value)}
              className={'af-tab' + (avisTab === t.value ? ' af-tab--active' : '')}
              onClick={() => setAvisTab(t.value)}
            >
              {t.label}
              {t.value === 'en_attente' && (
                <span className="af-tab__badge">
                  {avisList.filter((a) => a.statut === 'en_attente').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tableau des avis */}
        <div className="af-table-wrap">
          <table className="af-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Avis</th>
                <th>Note</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {avisFiltered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="af-table__empty">
                    Aucun avis dans cette catégorie.
                  </td>
                </tr>
              ) : (
                avisFiltered.map((avis) => (
                  <tr key={avis.id}>
                    <td>
                      <div className="af-client">
                        <div className="af-avatar">{getInitials(avis.nom)}</div>
                        <span className="af-client__name">{avis.nom}</span>
                      </div>
                    </td>
                    <td>
                      <span className="af-avis-text" title={avis.commentaire}>
                        {truncate(avis.commentaire)}
                      </span>
                    </td>

                    {/* Note étoiles */}
                    <td>
                      <Stars note={avis.note} />
                    </td>

                    {/* Date */}
                    <td className="af-date">{formatDate(avis.date)}</td>

                    {/* Statut */}
                    <td>
                      {avisTab === 'deleted' ? (
                        <span className="af-badge af-badge--deleted">Supprimé</span>
                      ) : (
                        <span
                          className={
                            'af-badge' +
                            (avis.statut === 'valide'
                              ? ' af-badge--valid'
                              : ' af-badge--pending')
                          }
                        >
                          {AVIS_LABEL[avis.statut] ?? avis.statut}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="af-actions">
                        {avisTab === 'deleted' ? (
                          <button
                            className="af-action-btn af-action-btn--validate"
                            title="Restaurer"
                            onClick={() => handleRestoreAvis(avis.id)}
                          >
                            <i className="fas fa-undo"></i>
                          </button>
                        ) : (
                          <>
                            {avis.statut === 'en_attente' && (
                              <button
                                className="af-action-btn af-action-btn--validate"
                                title="Valider"
                                onClick={() => handleValiderAvis(avis.id)}
                              >
                                <i className="fas fa-check"></i>
                              </button>
                            )}
                            <button
                              className="af-action-btn af-action-btn--delete"
                              title="Supprimer"
                              onClick={() => handleSupprimerAvis(avis.id)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Cards mobiles avis ── */}
        <div className="af-avis-mobile-cards">
          {avisFiltered.length === 0 ? (
            <p className="af-mobile-empty">Aucun avis dans cette catégorie.</p>
          ) : (
            avisFiltered.map((avis) => (
              <div key={avis.id} className="af-avis-card">
                <div className="af-avis-card__header">
                  <div className="af-avis-card__left">
                    <div className="af-avatar">{getInitials(avis.nom)}</div>
                    <span className="af-avis-card__name">{avis.nom}</span>
                  </div>
                  {avisTab === 'deleted' ? (
                    <span className="af-badge af-badge--deleted">Supprimé</span>
                  ) : (
                    <span className={'af-badge' + (avis.statut === 'valide' ? ' af-badge--valid' : ' af-badge--pending')}>
                      {AVIS_LABEL[avis.statut] ?? avis.statut}
                    </span>
                  )}
                </div>

                <p className="af-avis-card__text">{truncate(avis.commentaire, 100)}</p>

                <div className="af-avis-card__footer">
                  <div className="af-avis-card__meta">
                    <Stars note={avis.note} />
                    <span className="af-avis-card__date">{formatDate(avis.date)}</span>
                  </div>
                  <div className="af-actions">
                    {avisTab === 'deleted' ? (
                      <button
                        className="af-action-btn af-action-btn--validate"
                        title="Restaurer"
                        onClick={() => handleRestoreAvis(avis.id)}
                      >
                        <i className="fas fa-undo"></i>
                      </button>
                    ) : (
                      <>
                        {avis.statut === 'en_attente' && (
                          <button
                            className="af-action-btn af-action-btn--validate"
                            title="Valider"
                            onClick={() => handleValiderAvis(avis.id)}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                        <button
                          className="af-action-btn af-action-btn--delete"
                          title="Supprimer"
                          onClick={() => handleSupprimerAvis(avis.id)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ══════════════════════════════
          Section 2 — Gestion de la FAQ
      ══════════════════════════════ */}
      <section className="af-section">

        {/* En-tête de section */}
        <div className="af-section__head">
          <div>
            <h2 className="af-section__title">Gestion de la FAQ</h2>
            <p className="af-section__subtitle">
              {faqList.length} question{faqList.length !== 1 ? 's' : ''} répertoriée
              {faqList.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="af-btn af-btn--primary" onClick={openFaqCreate}>
            <i className="fas fa-plus"></i> Ajouter
          </button>
        </div>

        {/* ── Cards mobiles FAQ ── */}
        <div className="af-faq-mobile-cards">
          {faqList.length === 0 ? (
            <p className="af-mobile-empty">Aucune question — cliquez « + Ajouter » pour en créer une.</p>
          ) : (
            faqList.map((faq) => (
              <div key={faq.id} className="af-faq-card">
                <div className="af-faq-card__header">
                  <span className={`af-cat-badge af-cat-badge--${faq.categorie.toLowerCase()}`}>
                    {faq.categorie}
                  </span>
                  <div className="af-actions">
                    <button
                      className="af-action-btn af-action-btn--edit"
                      title="Modifier"
                      onClick={() => openFaqEdit(faq)}
                    >
                      <i className="fas fa-pen"></i>
                    </button>
                    <button
                      className="af-action-btn af-action-btn--delete"
                      title="Supprimer"
                      onClick={() => handleSupprimerFaq(faq.id)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <p className="af-faq-card__question">{faq.question}</p>
                <p className="af-faq-card__reponse">{truncate(faq.reponse, 120)}</p>
              </div>
            ))
          )}
        </div>

        {/* Tableau FAQ */}
        <div className="af-table-wrap">
          <table className="af-table af-table--faq">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Question</th>
                <th>Réponse</th>
                <th style={{ width: '120px' }}>Catégorie</th>
                <th style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="af-table__empty">
                    Aucune question — cliquez « + Ajouter » pour en créer une.
                  </td>
                </tr>
              ) : (
                faqList.map((faq) => (
                  <tr key={faq.id}>
                    {/* Question */}
                    <td>
                      <span className="af-faq-question">{faq.question}</span>
                    </td>

                    {/* Réponse tronquée */}
                    <td>
                      <span className="af-faq-reponse" title={faq.reponse}>
                        {truncate(faq.reponse, 100)}
                      </span>
                    </td>

                    {/* Catégorie badge */}
                    <td>
                      <span className={`af-cat-badge af-cat-badge--${faq.categorie.toLowerCase()}`}>
                        {faq.categorie}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="af-actions">
                        <button
                          className="af-action-btn af-action-btn--edit"
                          title="Modifier"
                          onClick={() => openFaqEdit(faq)}
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                        <button
                          className="af-action-btn af-action-btn--delete"
                          title="Supprimer"
                          onClick={() => handleSupprimerFaq(faq.id)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ══════════════════════════════
          Modal — Créer / modifier une question FAQ
      ══════════════════════════════ */}
      {faqModal && (
        <div className="af-modal" onClick={closeFaqModal}>
          <div
            className="af-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-label={faqModal.type === 'create' ? 'Nouvelle question' : 'Modifier la question'}
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="af-modal__header">
              <h3 className="af-modal__title">
                {faqModal.type === 'create' ? 'Nouvelle question FAQ' : 'Modifier la question'}
              </h3>
              <button className="af-modal__close" onClick={closeFaqModal} aria-label="Fermer">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Corps */}
            <div className="af-modal__body">
              {/* Question */}
              <div className="af-field">
                <label className="af-label">Question *</label>
                <input
                  type="text"
                  className="af-input"
                  placeholder="ex. Quels types de toitures rénovez-vous ?"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm((f) => ({ ...f, question: e.target.value }))}
                />
              </div>

              {/* Réponse */}
              <div className="af-field">
                <label className="af-label">Réponse *</label>
                <textarea
                  className="af-input af-textarea"
                  rows={4}
                  placeholder="Rédigez la réponse complète…"
                  value={faqForm.reponse}
                  onChange={(e) => setFaqForm((f) => ({ ...f, reponse: e.target.value }))}
                />
              </div>

              {/* Catégorie */}
              <div className="af-field">
                <label className="af-label">Catégorie</label>
                <select
                  className="af-input af-select"
                  value={faqForm.categorie}
                  onChange={(e) => setFaqForm((f) => ({ ...f, categorie: e.target.value }))}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pied de modal */}
            <div className="af-modal__footer">
              <button className="af-btn af-btn--ghost" onClick={closeFaqModal}>
                Annuler
              </button>
              <button
                className="af-btn af-btn--primary"
                onClick={handleFaqSubmit}
                disabled={!faqForm.question.trim() || !faqForm.reponse.trim()}
              >
                {faqModal.type === 'create' ? 'Ajouter' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
