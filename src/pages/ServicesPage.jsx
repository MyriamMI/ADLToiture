import './ServicesPage.css'

const services = [
  {
    title: 'Pose de toiture neuve',
    description: 'Installation complète de votre toiture sur ossature neuve ou charpente existante, tous matériaux.',
    price: '80 €/m²',
  },
  {
    title: 'Rénovation de couverture',
    description: 'Remplacement partiel ou total de votre couverture existante avec remise aux normes.',
    price: '45 €/m²',
  },
  {
    title: 'Zinguerie',
    description: 'Pose et remplacement de gouttières, descentes, noues, faîtages et solins en zinc.',
    price: '35 €/ml',
  },
  {
    title: 'Isolation toiture',
    description: "Isolation thermique par l'extérieur ou en sarking pour améliorer votre confort et économiser l'énergie.",
    price: '25 €/m²',
  },
  {
    title: 'Velux & fenêtres de toit',
    description: 'Fourniture et pose de fenêtres de toit pour apporter lumière et ventilation à vos combles.',
    price: '350 €',
  },
  {
    title: 'Nettoyage & traitement',
    description: 'Démoussage, nettoyage haute pression et traitement hydrofuge pour prolonger la durée de vie de votre toiture.',
    price: '15 €/m²',
  },
  {
    title: "Réparation d'urgence",
    description: 'Intervention rapide pour fuite, tuile cassée ou dégât après tempête, avec bâchage provisoire si nécessaire.',
    price: '80 €',
  },
  {
    title: 'Inspection & diagnostic',
    description: "Visite complète de votre toiture avec rapport détaillé de l'état général et recommandations.",
    price: 'Gratuit',
  },
]

const steps = [
  {
    number: '01',
    title: 'Diagnostic gratuit',
    description: "Prise de contact et visite sur place pour évaluer l'état de votre toiture.",
  },
  {
    number: '02',
    title: 'Préparation',
    description: "Devis détaillé, commande des matériaux et planification de l'intervention.",
  },
  {
    number: '03',
    title: 'Intervention',
    description: "Réalisation des travaux dans les règles de l'art, dans le respect des délais convenus.",
  },
  {
    number: '04',
    title: 'Contrôle final',
    description: 'Vérification complète du chantier et remise des documents de garantie.',
  },
]

export default function ServicesPage() {
  return (
    <main className="services-page">

      {/* Hero header */}
      <section className="services-page__hero">
        <div className="services-page__hero-container">
          <h1 className="services-page__hero-title">Services de couverture</h1>
          <p className="services-page__hero-subtitle">
            Des prestations complètes réalisées par un artisan couvreur qualifié
            en Brabant wallon. Devis gratuit, intervention rapide.
          </p>
        </div>
      </section>

      {/* Cards grid */}
      <section className="services-page__grid-section">
        <div className="services-page__container">
          <div className="services-page__grid">
            {services.map((service, index) => (
              <div key={service.title} className="service-card" data-aos="fade-up" data-aos-delay={index * 75}>
                <div className="service-card__icon" aria-hidden="true" />
                <h3 className="service-card__title">{service.title}</h3>
                <p className="service-card__description">{service.description}</p>
                <span className="service-card__price">{service.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process steps */}
      <section className="services-page__process">
        <div className="services-page__container">
          <h2 className="services-page__process-title">Mon intervention en 4 étapes</h2>
          <div className="services-page__steps">
            {steps.map((step) => (
              <div key={step.number} className="process-step">
                <span className="process-step__number">{step.number}</span>
                <div className="process-step__content">
                  <h3 className="process-step__title">{step.title}</h3>
                  <p className="process-step__description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
