// src/services/api.js

const BASE_URL = "https://adltoiture.alwaysdata.net/php/api";

// ─── Utilitaire central ───────────────────────────────────────────────────────
// Toutes les fonctions ci-dessous passent par ici.
// credentials: "include" est indispensable pour envoyer le cookie de session PHP.
async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Erreur ${response.status}`);
  }

  return response.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = (email, password) =>
  apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logout = () => apiFetch("/auth/logout", { method: "POST" });

export const checkAuth = () => apiFetch("/auth/check");

// ─── Dashboard KPI ────────────────────────────────────────────────────────────
export const getKpi = () => apiFetch("/kpi");

// ─── Clients ──────────────────────────────────────────────────────────────────
export const getClients = () => apiFetch("/clients");
export const getClientById = (id) => apiFetch(`/clients/${id}`);
export const createClient = (data) =>
  apiFetch("/clients", { method: "POST", body: JSON.stringify(data) });
export const updateClient = (id, data) =>
  apiFetch(`/clients/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteClient = (id) =>
  apiFetch(`/clients/${id}`, { method: "DELETE" });

// ─── Demandes ─────────────────────────────────────────────────────────────────
export const getDemandes = () => apiFetch("/demandes");
export const updateDemandeStatut = (id, statut, client_id = null) =>
  apiFetch(`/demandes/${id}/statut`, {
    method: "PUT",
    body: JSON.stringify({ statut, ...(client_id && { client_id }) }),
  });
export const deleteDemande = (id) =>
  apiFetch(`/demandes/${id}`, { method: "DELETE" });

// ─── Rendez-vous ──────────────────────────────────────────────────────────────
export const getRdv = () => apiFetch("/rdv");
export const createRdv = (data) =>
  apiFetch("/rdv", { method: "POST", body: JSON.stringify(data) });
export const updateRdv = (id, data) =>
  apiFetch(`/rdv/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteRdv = (id) => apiFetch(`/rdv/${id}`, { method: "DELETE" });
export const exportIcal = (id) => `${BASE_URL}/rdv/${id}/ical`;

// ─── Devis ────────────────────────────────────────────────────────────────────
export const getDevis = () => apiFetch("/devis");
export const getDevisById = (id) => apiFetch(`/devis/${id}`);
export const createDevis = (data) =>
  apiFetch("/devis", { method: "POST", body: JSON.stringify(data) });
export const updateDevis = (id, data) =>
  apiFetch(`/devis/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteDevis = (id) =>
  apiFetch(`/devis/${id}`, { method: "DELETE" });

// ─── Avis ─────────────────────────────────────────────────────────────────────
export const getAvis = () => apiFetch("/avis");
export const updateAvisStatut = (id, statut) =>
  apiFetch(`/avis/${id}/statut`, { method: "PUT", body: JSON.stringify({ statut }) });
export const deleteAvis = (id) => apiFetch(`/avis/${id}`, { method: "DELETE" });

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export const getFaq = () => apiFetch("/faq");
export const createFaq = (data) =>
  apiFetch("/faq", { method: "POST", body: JSON.stringify(data) });
export const updateFaq = (id, data) =>
  apiFetch(`/faq/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteFaq = (id) => apiFetch(`/faq/${id}`, { method: "DELETE" });

// ─── Formulaire public (Contact) ──────────────────────────────────────────────
export const sendDemande = (data) =>
  apiFetch("/demandes", { method: "POST", body: JSON.stringify(data) });
