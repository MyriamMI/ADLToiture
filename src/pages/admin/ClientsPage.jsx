import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "../../services/api";
import "./styles/ClientsPage.css";

/* Onglets de filtre */
const TABS = [
  { label: "Tous",     filter: null },
  { label: "Nouveau",  filter: "nouveau" },
  { label: "En attente", filter: "en_cours" },
  { label: "Terminé",  filter: "termine" },
  { label: "Annulé",   filter: "annule" },
];

const STATUT_CLIENT_LABEL = {
  nouveau:  'Nouveau',
  en_cours: 'En cours',
  termine:  'Terminé',
  annule:   'Annulé',
};

/* Formulaire vide */
const EMPTY_FORM = {
  nom: "",
  telephone: "",
  email: "",
  ville: "",
  statut: "nouveau",
  notes: "",
};

/* ── Fonctions utilitaires ── */

function getInitials(nom) {
  if (!nom) return '?'
  return nom.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const STATUS_CLASS = {
  nouveau:  "status-badge--new",
  en_cours: "status-badge--pending",
  termine:  "status-badge--done",
  annule:   "status-badge--cancelled",
};

const STATUS_LABEL = {
  nouveau:  "Nouveau",
  en_cours: "En attente",
  termine:  "Terminé",
  annule:   "Annulé",
};

function statusClass(statut) {
  return STATUS_CLASS[statut] ?? "status-badge--new";
}

function statusLabel(statut) {
  return STATUS_LABEL[statut] ?? statut;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso.replace(" ", "T")).toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ══════════════════════════════════════════
   Composant principal
══════════════════════════════════════════ */
export default function ClientsPage() {
  const location = useLocation();
  /* ── État ── */
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(null);

  /* Client sélectionné pour le panneau de détail */
  const [detail, setDetail] = useState(null);

  /* Modal formulaire : { type: 'create'|'edit'|null, client: null|object } */
  const [modal, setModal] = useState({ type: null, client: null });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [telError, setTelError]       = useState('');
  const [emailError, setEmailError]   = useState('');
  const [serverError, setServerError] = useState('');
  const [villeError, setVilleError]   = useState('');

  /* ── Chargement des données ── */
  useEffect(() => {
    getClients()
      .then(setClients)
      .catch((err) =>
        setError(err.message || "Unable to load clients."),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const detailId = location.state?.detailId
    if (detailId && clients.length > 0) {
      const client = clients.find((c) => c.id === detailId)
      if (client) {
        openDetail(client)
        window.history.replaceState({}, document.title)
      }
    }
  }, [clients])

  /* ── Verrouillage du défilement quand une modal est ouverte ── */
  useEffect(() => {
    const isOpen = detail !== null || modal.type !== null;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [detail, modal.type]);

  /* ── Filtrage combiné : recherche + onglet ── */
  const filtered = clients.filter((c) => {
    const matchSearch = (c.nom ?? '').toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === null || c.statut === activeTab;
    return matchSearch && matchTab;
  });

  /* Compteur par statut pour les onglets */
  function countFor(filter) {
    if (!filter) {
      return search
        ? clients.filter((c) =>
            c.nom.toLowerCase().includes(search.toLowerCase()),
          ).length
        : clients.length;
    }
    return clients.filter(
      (c) =>
        c.statut === filter &&
        c.nom.toLowerCase().includes(search.toLowerCase()),
    ).length;
  }

  /* ══════════════════════════════
     Panneau de détail
  ══════════════════════════════ */

  function openDetail(client) {
    setDetail(client);
  }

  const closeDetail = useCallback(() => {
    setDetail(null);
  }, []);

  /* ══════════════════════════════
     Actions CRUD
  ══════════════════════════════ */

  function openCreateModal() {
    setFormData(EMPTY_FORM);
    setModal({ type: "create", client: null });
  }

  function openEditModal(client) {
    setFormData({
      nom: client.nom,
      telephone: client.telephone,
      email: client.email,
      ville: client.ville,
      statut: client.statut,
      notes: client.notes || "",
    });
    setModal({ type: "edit", client });
    /* Fermer le panneau de détail avant d'ouvrir le formulaire */
    setDetail(null);
  }

  function resetErrors() {
    setTelError(''); setEmailError(''); setServerError(''); setVilleError('');
  }

  const closeModal = useCallback(() => {
    setModal({ type: null, client: null });
    resetErrors();
  }, []);

  function handleFormChange(e) {
    const { name, value } = e.target;
    if (name === 'telephone') { setTelError(''); setEmailError(''); }
    if (name === 'email')     { setEmailError(''); setTelError(''); }
    if (name === 'nom' || name === 'telephone' || name === 'email') setServerError('');
    if (name === 'ville') setVilleError('');
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validateContactForm() {
    const tel   = formData.telephone?.trim() ?? '';
    const email = formData.email?.trim()     ?? '';
    const ville = formData.ville?.trim()     ?? '';
    let valid   = true;

    // Ville obligatoire
    if (!ville) {
      setVilleError('City is required.');
      valid = false;
    } else {
      setVilleError('');
    }

    // Au moins un contact OU validation de format
    if (!tel && !email) {
      setTelError('');
      setEmailError('Please provide at least a phone number or an email.');
      valid = false;
    } else {
      setTelError(tel && !/^[+\d][\d\s\-().]{5,}$/.test(tel)
        ? "Phone number is not valid."
        : '');
      setEmailError(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? "Email address is not valid."
        : '');
      if (
        (tel   && !/^[+\d][\d\s\-().]{5,}$/.test(tel)) ||
        (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      ) valid = false;
    }

    return valid;
  }

  /* Créer un nouveau client */
  async function handleCreate(e) {
    e.preventDefault();
    if (!validateContactForm()) return;
    try {
      await createClient(formData);
      const all = await getClients();
      setClients(all);
      closeModal();
    } catch (err) {
      if (err.message.includes('already exists')) {
        setServerError(err.message);
      } else {
        setError(err.message || "Error creating client.");
      }
    }
  }

  /* Enregistrer les modifications */
  async function handleUpdate(e) {
    e.preventDefault();
    if (!validateContactForm()) return;
    try {
      await updateClient(modal.client.id, formData);
      const all = await getClients();
      setClients(all);
      closeModal();
    } catch (err) {
      if (err.message.includes('already exists')) {
        setServerError(err.message);
      } else {
        setError(err.message || "Error updating client.");
      }
    }
  }

  /* Supprimer un client */
  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce contact ? Ses données personnelles seront anonymisées (RGPD) mais l'historique des RDV et devis sera conservé.")) return;
    try {
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      closeDetail();
    } catch (err) {
      setError(err.message || "Error deleting client.");
    }
  }

  /* ── Rendu ── */
  if (loading) {
    return (
      <div className="cli-page">
        <p style={{ color: "rgba(0,0,0,0.4)", fontSize: "0.875rem" }}>
          Chargement…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cli-page">
        <p style={{ color: "#c0392b", fontSize: "0.875rem" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="cli-page">
      {/* ── En-tête de page ── */}
      <div className="cli-page__header">
        <h1 className="cli-page__title">Clients</h1>
        <button className="cli-page__new-btn" onClick={openCreateModal}>
          <i className="fas fa-plus"></i> Nouveau client
        </button>
      </div>

      {/* ── Champ de recherche ── */}
      <div className="cli-search-wrap">
        <input
          type="search"
          className="cli-search"
          placeholder="Rechercher un client…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Rechercher un client"
        />
      </div>

      {/* ── Onglets de filtre ── */}
      <div className="cli-tabs" role="tablist" aria-label="Filtrer par statut">
        {TABS.map(({ label, filter }) => (
          <button
            key={label}
            role="tab"
            aria-selected={activeTab === filter}
            className={
              "cli-tab" + (activeTab === filter ? " cli-tab--active" : "")
            }
            onClick={() => setActiveTab(filter)}
          >
            {label}
            <span className="cli-tab__count">{countFor(filter)}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════
          Tableau — bureau
      ══════════════════════════════ */}
      <div className="cli-table-card">
        <div className="cli-table-wrap">
          <table className="cli-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Localité</th>
                <th>Date d'ajout</th>
                <th>Statut</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="cli-table__empty">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr key={client.id}>
                    {/* Cellule client avec avatar initiales */}
                    <td>
                      <div className="table-client">
                        <span className="table-avatar" aria-hidden="true">
                          {getInitials(client.nom)}
                        </span>
                        <span className="table-client__name">{client.nom}</span>
                      </div>
                    </td>

                    {/* Localité */}
                    <td>{client.ville}</td>

                    {/* Date d'ajout */}
                    <td>{formatDate(client.date_creation)}</td>

                    {/* Badge de statut */}
                    <td>
                      <span
                        className={`status-badge ${statusClass(client.statut)}`}
                      >
                        {statusLabel(client.statut)}
                      </span>
                    </td>

                    {/* Bouton d'information — ouvre le panneau de détail */}
                    <td>
                      <button
                        className="cli-info-btn"
                        title="Voir le profil"
                        aria-label={`Voir le profil de ${client.nom}`}
                        onClick={() => openDetail(client)}
                      >
                        <i className="fas fa-info-circle"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════
          Cartes — mobile
      ══════════════════════════════ */}
      <div className="cli-cards">
        {filtered.length === 0 && (
          <p
            style={{
              textAlign: "center",
              color: "rgba(0,0,0,0.35)",
              fontSize: "0.875rem",
            }}
          >
            Aucun client trouvé.
          </p>
        )}
        {filtered.map((client) => (
          /* Toute la carte est cliquable pour ouvrir le détail */
          <div
            key={client.id}
            className="cli-card"
            role="button"
            tabIndex={0}
            aria-label={`Voir le profil de ${client.nom}`}
            onClick={() => openDetail(client)}
            onKeyDown={(e) => e.key === "Enter" && openDetail(client)}
          >
            {/* Avatar initiales */}
            <span className="table-avatar" aria-hidden="true">
              {getInitials(client.nom)}
            </span>

            {/* Informations textuelles */}
            <div className="cli-card__info">
              <p className="cli-card__name">{client.nom}</p>
              <p className="cli-card__meta">
                {client.ville} · {formatDate(client.date_creation)}
              </p>
            </div>

            {/* Badge de statut */}
            <span className={`status-badge ${statusClass(client.statut)}`}>
              {statusLabel(client.statut)}
            </span>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════
          Panneau de détail client
      ══════════════════════════════ */}
      {detail !== null && (
        /* Fermeture en cliquant sur le fond */
        <div
          className="cli-detail"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cli-detail-name"
          onClick={closeDetail}
        >
          <div
            className="cli-detail__panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête — grand avatar + nom + statut */}
            <div className="cli-detail__head">
              <button
                className="cli-detail__close"
                onClick={closeDetail}
                aria-label="Fermer"
              >
                <i className="fas fa-times"></i>
              </button>
              <div className="cli-detail__avatar" aria-hidden="true">
                {getInitials(detail.nom)}
              </div>
              <h2 className="cli-detail__name" id="cli-detail-name">
                {detail.nom}
              </h2>
              <span className={`status-badge ${statusClass(detail.statut)}`}>
                {statusLabel(detail.statut)}
              </span>
            </div>

            {/* Corps — informations du contact */}
            <div className="cli-detail__body">
              {/* Téléphone */}
              <div className="cli-detail__row">
                <span className="cli-detail__row-icon" aria-hidden="true">
                  <i className="fas fa-phone"></i>
                </span>
                <div>
                  <p className="cli-detail__row-label">Téléphone</p>
                  <p className="cli-detail__row-value">
                    {detail.telephone || "—"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="cli-detail__row">
                <span className="cli-detail__row-icon" aria-hidden="true">
                  <i className="fas fa-envelope"></i>
                </span>
                <div>
                  <p className="cli-detail__row-label">Email</p>
                  <p className="cli-detail__row-value">{detail.email || "—"}</p>
                </div>
              </div>

              {/* Localité */}
              <div className="cli-detail__row">
                <span className="cli-detail__row-icon" aria-hidden="true">
                  <i className="fas fa-map-marker-alt"></i>
                </span>
                <div>
                  <p className="cli-detail__row-label">Localité</p>
                  <p className="cli-detail__row-value">{detail.ville || "—"}</p>
                </div>
              </div>

              {/* Date d'ajout */}
              <div className="cli-detail__row">
                <span className="cli-detail__row-icon" aria-hidden="true">
                  <i className="fas fa-calendar-alt"></i>
                </span>
                <div>
                  <p className="cli-detail__row-label">Ajouté le</p>
                  <p className="cli-detail__row-value">
                    {formatDate(detail.date_creation)}
                  </p>
                </div>
              </div>

              {/* Notes — affichées uniquement si présentes */}
              {detail.notes && (
                <>
                  <hr className="cli-detail__divider" />
                  <div className="cli-detail__row">
                    <span className="cli-detail__row-icon" aria-hidden="true">
                      <i className="fas fa-sticky-note"></i>
                    </span>
                    <div>
                      <p className="cli-detail__row-label">Notes</p>
                      <p className="cli-detail__notes">{detail.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pied — actions */}
            <div className="cli-detail__footer">
              {/* Suppression du contact */}
              <button
                className="cli-detail__delete-btn"
                onClick={() => handleDelete(detail.id)}
              >
                Anonymiser le contact (RGPD)
              </button>
              {/* Ouverture du formulaire de modification */}
              <button
                className="cli-detail__edit-btn"
                onClick={() => openEditModal(detail)}
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          Modal — Nouveau / Modifier client
      ══════════════════════════════ */}
      {modal.type !== null && (
        <div
          className="cli-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cli-modal-title"
          onClick={closeModal}
        >
          <div
            className="cli-modal__dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête rouge foncé */}
            <div className="cli-modal__header">
              <h2 className="cli-modal__title" id="cli-modal-title">
                {modal.type === "create"
                  ? "Nouveau client"
                  : "Modifier le client"}
              </h2>
              <button
                className="cli-modal__close"
                onClick={closeModal}
                aria-label="Fermer"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Corps — formulaire */}
            <form
              className="cli-modal__body"
              onSubmit={modal.type === "create" ? handleCreate : handleUpdate}
            >
              {/* Nom complet */}
              <div className="cli-modal__field">
                <label className="cli-modal__label" htmlFor="cli-nom">
                  Nom complet
                </label>
                <input
                  id="cli-nom"
                  name="nom"
                  type="text"
                  className="cli-modal__input"
                  placeholder="Prénom Nom"
                  value={formData.nom}
                  onChange={handleFormChange}
                  required
                />
              </div>

              {/* Téléphone */}
              <div className="cli-modal__field">
                <label className="cli-modal__label" htmlFor="cli-telephone">
                  Téléphone
                </label>
                <input
                  id="cli-telephone"
                  name="telephone"
                  type="tel"
                  className={`cli-modal__input${telError ? ' cli-modal__input--error' : ''}`}
                  placeholder="+32 4XX XXX XXX"
                  value={formData.telephone}
                  onChange={handleFormChange}
                />
                {telError && <p className="cli-modal__error">{telError}</p>}
              </div>

              {/* Email */}
              <div className="cli-modal__field">
                <label className="cli-modal__label" htmlFor="cli-email">
                  Email
                </label>
                <input
                  id="cli-email"
                  name="email"
                  type="email"
                  className={`cli-modal__input${emailError ? ' cli-modal__input--error' : ''}`}
                  placeholder="adresse@email.com"
                  value={formData.email}
                  onChange={handleFormChange}
                />
                {emailError && <p className="cli-modal__error">{emailError}</p>}
              </div>

              {/* Localité */}
              <div className="cli-modal__field">
                <label className="cli-modal__label" htmlFor="cli-ville">
                  Localité
                </label>
                <input
                  id="cli-ville"
                  name="ville"
                  type="text"
                  className={`cli-modal__input${villeError ? ' cli-modal__input--error' : ''}`}
                  placeholder="Ville ou commune"
                  value={formData.ville}
                  onChange={handleFormChange}
                />
                {villeError && (
                  <p className="cli-modal__error">{villeError}</p>
                )}
              </div>

              {/* Statut — Nouveau contact par défaut */}
              <div className="cli-modal__field">
                <label className="cli-modal__label" htmlFor="cli-statut">
                  Statut
                </label>
                <select
                  id="cli-statut"
                  name="statut"
                  className="cli-modal__select"
                  value={formData.statut}
                  onChange={handleFormChange}
                >
                  <option value="nouveau">Nouveau</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>

              {/* Notes libres */}
              <div className="cli-modal__field">
                <label className="cli-modal__label" htmlFor="cli-notes">
                  Notes
                </label>
                <textarea
                  id="cli-notes"
                  name="notes"
                  className="cli-modal__textarea"
                  placeholder="Informations complémentaires…"
                  value={formData.notes}
                  onChange={handleFormChange}
                />
              </div>

              {serverError && (
                <p className="cli-modal__server-error">{serverError}</p>
              )}

              {/* Pied — annuler / soumettre */}
              <div className="cli-modal__footer">
                <button
                  type="button"
                  className="cli-modal__cancel"
                  onClick={closeModal}
                >
                  Annuler
                </button>
                <button type="submit" className="cli-modal__submit">
                  {modal.type === "create"
                    ? "Créer le client"
                    : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
