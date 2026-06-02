import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import {
  getDevis,
  getDevisById,
  createDevis,
  updateDevis,
  deleteDevis,
  getClients,
} from "../../services/api";
import "./styles/DevisPage.css";

const TABS = [
  { label: "Tous", filter: null },
  { label: "Brouillon", filter: "brouillon" },
  { label: "En attente", filter: "en_attente" },
  { label: "Envoyé", filter: "envoye" },
  { label: "Accepté", filter: "accepte" },
  { label: "Refusé", filter: "refuse" },
];

const STATUS_LABEL = {
  brouillon: "Brouillon",
  en_attente: "En attente",
  envoye: "Envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
};

function emptyLigne(id) {
  return { id, description: "", quantite: 1, prix_unitaire: 0 };
}

const EMPTY_FORM = {
  client_id: "",
  date_creation: "",
  notes: "",
  tva: 6,
  lignes: [],
};

/* ── Fonctions utilitaires ── */

function getInitials(name) {
  if (!name) return "?";
  return String(name)
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function statusClass(statut) {
  switch (statut) {
    case "brouillon":
      return "status-badge--draft";
    case "en_attente":
      return "status-badge--pending";
    case "envoye":
      return "status-badge--sent";
    case "accepte":
      return "status-badge--accepted";
    case "refuse":
      return "status-badge--refused";
    default:
      return "status-badge--draft";
  }
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso.replace(" ", "T")).toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatEUR(val) {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
  }).format(val ?? 0);
}

function calcSousTotal(lignes) {
  return lignes.reduce((sum, l) => sum + l.quantite * l.prix_unitaire, 0);
}

