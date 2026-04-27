import { Link } from 'react-router-dom'
import './Contact.css'

export default function Contact() {
  return (
    <section className="cta">
      <div className="cta__container">
        <h2 className="cta__title">Besoin d'un devis personnalisé&nbsp;?</h2>
        <p className="cta__subtitle">
          Contactez-moi pour un diagnostic gratuit et sans engagement.
        </p>
        <div className="cta__actions">
          <a href="tel:+32470000000" className="cta__btn cta__btn--primary">
            0470 00 00 00
          </a>
          <Link to="/contact" className="cta__btn cta__btn--outline">
            Demander un devis gratuit
          </Link>
        </div>
      </div>
    </section>
  )
}
