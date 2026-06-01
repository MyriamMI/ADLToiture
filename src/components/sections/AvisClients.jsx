import { useState, useEffect } from 'react'
import { getAvis } from '../../services/api'
import './styles/AvisClients.css'

function getInitials(name) {
  if (!name) return '?'
  return String(name).split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function Stars({ note }) {
  return (
    <div className="avis-stars" aria-label={`${note} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < note ? 'avis-star--on' : 'avis-star--off'}>★</span>
      ))}
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function AvisClients() {
  const [avis, setAvis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAvis()
      .then((data) => setAvis(data.filter((a) => a.statut === 'valide')))
      .catch(() => setAvis([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  return (
    <section className="avis-clients">
      <div className="avis-clients__container">
        <h2 className="avis-clients__title">Avis clients</h2>

        {avis.length === 0 ? (
          <p className="avis-clients__empty">Aucun avis pour le moment.</p>
        ) : (
          <div className="avis-clients__grid">
            {avis.map((a) => (
              <div key={a.id} className="avis-card">
                <div className="avis-card__header">
                  <div className="avis-card__avatar" aria-hidden="true">
                    {getInitials(a.nom)}
                  </div>
                  <div className="avis-card__meta">
                    <span className="avis-card__name">{a.nom}</span>
                    <Stars note={a.note} />
                  </div>
                </div>
                <p className="avis-card__text">{a.commentaire}</p>
                <span className="avis-card__date">{formatDate(a.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