/* ══════════════════════════════════════════
   Dropdown action menu — positionnement fixe (getBoundingClientRect)
══════════════════════════════════════════ */
function DevisActionMenu({
  devis,
  openMenu,
  setOpenMenu,
  onEdit,
  onDelete,
  onGeneratePDF,
  onStatusChange,
}) {
  const isOpen = openMenu === devis.id;
  const btnRef = useRef(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const estimatedHeight = 120;
      const top =
        rect.bottom + 4 + estimatedHeight > window.innerHeight
          ? rect.top - estimatedHeight - 4
          : rect.bottom + 4;
      setDropPos({ top, left: rect.right - 160 });
    }
  }, [isOpen]);

  return (
    <div className="dv-menu-wrap">
      <button
        ref={btnRef}
        className={"dv-dots-btn" + (isOpen ? " dv-dots-btn--open" : "")}
        aria-label={`Actions pour ${devis.client_nom}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenu((prev) => (prev === devis.id ? null : devis.id));
        }}
      >
        <i className="fas fa-ellipsis-v"></i>
      </button>

      {isOpen && (
        <div
          className="dv-dropdown"
          role="menu"
          style={{ position: "fixed", top: dropPos.top, left: dropPos.left }}
        >
          <button
            className="dv-dropdown__item"
            role="menuitem"
            onClick={() => {
              onEdit(devis);
              setOpenMenu(null);
            }}
          >
            <i className="fas fa-pen"></i> Modifier
          </button>
          <button
            className="dv-dropdown__item"
            role="menuitem"
            onClick={() => onGeneratePDF(devis)}
          >
            <i className="fas fa-file-pdf"></i> Générer PDF
          </button>
          {devis.statut !== "accepte" && (
            <button
              className="dv-dropdown__item"
              role="menuitem"
              onClick={() => onStatusChange(devis, "accepte")}
            >
              <i className="fas fa-check"></i> Accepté
            </button>
          )}
          {devis.statut !== "refuse" && (
            <button
              className="dv-dropdown__item dv-dropdown__item--danger"
              role="menuitem"
              onClick={() => onStatusChange(devis, "refuse")}
            >
              <i className="fas fa-ban"></i> Refusé
            </button>
          )}
          {devis.statut !== "brouillon" && (
            <button
              className="dv-dropdown__item"
              role="menuitem"
              onClick={() => onStatusChange(devis, "brouillon")}
            >
              <i className="fas fa-undo"></i> Brouillon
            </button>
          )}
          <button
            className="dv-dropdown__item dv-dropdown__item--danger"
            role="menuitem"
            onClick={() => {
              if (window.confirm("Supprimer ce devis définitivement ?"))
                onDelete(devis.id);
            }}
          >
            <i className="fas fa-trash"></i> Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   Composant principal
══════════════════════════════════════════ */
export default function DevisPage() {
  const [devisList, setDevisList] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const [modal, setModal] = useState({ type: null, devis: null });
  const [formData, setFormData] = useState(EMPTY_FORM);

  const nextLineId = useRef(200);

  /* ── Chargement des données ── */
  useEffect(() => {
    Promise.all([getDevis(), getClients()])
      .then(([devis, cli]) => {
        setDevisList(devis);
        setClients(cli);
      })
      .catch(() => {
        setDevisList([]);
        setClients([]);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Verrouillage du défilement quand la modal est ouverte ── */
  useEffect(() => {
    document.body.style.overflow = modal.type ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal.type]);

  /* ── Filtrage combiné ── */
  const filtered = devisList.filter((d) => {
    const matchSearch = (d.client_nom ?? "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchTab = activeTab === null || d.statut === activeTab;
    return matchSearch && matchTab;
  });

  function countFor(filter) {
    const base = search
      ? devisList.filter((d) =>
          (d.client_nom ?? "").toLowerCase().includes(search.toLowerCase()),
        )
      : devisList;
    return filter
      ? base.filter((d) => d.statut === filter).length
      : base.length;
  }

  /* ── Calculs du récapitulatif financier ── */
  const sousTotal = calcSousTotal(formData.lignes);
  const tvaAmount = sousTotal * (formData.tva / 100);
  const totalTTC = sousTotal + tvaAmount;

  /* ══════════════════════════════
     Actions CRUD
  ══════════════════════════════ */

  function openCreateModal() {
    setFormData({
      ...EMPTY_FORM,
      lignes: [emptyLigne(nextLineId.current++)],
    });
    setModal({ type: "create", devis: null });
  }

  async function openEditModal(devis) {
    try {
      const full = await getDevisById(devis.id);
      setFormData({
        client_id: full.client_id ?? "",
        date_creation: full.date_creation
          ? full.date_creation.slice(0, 10)
          : "",
        notes: full.notes ?? "",
        tva: full.tva ?? 6,
        lignes: (full.lignes ?? []).map((l) => ({
          id: l.id ?? nextLineId.current++,
          description: l.description ?? "",
          quantite: l.quantite ?? 1,
          prix_unitaire: l.prix_unitaire ?? 0,
        })),
      });
    } catch {
      setFormData(EMPTY_FORM);
    }
    setModal({ type: "edit", devis });
    setOpenMenu(null);
  }

  const closeModal = useCallback(() => {
    setModal({ type: null, devis: null });
  }, []);

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleLigneChange(id, field, raw) {
    const value = field === "description" ? raw : parseFloat(raw) || 0;
    setFormData((prev) => ({
      ...prev,
      lignes: prev.lignes.map((l) =>
        l.id === id ? { ...l, [field]: value } : l,
      ),
    }));
  }

  function addLigne() {
    setFormData((prev) => ({
      ...prev,
      lignes: [...prev.lignes, emptyLigne(nextLineId.current++)],
    }));
  }

  function removeLigne(id) {
    setFormData((prev) => ({
      ...prev,
      lignes: prev.lignes.filter((l) => l.id !== id),
    }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    const payload = {
      client_id: parseInt(formData.client_id, 10),
      service: formData.lignes[0]?.description || "Divers",
      statut:
        formData.client_id &&
        formData.lignes.some(
          (l) => l.description.trim() !== "" && l.prix_unitaire > 0,
        )
          ? "en_attente"
          : "brouillon",
      date_creation:
        formData.date_creation || new Date().toISOString().slice(0, 10),
      tva: formData.tva,
      montant_ht: sousTotal,
      montant_tva: tvaAmount,
      montant_ttc: totalTTC,
      notes: formData.notes,
      lignes: formData.lignes.map(
        ({ description, quantite, prix_unitaire }) => ({
          description,
          quantite,
          prix_unitaire,
        }),
      ),
    };
    try {
      await createDevis(payload);
      const updated = await getDevis();
      setDevisList(updated);
    } catch {
      alert("Une erreur est survenue, veuillez réessayer.");
      return;
    }
    closeModal();
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const currentStatut = modal.devis?.statut ?? "brouillon";
    const autoStatut =
      formData.client_id &&
      formData.lignes.some(
        (l) => l.description.trim() !== "" && l.prix_unitaire > 0,
      )
        ? "en_attente"
        : "brouillon";
    const newStatut = ["brouillon", "en_attente"].includes(currentStatut)
      ? autoStatut
      : currentStatut;
    const payload = {
      client_id: parseInt(formData.client_id, 10),
      service: formData.lignes[0]?.description || modal.devis.service,
      statut: newStatut,
      tva: formData.tva,
      montant_ht: sousTotal,
      montant_tva: tvaAmount,
      montant_ttc: totalTTC,
      notes: formData.notes,
      lignes: formData.lignes.map(
        ({ description, quantite, prix_unitaire }) => ({
          description,
          quantite,
          prix_unitaire,
        }),
      ),
    };
    try {
      await updateDevis(modal.devis.id, payload);
    } catch {
      alert("Une erreur est survenue, veuillez réessayer.");
      return;
    }
    setDevisList((prev) =>
      prev.map((d) => (d.id === modal.devis.id ? { ...d, ...payload } : d)),
    );
    closeModal();
  }

  async function handleDelete(id) {
    try {
      await deleteDevis(id);
    } catch {
      alert("Une erreur est survenue, veuillez réessayer.");
      return;
    }
    setDevisList((prev) => prev.filter((d) => d.id !== id));
    setOpenMenu(null);
  }

  async function handleGeneratePDF(devis) {
    setOpenMenu(null);

    // Fetch full devis with lignes (list view doesn't include them)
    let full = devis;
    try {
      full = await getDevisById(devis.id);
    } catch {
      // fall back to list-view data if fetch fails
    }

    const doc       = new jsPDF();
    const pw        = doc.internal.pageSize.getWidth();
    const ph        = doc.internal.pageSize.getHeight();
    const M         = 20;   // margin
    const cw        = pw - M * 2; // content width
    const PRIMARY   = [85, 1, 1];
    const BLACK     = [26, 26, 26];
    const GRAY      = [120, 120, 120];

    let y = 22;

    // ── Header ──────────────────────────────────────────
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PRIMARY);
    doc.text("DEVIS", M, y);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text("ADL Toiture", M, y + 8);

    // Date — top right
    const rawDate = full.date_creation ?? devis.date_creation;
    const dateStr = rawDate
      ? new Date(rawDate.replace(" ", "T")).toLocaleDateString("fr-BE", {
          day: "2-digit", month: "2-digit", year: "numeric",
        })
      : "—";
    doc.setFontSize(10);
    doc.setTextColor(...GRAY);
    doc.text(`Date : ${dateStr}`, pw - M, y, { align: "right" });

    // Separator
    y += 14;
    doc.setDrawColor(...PRIMARY);
    doc.setLineWidth(0.5);
    doc.line(M, y, pw - M, y);
    y += 9;

    // Client / Service
    doc.setFontSize(10);
    doc.setTextColor(...BLACK);
    doc.setFont("helvetica", "bold");
    doc.text("Client :", M, y);
    doc.setFont("helvetica", "normal");
    doc.text(full.client_nom || "—", M + 22, y);

    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Service :", M, y);
    doc.setFont("helvetica", "normal");
    doc.text(full.service || "—", M + 22, y);

    y += 12;

    // ── Lines table ─────────────────────────────────────
    const lignes = full.lignes;
    if (lignes && lignes.length > 0) {
      const COL = [
        { label: "Description",    x: M,       w: 85 },
        { label: "Quantité",       x: M + 85,  w: 25 },
        { label: "Prix unit. HT",  x: M + 110, w: 35 },
        { label: "Total HT",       x: M + 145, w: 25 },
      ];

      // Header row
      doc.setFillColor(...PRIMARY);
      doc.rect(M, y - 5, cw, 8, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      COL.forEach((c) => doc.text(c.label, c.x + 2, y));
      y += 6;

      // Data rows
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...BLACK);
      lignes.forEach((l, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(250, 246, 246);
          doc.rect(M, y - 4, cw, 7, "F");
        }
        const total = (parseFloat(l.quantite ?? 1) * parseFloat(l.prix_unitaire ?? 0)).toFixed(2);
        doc.text(String(l.description || ""), COL[0].x + 2, y);
        doc.text(String(l.quantite ?? 1),    COL[1].x + 2, y);
        doc.text(`${parseFloat(l.prix_unitaire ?? 0).toFixed(2)} €`, COL[2].x + 2, y);
        doc.text(`${total} €`, COL[3].x + 2, y);
        y += 7;
      });

      y += 5;
    }

    // ── Totals (right-aligned) ───────────────────────────
    const TX = pw - M - 65; // totals label x
    doc.setFontSize(10);
    doc.setTextColor(...BLACK);

    doc.setFont("helvetica", "normal");
    doc.text("Montant HT :", TX, y);
    doc.text(`${parseFloat(full.montant_ht ?? 0).toFixed(2)} €`, pw - M, y, { align: "right" });

    y += 7;
    doc.text(`TVA (${full.tva ?? 0} %) :`, TX, y);
    doc.text(`${parseFloat(full.montant_tva ?? 0).toFixed(2)} €`, pw - M, y, { align: "right" });

    y += 3;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(TX, y, pw - M, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...PRIMARY);
    doc.text("Total TTC :", TX, y);
    doc.text(`${parseFloat(full.montant_ttc ?? 0).toFixed(2)} €`, pw - M, y, { align: "right" });

    // ── Footer ──────────────────────────────────────────
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(
      "ADL Toiture — Brabant wallon — admin@adltoiture.be",
      pw / 2,
      ph - 10,
      { align: "center" }
    );

    // ── Save ────────────────────────────────────────────
    const slug = (full.client_nom || "client").replace(/\s+/g, "-");
    doc.save(`devis-${full.id}-${slug}.pdf`);
  }

  async function handleStatusChange(devis, statut) {
    try {
      await updateDevis(devis.id, { ...devis, statut });
    } catch {
      /* API indisponible */
    }
    setDevisList((prev) =>
      prev.map((d) => (d.id === devis.id ? { ...d, statut } : d)),
    );
    setOpenMenu(null);
  }

  /* ── Rendu ── */
  if (loading) {
    return (
      <div className="dv-page">
        <p style={{ color: "rgba(0,0,0,0.4)", fontSize: "0.875rem" }}>
          Chargement…
        </p>
      </div>
    );
  }

  return (
    <div className="dv-page">
      {/* ── En-tête de page ── */}
      <div className="dv-page__header">
        <h1 className="dv-page__title">Devis</h1>

        <div className="dv-page__actions">
          <button className="dv-page__new-btn" onClick={openCreateModal}>
            <i className="fas fa-plus"></i> Nouveau Devis
          </button>
        </div>
      </div>

      {/* ── Barre d'outils : recherche + onglets ── */}
      <div className="dv-toolbar">
        <div className="dv-search-wrap">
          <input
            type="search"
            className="dv-search"
            placeholder="Rechercher un client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher un devis"
          />
        </div>

        <div className="dv-tabs" role="tablist" aria-label="Filtrer par statut">
          {TABS.map(({ label, filter }) => (
            <button
              key={label}
              role="tab"
              aria-selected={activeTab === filter}
              className={
                "dv-tab" + (activeTab === filter ? " dv-tab--active" : "")
              }
              onClick={() => setActiveTab(filter)}
            >
              {label}
              <span className="dv-tab__count">{countFor(filter)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tableau des devis ── */}
      <div className="dv-table-card">
        <div className="dv-table-wrap">
          <table className="dv-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Date</th>
                <th>Service</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="dv-table__empty">
                    Aucun devis trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((devis) => (
                  <tr key={devis.id}>
                    <td>
                      <div className="table-client">
                        <span className="table-avatar" aria-hidden="true">
                          {getInitials(devis.client_nom)}
                        </span>
                        <span className="table-client__name">
                          {devis.client_nom}
                        </span>
                      </div>
                    </td>

                    <td>{formatDate(devis.date_creation)}</td>

                    <td>{devis.service}</td>

                    <td>
                      <span className="dv-montant">
                        {formatEUR(devis.montant_ttc)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${statusClass(devis.statut ?? "brouillon")}`}
                      >
                        {STATUS_LABEL[devis.statut ?? "brouillon"] ??
                          "Brouillon"}
                      </span>
                    </td>

                    <td>
                      <DevisActionMenu
                        devis={devis}
                        openMenu={openMenu}
                        setOpenMenu={setOpenMenu}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                        onGeneratePDF={handleGeneratePDF}
                        onStatusChange={handleStatusChange}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Cards mobiles devis ── */}
        <div className="dv-mobile-cards">
          {filtered.length === 0 ? (
            <p className="dv-mobile-empty">Aucun devis trouvé.</p>
          ) : (
            filtered.map((devis) => (
              <div key={devis.id} className="dv-mobile-card">
                <div className="dv-mobile-card__left">
                  <div className="dv-mobile-card__header">
                    <span className="table-avatar" aria-hidden="true">
                      {getInitials(devis.client_nom)}
                    </span>
                    <div className="dv-mobile-card__info">
                      <span className="dv-mobile-card__name">
                        {devis.client_nom}
                      </span>
                      <span className="dv-mobile-card__service">
                        {devis.service}
                      </span>
                    </div>
                  </div>
                  <div className="dv-mobile-card__date">
                    <i className="fas fa-calendar-alt" aria-hidden="true"></i>
                    {formatDate(devis.date_creation)}
                  </div>
                </div>
                <div className="dv-mobile-card__right">
                  <span
                    className={`status-badge ${statusClass(devis.statut ?? "brouillon")}`}
                  >
                    {STATUS_LABEL[devis.statut ?? "brouillon"] ?? "Brouillon"}
                  </span>
                  <div className="dv-mobile-card__footer">
                    <span className="dv-mobile-card__amount">
                      {formatEUR(devis.montant_ttc)}
                    </span>
                    <DevisActionMenu
                      devis={devis}
                      openMenu={openMenu}
                      setOpenMenu={setOpenMenu}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      onGeneratePDF={handleGeneratePDF}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {openMenu !== null && (
        <div
          className="dv-menu-overlay"
          onClick={() => setOpenMenu(null)}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════
          Modal — Nouveau / Modifier devis
      ══════════════════════════════ */}
      {modal.type !== null && (
        <div
          className="dv-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dv-modal-title"
          onClick={closeModal}
        >
          <div
            className="dv-modal__dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dv-modal__header">
              <h2 className="dv-modal__title" id="dv-modal-title">
                {modal.type === "create"
                  ? "Nouveau devis"
                  : "Modifier le devis"}
              </h2>
              <button
                className="dv-modal__close"
                onClick={closeModal}
                aria-label="Fermer"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form
              className="dv-modal__body"
              onSubmit={modal.type === "create" ? handleCreate : handleUpdate}
            >
              {/* Client ID + Date sur la même ligne */}
              <div className="dv-modal__row">
                <div className="dv-modal__field">
                  <label className="dv-modal__label" htmlFor="dv-client-id">
                    Client
                  </label>
                  <select
                    id="dv-client-id"
                    name="client_id"
                    className="dv-modal__select"
                    value={formData.client_id}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">— Sélectionner un client —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="dv-modal__field">
                  <label className="dv-modal__label" htmlFor="dv-date">
                    Date du devis
                  </label>
                  <input
                    id="dv-date"
                    name="date_creation"
                    type="date"
                    className="dv-modal__input"
                    value={formData.date_creation}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              {/* ── Tableau des lignes de devis ── */}
              <div>
                <p className="dv-modal__section-title">Lignes du devis</p>

                <div className="dv-lines">
                  <div className="dv-lines__wrap">
                    <table className="dv-lines__table">
                      <thead>
                        <tr>
                          <th className="dv-lines__col-desc">
                            Service / Description
                          </th>
                          <th className="dv-lines__col-qty">Qté</th>
                          <th className="dv-lines__col-price">
                            Prix unit. (€)
                          </th>
                          <th className="dv-lines__col-total">Total</th>
                          <th className="dv-lines__col-del" />
                        </tr>
                      </thead>
                      <tbody>
                        {formData.lignes.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              style={{
                                textAlign: "center",
                                padding: "1rem",
                                color: "rgba(0,0,0,0.35)",
                                fontSize: "0.8125rem",
                              }}
                            >
                              Aucune ligne — cliquez sur « + Ajouter une ligne »
                            </td>
                          </tr>
                        ) : (
                          formData.lignes.map((ligne) => (
                            <tr key={ligne.id}>
                              <td className="dv-lines__col-desc">
                                <input
                                  type="text"
                                  className="dv-lines__input"
                                  placeholder="Description…"
                                  value={ligne.description}
                                  onChange={(e) =>
                                    handleLigneChange(
                                      ligne.id,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>

                              <td className="dv-lines__col-qty">
                                <input
                                  type="number"
                                  className="dv-lines__input dv-lines__input--number"
                                  min="0"
                                  step="1"
                                  value={ligne.quantite}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) =>
                                    handleLigneChange(
                                      ligne.id,
                                      "quantite",
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>

                              <td className="dv-lines__col-price">
                                <input
                                  type="number"
                                  className="dv-lines__input dv-lines__input--number"
                                  min="0"
                                  step="0.01"
                                  value={ligne.prix_unitaire}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) =>
                                    handleLigneChange(
                                      ligne.id,
                                      "prix_unitaire",
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>

                              <td className="dv-lines__col-total">
                                <span className="dv-lines__total">
                                  {formatEUR(
                                    ligne.quantite * ligne.prix_unitaire,
                                  )}
                                </span>
                              </td>

                              <td className="dv-lines__col-del">
                                <button
                                  type="button"
                                  className="dv-lines__del-btn"
                                  aria-label="Supprimer cette ligne"
                                  onClick={() => removeLigne(ligne.id)}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    className="dv-lines__add-btn"
                    onClick={addLigne}
                  >
                    <i className="fas fa-plus"></i> Ajouter une ligne
                  </button>
                </div>
              </div>

              {/* ── Notes libres ── */}
              <div className="dv-modal__field">
                <label className="dv-modal__label" htmlFor="dv-notes">
                  Notes
                </label>
                <textarea
                  id="dv-notes"
                  name="notes"
                  className="dv-modal__textarea"
                  placeholder="Informations complémentaires…"
                  value={formData.notes}
                  onChange={handleFormChange}
                />
              </div>

              {/* ── Récapitulatif financier ── */}
              <div className="dv-summary">
                <div className="dv-summary__row">
                  <span className="dv-summary__label">Sous-total HT</span>
                  <span className="dv-summary__value">
                    {formatEUR(sousTotal)}
                  </span>
                </div>

                <div className="dv-summary__tva-row">
                  <span className="dv-summary__tva-label">
                    TVA
                    <div
                      className="dv-tva-toggle"
                      role="group"
                      aria-label="Taux de TVA"
                    >
                      <button
                        type="button"
                        className={
                          "dv-tva-btn" +
                          (formData.tva === 6 ? " dv-tva-btn--active" : "")
                        }
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, tva: 6 }))
                        }
                      >
                        6%
                      </button>
                      <button
                        type="button"
                        className={
                          "dv-tva-btn" +
                          (formData.tva === 21 ? " dv-tva-btn--active" : "")
                        }
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, tva: 21 }))
                        }
                      >
                        21%
                      </button>
                    </div>
                  </span>
                  <span className="dv-summary__value">
                    {formatEUR(tvaAmount)}
                  </span>
                </div>

                <hr className="dv-summary__divider" />

                <div className="dv-summary__total-row">
                  <span className="dv-summary__total-label">Total TTC</span>
                  <span className="dv-summary__total-value">
                    {formatEUR(totalTTC)}
                  </span>
                </div>
              </div>

              <div className="dv-modal__footer">
                <button
                  type="button"
                  className="dv-modal__cancel"
                  onClick={closeModal}
                >
                  Annuler
                </button>
                <button type="submit" className="dv-modal__submit">
                  {modal.type === "create"
                    ? "Créer le devis"
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
