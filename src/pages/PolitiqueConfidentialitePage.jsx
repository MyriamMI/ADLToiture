import './styles/PolitiqueConfidentialitePage.css'

const sections = [
  {
    title: '1. Responsable du traitement',
    content: [
      "ADL Toiture, artisan couvreur indépendant basé en Brabant wallon (Belgique), est responsable du traitement de vos données personnelles collectées via ce site.",
      "Pour toute question relative à la protection de vos données, vous pouvez nous contacter à l'adresse indiquée dans la section Contact.",
    ],
  },
  {
    title: '2. Données collectées',
    content: [
      "Nous collectons uniquement les données que vous nous transmettez volontairement via le formulaire de contact ou la demande de devis&nbsp;: nom, prénom, adresse e-mail, numéro de téléphone et le contenu de votre message.",
      "Aucune donnée sensible (origine ethnique, santé, croyances, etc.) n'est collectée.",
    ],
  },
  {
    title: '3. Finalités du traitement',
    content: [
      "Vos données sont utilisées exclusivement pour&nbsp;: répondre à vos demandes de contact ou de devis, planifier et assurer le suivi de vos rendez-vous, et améliorer la qualité de nos services.",
      "Elles ne sont ni vendues, ni louées, ni transmises à des tiers à des fins commerciales.",
    ],
  },
  {
    title: '4. Base légale',
    content: [
      "Le traitement est fondé sur votre consentement (art. 6, §1, a du RGPD) lorsque vous soumettez un formulaire, et sur l'exécution d'un contrat (art. 6, §1, b) lorsque vous sollicitez une intervention.",
    ],
  },
  {
    title: '5. Durée de conservation',
    content: [
      "Vos données sont conservées pendant la durée nécessaire à la finalité pour laquelle elles ont été collectées, et au maximum 3 ans après le dernier contact, sauf obligation légale contraire.",
    ],
  },
  {
    title: '6. Vos droits',
    content: [
      "Conformément au RGPD, vous disposez des droits suivants&nbsp;: accès à vos données, rectification, effacement, limitation du traitement, portabilité et opposition.",
      "Pour exercer ces droits, contactez-nous par e-mail ou courrier. Nous nous engageons à répondre dans un délai d'un mois.",
      "Vous avez également le droit d'introduire une réclamation auprès de l'Autorité de protection des données (APD) belge&nbsp;: www.autoriteprotectiondonnees.be.",
    ],
  },
  {
    title: '7. Cookies',
    content: [
      "Ce site n'utilise que des cookies techniques strictement nécessaires au bon fonctionnement de la navigation. Aucun cookie publicitaire ou de traçage tiers n'est déposé.",
    ],
  },
  {
    title: '8. Sécurité',
    content: [
      "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation.",
    ],
  },
  {
    title: '9. Modifications',
    content: [
      "Cette politique peut être mise à jour pour refléter les évolutions légales ou organisationnelles. La date de dernière mise à jour est indiquée en bas de page.",
    ],
  },
]

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="politique-page">

      {/* Hero header */}
      <section className="politique-page__hero">
        <div className="politique-page__hero-container">
          <h1 className="politique-page__hero-title">
            Politique de confidentialité
          </h1>
          <p className="politique-page__hero-subtitle">
            Conformément au Règlement général sur la protection des données (RGPD),
            nous vous informons de la manière dont vos données personnelles sont
            collectées, utilisées et protégées.
          </p>
        </div>
      </section>

      {/* Contenu */}
      <section className="politique-page__content">
        <div className="politique-page__container">

          <p className="politique-page__intro">
            Dernière mise à jour&nbsp;: mai 2025
          </p>

          <div className="politique-page__sections">
            {sections.map((section) => (
              <div key={section.title} className="politique-section">
                <h2 className="politique-section__title">{section.title}</h2>
                {section.content.map((paragraph, i) => (
                  <p
                    key={i}
                    className="politique-section__text"
                    dangerouslySetInnerHTML={{ __html: paragraph }}
                  />
                ))}
              </div>
            ))}
          </div>

        </div>
      </section>

    </main>
  )
}
