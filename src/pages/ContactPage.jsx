import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/ContactPage.css'

/* -- Correction icône Leaflet par défaut (CDN) -- */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

/* -- Données -- */
const infoCards = [
  { label: 'Téléphone', value: '0470 00 00 00', icon: '📞' },
  { label: 'Email',     value: 'info@adltoiture.be', icon: '✉️' },
  { label: 'Zone',      value: 'Brabant wallon', icon: '📍' },
  { label: 'Dispo',     value: '08h00 – 18h00', icon: '🕗' },
]

const faqs = [
  { question: "Délai pour un devis ?",        answer: "Je réponds sous 24h." },
  { question: "Urgences ?",                   answer: "Oui, selon la zone d'intervention." },
  { question: "Devis gratuit ?",              answer: "Oui, sans engagement." },
  { question: "Zone d'intervention ?",        answer: "Principalement le Brabant wallon." },
]

/* -- Composant -- */
export default function ContactPage() {
  /* Initialisation de la carte Leaflet */
  useEffect(() => {
    const map = L.map('contact-map').setView([50.58, 4.55], 10)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map)

    L.marker([50.58, 4.55])
      .addTo(map)
      .bindPopup('ADL Toiture — Brabant wallon')

    /* Nettoyage au démontage du composant */
    return () => map.remove()
  }, [])

  return (
    <main className="contact-page">

      {/* ── Hero ── */}
      <section className="contact-page__hero">
        <div className="contact-page__hero-container">
          <h1 className="contact-page__hero-title" data-aos="fade-up">
            Contactez-moi
          </h1>
          <p className="contact-page__hero-subtitle" data-aos="fade-up" data-aos-delay="100">
            Une question ou un projet de toiture ? Je suis disponible rapidement.
          </p>
        </div>
      </section>

      {/* ── Cartes info ── */}
      <section className="contact-page__info">
        <div className="contact-page__container">
          <div className="contact-page__info-grid">
            {infoCards.map((card, index) => (
              <div
                key={card.label}
                className="info-card"
                data-aos="fade-up"
                data-aos-delay={index * 75}
              >
                <span className="info-card__icon" aria-hidden="true">{card.icon}</span>
                <span className="info-card__label">{card.label}</span>
                <span className="info-card__value">{card.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section deux colonnes ── */}
      <section className="contact-page__main">
        <div className="contact-page__container contact-page__two-col">

          {/* Colonne gauche — actions + carte */}
          <div className="contact-page__left" data-aos="fade-up" data-aos-delay="0">
            <h2 className="contact-page__col-title">Demander un devis gratuit</h2>

            <div className="contact-page__actions">
              <a
                href="tel:0470000000"
                className="contact-page__btn contact-page__btn--primary"
              >
                📞 Appeler le 0470 00 00 00
              </a>
              <a
                href="mailto:info@adltoiture.be"
                className="contact-page__btn contact-page__btn--outline"
              >
                ✉ Envoyer un email
              </a>
            </div>

            <h3 className="contact-page__map-title">Zones d'intervention</h3>
            <div id="contact-map" className="contact-page__map" />
          </div>

          {/* Colonne droite — FAQ accordion */}
          <div className="contact-page__right" data-aos="fade-up" data-aos-delay="100">
            <h2 className="contact-page__col-title">Questions fréquentes</h2>

            <div className="contact-page__faq">
              {faqs.map((faq) => (
                <details key={faq.question} className="faq-item">
                  <summary className="faq-item__question">{faq.question}</summary>
                  <p className="faq-item__answer">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

        </div>
      </section>

    </main>
  )
}
