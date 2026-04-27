import { Link } from 'react-router-dom'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <h1 className="hero__title" data-aos="fade-up">
            Expert couvreur
            <br />
            en toiture
          </h1>
          <p className="hero__subtitle" data-aos="fade-up" data-aos-delay="100">
            Artisan couvreur basé en Brabant wallon.
            <br />
            Pose, rénovation, zinguerie, isolation et entretien <br/>
              J'interviens
            sur tous types de toitures
          </p>
          <div className="hero__actions" data-aos="fade-up" data-aos-delay="200">
            <Link to="/contact" className="hero__btn hero__btn--primary">
              Demander un devis gratuit
            </Link>
            <Link to="/services" className="hero__btn hero__btn--outline">
              En savoir plus
            </Link>
          </div>
        </div>

        <div className="hero__image">
          <div className="hero__image-placeholder" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
