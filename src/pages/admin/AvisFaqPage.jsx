import { useState, useEffect } from 'react'
import './styles/AvisFaqPage.css'

/* ══════════════════════════════
   Données mock — Avis
══════════════════════════════ */
const MOCK_AVIS = [
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

/* ══════════════════════════════
   Données mock — FAQ
══════════════════════════════ */
const MOCK_FAQ = [
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
  const [avisTab, setAvisTab] = useState(null) /* null = Tous */

  /* ── État — FAQ ── */
  const [faqList, setFaqList] = useState([])
  const [faqModal, setFaqModal] = useState(null) /* null | { type:'create'|'edit', item? } */
  const [faqForm, setFaqForm] = useState({ question: '', reponse: '', categorie: 'Services' })

  /* ── Chargement initial ── */
  useEffect(() => {
    /* Avis */
    fetch('/api/avis.php')
      .then((r) => r.json())
      .then((d) => setAvisList(d))
      .catch(() => setAvisList(MOCK_AVIS))

    /* FAQ */
    fetch('/api/faq.php')
      .then((r) => r.json())
      .then((d) => setFaqList(d))
      .catch(() => setFaqList(MOCK_FAQ))
  }, [])

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
      prev.map((a) => (a.id === id ? { ...a, statut: 'Validé' } : a))
    )
    fetch('/api/avis.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, statut: 'Validé' }),
    }).catch(() => {})
  }

  const handleSupprimerAvis = (id) => {
    if (!window.confirm('Supprimer cet avis définitivement ?')) return
    setAvisList((prev) => prev.filter((a) => a.id !== id))
    fetch(`/api/avis.php?id=${id}`, { method: 'DELETE' }).catch(() => {})
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

  const handleFaqSubmit = () => {
    if (!faqForm.question.trim() || !faqForm.reponse.trim()) return

    if (faqModal.type === 'create') {
      const newItem = { id: Date.now(), ...faqForm }
      setFaqList((prev) => [...prev, newItem])
      fetch('/api/faq.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqForm),
      }).catch(() => {})
    } else {
      setFaqList((prev) =>
        prev.map((f) => (f.id === faqModal.item.id ? { ...f, ...faqForm } : f))
      )
      fetch('/api/faq.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: faqModal.item.id, ...faqForm }),
      }).catch(() => {})
    }
    closeFaqModal()
  }

  const handleSupprimerFaq = (id) => {
    if (!window.confirm('Supprimer cette question ?')) return
    setFaqList((prev) => prev.filter((f) => f.id !== id))
    fetch(`/api/faq.php?id=${id}`, { method: 'DELETE' }).catch(() => {})
  }

  /* ── Filtrage des avis ── */
  const avisFiltered = avisTab
    ? avisList.filter((a) => a.statut === avisTab)
    : avisList

  const AVIS_TABS = [
    { label: 'Tous', value: null },
    { label: 'En attente', value: 'En attente' },
    { label: 'Validés', value: 'Validé' },
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
              {avisList.filter((a) => a.statut === 'En attente').length} avis en attente
              de validation
            </p>
          </div>
          <button className="af-btn af-btn--primary">+ Demander un avis</button>
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
              {t.value === 'En attente' && (
                <span className="af-tab__badge">
                  {avisList.filter((a) => a.statut === 'En attente').length}
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
                    {/* Client */}
                    <td>
                      <div className="af-client">
                        <div className="af-avatar">{getInitials(avis.client)}</div>
                        <span className="af-client__name">{avis.client}</span>
                      </div>
                    </td>

                    {/* Texte tronqué */}
                    <td>
                      <span className="af-avis-text" title={avis.texte}>
                        {truncate(avis.texte)}
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
                      <span
                        className={
                          'af-badge' +
                          (avis.statut === 'Validé'
                            ? ' af-badge--valid'
                            : ' af-badge--pending')
                        }
                      >
                        {avis.statut}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="af-actions">
                        {avis.statut === 'En attente' && (
                          <button
                            className="af-action-btn af-action-btn--validate"
                            title="Valider"
                            onClick={() => handleValiderAvis(avis.id)}
                          >
                            ✓
                          </button>
                        )}
                        <button
                          className="af-action-btn af-action-btn--delete"
                          title="Supprimer"
                          onClick={() => handleSupprimerAvis(avis.id)}
                        >
                          ×
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
            + Ajouter
          </button>
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
                          ✏
                        </button>
                        <button
                          className="af-action-btn af-action-btn--delete"
                          title="Supprimer"
                          onClick={() => handleSupprimerFaq(faq.id)}
                        >
                          ×
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
                ×
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
