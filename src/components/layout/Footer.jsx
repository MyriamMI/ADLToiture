import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">

        <div className="footer__col">
          <h3 className="footer__heading">Contact</h3>
          <ul className="footer__list">
            <li>
              <a href="tel:+32470000000">0470 00 00 00</a>
            </li>
            <li>
              <a href="mailto:info@adltoiture.be">info@adltoiture.be</a>
            </li>
            <li>Brabant wallon, Belgique</li>
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__heading">Horaires</h3>
          <ul className="footer__list">
            <li>Tous les jours</li>
            <li>08h00 – 18h00</li>
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__heading">Services</h3>
          <ul className="footer__list">
            <li>Pose neuve</li>
            <li>Rénovation</li>
            <li>Zinguerie</li>
            <li>Entretien</li>
          </ul>
        </div>

      </div>

      <div className="footer__bottom">
        <p>&copy; 2026 ADLToiture. Tous droits réservés.</p>
      </div>
    </footer>
  )
}
