import './styles/Services.css'

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
                <i className="fas fa-check services__check" aria-hidden="true"></i>
                {service}
              </li>
            ))}
          </ul>
        </div>

        <div className="services__image">
          <img
            src="https://images.unsplash.com/photo-1605463556751-8c283631e95d?q=80&w=1200&auto=format&fit=crop"
            alt="Ardoises grises sur une toiture en Brabant wallon"
            className="services__img"
            loading="lazy"
          />
        </div>

      </div>
    </section>
  )
}
