import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock,
} from 'react-icons/fa';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles/ContactPage.css";
import { sendDemande } from '../services/api';

/* -- Correction icône Leaflet par défaut (CDN) -- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const infoCards = [
  { label: "Téléphone", value: "0470 00 00 00", Icon: FaPhone },
  { label: "Email", value: "info@adltoiture.be", Icon: FaEnvelope },
  { label: "Zone", value: "Brabant wallon", Icon: FaMapMarkerAlt },
  { label: "Dispo", value: "08h00 – 18h00", Icon: FaClock },
];

const faqs = [
  { question: "Délai pour un devis ?", answer: "Je réponds sous 24h." },
  { question: "Urgences ?", answer: "Oui, selon la zone d'intervention." },
  { question: "Devis gratuit ?", answer: "Oui, sans engagement." },
  {
    question: "Zone d'intervention ?",
    answer: "Principalement le Brabant wallon.",
  },
];

const SERVICES = [
  "Pose de toiture neuve",
  "Rénovation de couverture",
  "Zinguerie",
  "Isolation toiture",
  "Installation Velux",
  "Réparation urgente",
  "Nettoyage / traitement",
  "Inspection / diagnostic",
];

const INITIAL_FORM = {
  nom: "",
  tel: "",
  ville: "",
  email: "",
  service: "",
  surface: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const [rgpd, setRgpd] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    try {
      await sendDemande({
        nom:       form.nom,
        telephone: form.tel,
        email:     form.email   || null,
        ville:     form.ville,
        service:   form.service || null,
        surface:   form.surface || null,
        message:   form.message || null,
      })
      setStatus('success')
      setForm(INITIAL_FORM)
    } catch (err) {
      setStatus('idle')
      alert('Erreur lors de l\'envoi. Veuillez réessayer.')
    }
  }

  useEffect(() => {
    const map = L.map("contact-map").setView([50.58, 4.55], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);

    L.marker([50.58, 4.55])
      .addTo(map)
      .bindPopup("ADL Toiture — Brabant wallon");

    return () => map.remove();
  }, []);

  return (
    <main className="contact-page">
      {/* ── Hero ── */}
      <section className="contact-page__hero">
        <div className="contact-page__hero-container">
          <h1 className="contact-page__hero-title" data-aos="fade-up">
            Contactez-moi
          </h1>
          <p
            className="contact-page__hero-subtitle"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Une question ou un projet de toiture ? Je suis disponible
            rapidement.
          </p>
        </div>
      </section>

      {/* ── Cartes info ── */}
      <section className="contact-page__info">
        <div className="contact-page__container">
          <div className="contact-page__info-grid">
            {infoCards.map((card, index) => (
              <div
                key={card.label}
                className="info-card"
                data-aos="fade-up"
                data-aos-delay={index * 75}
              >
                <card.Icon className="info-card__icon" aria-hidden="true" />
                <span className="info-card__label">{card.label}</span>
                <span className="info-card__value">{card.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section deux colonnes ── */}
      <section className="contact-page__main">
        <div className="contact-page__container contact-page__two-col">
          {/* Colonne gauche — formulaire + carte */}
          <div
            className="contact-page__left"
            data-aos="fade-up"
            data-aos-delay="0"
          >
            <h2 className="contact-page__col-title">
              Demander un devis gratuit
            </h2>

            {status === "success" ? (
              <div className="contact-form__success">
                <p className="contact-form__success-title">Demande envoyée !</p>
                <p>
                  Votre demande a bien été reçue. Je vous recontacte dans les
                  plus brefs délais.
                </p>
                <button
                  className="contact-form__reset"
                  onClick={() => setStatus("idle")}
                >
                  Faire une nouvelle demande
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                {/* Nom + Téléphone */}
                <div className="contact-form__row">
                  <div className="contact-form__group">
                    <label className="contact-form__label" htmlFor="cf-nom">
                      Nom complet{" "}
                      <span
                        className="contact-form__required"
                        aria-hidden="true"
                      >
                        *
                      </span>
                    </label>
                    <input
                      id="cf-nom"
                      name="nom"
                      type="text"
                      className="contact-form__input"
                      value={form.nom}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="contact-form__group">
                    <label className="contact-form__label" htmlFor="cf-tel">
                      Téléphone{" "}
                      <span
                        className="contact-form__required"
                        aria-hidden="true"
                      >
                        *
                      </span>
                    </label>
                    <input
                      id="cf-tel"
                      name="tel"
                      type="tel"
                      className="contact-form__input"
                      value={form.tel}
                      onChange={handleChange}
                      required
                      autoComplete="tel"
                      placeholder="0470 00 00 00"
                    />
                  </div>
                </div>

                {/* Ville */}
                <div className="contact-form__group">
                  <label className="contact-form__label" htmlFor="cf-ville">
                    Ville{" "}
                    <span
                      className="contact-form__required"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </label>
                  <input
                    id="cf-ville"
                    name="ville"
                    type="text"
                    className="contact-form__input contact-form__input--half"
                    value={form.ville}
                    onChange={handleChange}
                    required
                    autoComplete="address-level2"
                    placeholder="ex. Wavre"
                  />
                </div>

                {/* Email + Type de service */}
                <div className="contact-form__row">
                  <div className="contact-form__group">
                    <label className="contact-form__label" htmlFor="cf-email">
                      Email
                    </label>
                    <input
                      id="cf-email"
                      name="email"
                      type="email"
                      className="contact-form__input"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      placeholder="jean@exemple.be"
                    />
                  </div>
                  <div className="contact-form__group">
                    <label className="contact-form__label" htmlFor="cf-service">
                      Type de service
                    </label>
                    <select
                      id="cf-service"
                      name="service"
                      className="contact-form__select"
                      value={form.service}
                      onChange={handleChange}
                    >
                      <option value="">— Sélectionner —</option>
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Surface */}
                <div className="contact-form__group">
                  <label className="contact-form__label" htmlFor="cf-surface">
                    Surface approximative (m²)
                  </label>
                  <input
                    id="cf-surface"
                    name="surface"
                    type="number"
                    min="1"
                    className="contact-form__input contact-form__input--half"
                    value={form.surface}
                    onChange={handleChange}
                    placeholder="ex. 80"
                  />
                </div>

                {/* Message */}
                <div className="contact-form__group">
                  <label className="contact-form__label" htmlFor="cf-message">
                    Message / précisions supplémentaires
                  </label>
                  <textarea
                    id="cf-message"
                    name="message"
                    className="contact-form__textarea"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Décrivez votre projet, l'état actuel de votre toiture…"
                  />
                </div>

                {/* Pied du formulaire */}
                <div className="contact-form__footer">
                  <label className="contact-form__rgpd-label">
                    <input
                      type="checkbox"
                      className="contact-form__rgpd-check"
                      checked={rgpd}
                      onChange={(e) => setRgpd(e.target.checked)}
                      required
                    />
                    En soumettant ce formulaire, j'accepte que mes données
                    soient utilisées pour traiter ma demande, conformément à la{" "}
                    <Link to="/politique-confidentialite">
                      politique de confidentialité
                    </Link>
                    .
                  </label>
                  <button
                    type="submit"
                    className="contact-form__submit"
                    disabled={status === "submitting" || !rgpd}
                  >
                    {status === "submitting"
                      ? "Envoi en cours…"
                      : "Envoyer ma demande"}
                  </button>
                </div>
              </form>
            )}

            <h3 className="contact-page__map-title">Zones d'intervention</h3>
            <div id="contact-map" className="contact-page__map" />
          </div>

          {/* Colonne droite — FAQ accordion */}
          <div
            className="contact-page__right"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <h2 className="contact-page__col-title">Questions fréquentes</h2>

            <div className="contact-page__faq">
              {faqs.map((faq) => (
                <details key={faq.question} className="faq-item">
                  <summary className="faq-item__question">
                    {faq.question}
                  </summary>
                  <p className="faq-item__answer">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
