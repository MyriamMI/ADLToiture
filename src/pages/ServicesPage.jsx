import {
  FaRegBuilding, FaRegEdit, FaRegCircle, FaRegSnowflake,
  FaRegWindowMaximize, FaRegStar, FaRegClock, FaRegEye,
} from 'react-icons/fa'
import './styles/ServicesPage.css'

const services = [
  {
    Icon: FaRegBuilding,
    title: 'Pose de toiture neuve',
    description: 'Installation complète sur ossature neuve ou existante — ardoise, tuile ou bac acier.',
    price: '80 €/m²',
  },
  {
    Icon: FaRegEdit,
    title: 'Rénovation de couverture',
    description: 'Remplacement partiel ou total de la couverture avec remise aux normes.',
    price: '45 €/m²',
  },
  {
    Icon: FaRegCircle,
    title: 'Zinguerie',
    description: "Gouttières, descentes, noues et solins en zinc, cuivre ou aluminium.",
    price: '35 €/ml',
  },
  {
    Icon: FaRegSnowflake,
    title: 'Isolation toiture',
    description: "Sarking ou sous-toiture pour améliorer le confort et réduire vos charges énergétiques.",
    price: '25 €/m²',
  },
  {
    Icon: FaRegWindowMaximize,
    title: 'Velux & fenêtres de toit',
    description: 'Fourniture et pose de fenêtres de toit pour éclairer naturellement vos combles.',
    price: 'dès 350 €',
  },
  {
    Icon: FaRegStar,
    title: 'Nettoyage & traitement',
    description: 'Démoussage, nettoyage haute pression et traitement hydrofuge anti-infiltrations.',
    price: '15 €/m²',
  },
  {
    Icon: FaRegClock,
    title: "Réparation d'urgence",
    description: 'Intervention 7j/7 pour fuite, tuile cassée ou dégât après tempête.',
    price: 'dès 80 €',
  },
  {
    Icon: FaRegEye,
    title: 'Inspection & diagnostic',
    description: "Visite avec rapport détaillé et recommandations chiffrées, sans engagement.",
    price: 'Gratuit',
  },
]

const steps = [
  {
    number: '01',
    title: 'Prise de contact',
    description: "Appelez-moi ou remplissez le formulaire en ligne. Je vous rappelle sous 24h pour convenir d'un rendez-vous.",
  },
  {
    number: '02',
    title: 'Diagnostic gratuit',
    description: "Visite sur place pour évaluer l'état de votre toiture et établir un devis détaillé, sans engagement de votre part.",
  },
  {
    number: '03',
    title: 'Réalisation des travaux',
    description: "Intervention soignée dans le respect des délais convenus, avec les matériaux adaptés à votre toiture et votre budget.",
  },
  {
    number: '04',
    title: 'Réception & garantie',
    description: "Vérification finale du chantier en votre présence, remise des documents de garantie et nettoyage complet du chantier.",
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
            Dylan Laurent, artisan couvreur qualifié en Brabant wallon depuis 10&nbsp;ans.
            Chaque prestation est réalisée avec soin, des matériaux sélectionnés
            et dans le respect strict des délais convenus.
          </p>
        </div>
      </section>

      {/* Cards grid */}
      <section className="services-page__grid-section">
        <div className="services-page__container">
          <div className="services-page__grid">
            {services.map((service, index) => (
              <div key={service.title} className="service-card" data-aos="fade-up" data-aos-delay={index * 75}>
                <span className="service-card__icon" aria-hidden="true"><service.Icon /></span>
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
            {steps.map((step, index) => (
              <div key={step.number} className="process-step" data-aos="zoom-in" data-aos-delay={index * 100}>
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
