import {
  FaRegGem, FaRegSmile, FaRegCheckCircle, FaRegClock,
} from 'react-icons/fa'
import './styles/AboutPage.css'

const stats = [
  { value: '10+', label: "Années d'expérience" },
  { value: '350+', label: 'Toitures réalisées' },
  { value: '100%', label: 'Clients satisfaits' },
  { value: 'BW', label: 'Brabant wallon' },
]

const values = [
  {
    Icon: FaRegGem,
    title: 'Professionnalisme',
    description: "Chaque chantier est préparé et exécuté selon les règles de l'art, avec les matériaux adaptés et dans le strict respect des normes en vigueur.",
  },
  {
    Icon: FaRegSmile,
    title: 'Satisfaction client',
    description: "Votre satisfaction est ma priorité absolue. Je reste disponible avant, pendant et après les travaux pour répondre à toutes vos questions.",
  },
  {
    Icon: FaRegCheckCircle,
    title: 'Qualité des matériaux',
    description: "Je sélectionne des matériaux durables auprès de fournisseurs belges reconnus, garantissant la longévité et l'esthétique de votre toiture.",
  },
  {
    Icon: FaRegClock,
    title: 'Ponctualité',
    description: "Je m'engage à respecter les délais convenus dès la signature du devis, et à vous prévenir immédiatement en cas d'aléa sur le chantier.",
  },
]

export default function AboutPage() {
  return (
    <main className="about-page">

      {/* Hero header */}
      <section className="about-page__hero">
        <div className="about-page__hero-container">
          <h1 className="about-page__hero-title">
            Dylan Laurent, artisan couvreur
          </h1>
          <p className="about-page__hero-subtitle">
            Couvreur indépendant basé en Brabant wallon depuis 2015, je réalise
            tous vos travaux de toiture avec rigueur et transparence — du premier
            diagnostic jusqu'à la réception du chantier.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="about-page__stats">
        <div className="about-page__container">
          <div className="about-page__stats-grid">
            {stats.map((stat, index) => (
              <div key={stat.label} className="stat-item" data-aos="fade-up" data-aos-delay={index * 100}>
                <span className="stat-item__value">{stat.value}</span>
                <span className="stat-item__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parcours */}
      <section className="about-page__parcours">
        <div className="about-page__container about-page__two-col">
          <div className="about-page__parcours-content">
            <h2 className="about-page__section-title">Mon parcours</h2>
            <p className="about-page__text">
              Natif de Wavre, j'ai commencé ma formation dans la couverture à
              18&nbsp;ans en apprentissage chez un maître couvreur du Brabant
              wallon. Passionné par les métiers du bâtiment et le travail en
              hauteur, j'ai obtenu mon certificat de qualification en couverture
              avant de travailler plusieurs années comme compagnon sur des
              chantiers variés de la région.
            </p>
            <p className="about-page__text">
              En 2015, j'ai fondé ADL&nbsp;Toiture pour exercer mon métier en
              toute indépendance et offrir à mes clients un service de proximité
              qu'une grande entreprise ne peut pas toujours garantir. En dix ans,
              j'ai développé une expertise complète&nbsp;: pose neuve sur ossature
              bois, rénovation ardoise et tuile, zinguerie, isolation thermique
              par l'extérieur et entretien préventif.
            </p>
            <p className="about-page__text">
              J'interviens seul ou avec des collaborateurs de confiance selon
              l'ampleur du chantier, pour garantir un suivi personnalisé de bout
              en bout. De la première visite jusqu'à la réception des travaux,
              vous avez toujours le même interlocuteur — et ça fait toute la
              différence.
            </p>
          </div>
          <div className="about-page__parcours-image">
            <img
              src="https://images.unsplash.com/photo-1635424709961-f3a150459ad4?q=80&w=1200&auto=format&fit=crop"
              alt="Dylan Laurent, couvreur en intervention sur un toit en Brabant wallon"
              className="about-page__parcours-img"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="about-page__values">
        <div className="about-page__container">
          <h2 className="about-page__section-title about-page__section-title--center">
            Mes valeurs
          </h2>
          <div className="about-page__values-grid">
            {values.map((value) => (
              <div key={value.title} className="value-card">
                <value.Icon className="value-card__icon" aria-hidden="true" />
                <h3 className="value-card__title">{value.title}</h3>
                <p className="value-card__description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
