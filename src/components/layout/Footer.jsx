import { Link } from "react-router-dom";
import "./styles/Footer.css";

const SERVICES_COL1 = [
  'Pose de toiture neuve',
  'Rénovation de couverture',
  'Zinguerie',
  'Isolation toiture',
]

const SERVICES_COL2 = [
  'Velux & fenêtres de toit',
  'Nettoyage & traitement',
  "Réparation d'urgence",
  'Inspection & diagnostic',
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">

        {/* Colonne 1 — Contact */}
        <div className="footer__col">
          <h3 className="footer__heading">Contact</h3>
          <ul className="footer__list">
            <li><a href="tel:+32470000000">0470 00 00 00</a></li>
            <li><a href="mailto:info@adltoiture.be">info@adltoiture.be</a></li>
            <li>Brabant wallon, Belgique</li>
          </ul>
        </div>

        {/* Colonne 2 — Navigation */}
        <div className="footer__col">
          <h3 className="footer__heading">Navigation</h3>
          <ul className="footer__list">
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/about">À propos</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Colonne 3 — Services en 2 sous-colonnes */}
        <div className="footer__col">
          <h3 className="footer__heading">Services</h3>
          <div className="footer__services-grid">
            <ul className="footer__list">
              {SERVICES_COL1.map(s => <li key={s}>{s}</li>)}
            </ul>
            <ul className="footer__list">
              {SERVICES_COL2.map(s => <li key={s}>{s}</li>)}
            </ul>
          </div>
        </div>

        {/* Colonne 4 — Horaires */}
        <div className="footer__col">
          <h3 className="footer__heading">Horaires</h3>
          <ul className="footer__list">
            <li>Tous les jours</li>
            <li>08h00 – 18h00</li>
          </ul>
        </div>

      </div>

      <div className="footer__bottom">
        <a href="/admin/login" className="admin-link">Connexion</a>
        <div className="footer__bottom-inner">
          <p>&copy; 2026 ADLToiture. Tous droits réservés.</p>
          <div className="footer__bottom-links">
            <Link to="/politique-confidentialite" className="footer__bottom-legal">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
