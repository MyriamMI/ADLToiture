import './AboutPage.css'

const stats = [
  { value: '15+', label: "Années d'expérience" },
  { value: '500+', label: 'Toitures traitées' },
  { value: '100%', label: 'Clients satisfaits' },
  { value: 'BW', label: 'Brabant wallon' },
]

const values = [
  {
    title: 'Professionnalisme',
    description: "Chaque chantier est réalisé selon les règles de l'art, avec les matériaux adaptés et dans le respect des normes en vigueur.",
  },
  {
    title: 'Satisfaction client',
    description: "Votre satisfaction est ma priorité. Je reste disponible avant, pendant et après les travaux pour répondre à vos questions.",
  },
  {
    title: 'Respect des matériaux',
    description: "Je sélectionne des matériaux de qualité, durables et adaptés à chaque type de toiture pour garantir la longévité des travaux.",
  },
  {
    title: 'Ponctualité',
    description: "Je m'engage à respecter les délais convenus et à intervenir dans les meilleurs délais, notamment pour les urgences.",
  },
]

export default function AboutPage() {
  return (
    <main className="about-page">

      {/* Hero header */}
      <section className="about-page__hero">
        <div className="about-page__hero-container">
          <h1 className="about-page__hero-title">
            À propos de votre expert en toiture
          </h1>
          <p className="about-page__hero-subtitle">
            Artisan couvreur indépendant basé en Brabant wallon, je mets
            mon expérience et mon savoir-faire au service de vos projets
            de toiture depuis plus de 15 ans.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="about-page__stats">
        <div className="about-page__container">
          <div className="about-page__stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-item">
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
              Passionné par les métiers du bâtiment depuis mon plus jeune âge,
              j'ai obtenu mon certificat de qualification en couverture avant
              de me lancer en tant qu'artisan indépendant en Brabant wallon.
            </p>
            <p className="about-page__text">
              Au fil des années, j'ai développé une expertise complète couvrant
              tous les aspects de la toiture&nbsp;: pose neuve, rénovation,
              zinguerie, isolation et entretien. Chaque chantier est une
              opportunité de perfectionner mon travail et de renforcer la
              confiance de mes clients.
            </p>
            <p className="about-page__text">
              Travaillant en solo ou avec des collaborateurs de confiance selon
              l'ampleur des projets, je garantis un suivi personnalisé et une
              qualité constante sur chaque intervention.
            </p>
          </div>
          <div className="about-page__parcours-image">
            <div className="about-page__image-placeholder" aria-hidden="true" />
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
                <div className="value-card__icon" aria-hidden="true" />
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
