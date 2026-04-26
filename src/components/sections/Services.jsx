import './Services.css'

const services = [
  'Pose de toiture neuve',
  'Rénovation de couverture',
  'Zinguerie complète',
  'Isolation toiture',
]

export default function Services() {
  return (
    <section className="services">
      <div className="services__container">

        <div className="services__content">
          <h2 className="services__title">
            Mon métier&nbsp;: la couverture complète
          </h2>
          <p className="services__text">
            Artisan couvreur indépendant, j'interviens sur tous types de toitures
            en Brabant wallon. Chaque chantier est réalisé avec soin, dans le
            respect des délais et des normes en vigueur.
          </p>
          <ul className="services__list">
            {services.map((service) => (
              <li key={service} className="services__item">
                <span className="services__check" aria-hidden="true">✓</span>
                {service}
              </li>
            ))}
          </ul>
        </div>

        <div className="services__image">
          <div className="services__image-placeholder" aria-hidden="true" />
        </div>

      </div>
    </section>
  )
}
