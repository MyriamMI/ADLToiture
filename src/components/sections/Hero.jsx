import { Link } from 'react-router-dom'
import './styles/Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <h1 className="hero__title" data-aos="fade-up">
            Expert couvreur
            <br />
            en Brabant wallon
          </h1>
          <p className="hero__subtitle" data-aos="fade-up" data-aos-delay="100">
            Dylan Laurent, artisan couvreur indépendant depuis 10&nbsp;ans.
            <br />
            Pose neuve, rénovation, zinguerie, isolation et entretien —
            <br />
            devis gratuit, intervention rapide dans tout le Brabant wallon.
          </p>
          <div className="hero__actions" data-aos="fade-up" data-aos-delay="200">
            <Link to="/contact" className="hero__btn hero__btn--primary">
              Demander un devis gratuit
            </Link>
            <Link to="/services" className="hero__btn hero__btn--outline">
              Découvrir mes services
            </Link>
          </div>
        </div>

        <div className="hero__image">
          <img
            src="https://images.unsplash.com/photo-1686824043273-61876c9bc56a?auto=format&fit=crop&w=1200&q=80"
            alt="Dylan Laurent, couvreur au travail sur une toiture en Brabant wallon"
            className="hero__img"
            loading="eager"
          />
        </div>
      </div>
    </section>
  )
}
