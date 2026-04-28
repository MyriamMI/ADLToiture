/**
 * api.js — Couche de service centralisée pour les appels à l'API PHP.
 *
 * Toutes les requêtes vers le back-end passent par ce fichier.
 * Cela permet de changer l'URL de base en un seul endroit, de gérer
 * les en-têtes communs (authentification, Content-Type) de façon
 * uniforme, et d'isoler la logique réseau du reste des composants React.
 *
 * Utilisation dans un composant :
 *   import { getClients } from '../services/api'
 *   const clients = await getClients()
 */

/* ── URL de base de l'API PHP ── */
export const API_BASE_URL = '/api'

/* ── En-têtes communs à toutes les requêtes ── */
const defaultHeaders = {
  'Content-Type': 'application/json',
}

/* ══════════════════════════════
   Clients
══════════════════════════════ */

/**
 * Récupère la liste complète des clients.
 * @returns {Promise<Array>}
 */
export async function getClients() {
  // const res = await fetch(`${API_BASE_URL}/clients.php`, { headers: defaultHeaders })
  // if (!res.ok) throw new Error('Erreur lors du chargement des clients')
  // return res.json()
}

/**
 * Crée un nouveau client.
 * @param {Object} data — Données du formulaire client
 * @returns {Promise<Object>}
 */
export async function createClient(data) {
  // const res = await fetch(`${API_BASE_URL}/clients.php`, {
  //   method: 'POST',
  //   headers: defaultHeaders,
  //   body: JSON.stringify(data),
  // })
  // if (!res.ok) throw new Error('Erreur lors de la création du client')
  // return res.json()
}

/**
 * Met à jour un client existant.
 * @param {number|string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateClient(id, data) {
  // const res = await fetch(`${API_BASE_URL}/clients.php?id=${id}`, {
  //   method: 'PUT',
  //   headers: defaultHeaders,
  //   body: JSON.stringify(data),
  // })
  // if (!res.ok) throw new Error('Erreur lors de la mise à jour du client')
  // return res.json()
}

/**
 * Supprime un client.
 * @param {number|string} id
 * @returns {Promise<void>}
 */
export async function deleteClient(id) {
  // const res = await fetch(`${API_BASE_URL}/clients.php?id=${id}`, {
  //   method: 'DELETE',
  //   headers: defaultHeaders,
  // })
  // if (!res.ok) throw new Error('Erreur lors de la suppression du client')
}

/* ══════════════════════════════
   Rendez-vous
══════════════════════════════ */

/**
 * Récupère la liste complète des rendez-vous.
 * @returns {Promise<Array>}
 */
export async function getRendezVous() {
  // const res = await fetch(`${API_BASE_URL}/rdv.php`, { headers: defaultHeaders })
  // if (!res.ok) throw new Error('Erreur lors du chargement des rendez-vous')
  // return res.json()
}

/**
 * Crée un nouveau rendez-vous.
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createRendezVous(data) {
  // const res = await fetch(`${API_BASE_URL}/rdv.php`, {
  //   method: 'POST',
  //   headers: defaultHeaders,
  //   body: JSON.stringify(data),
  // })
  // if (!res.ok) throw new Error('Erreur lors de la création du rendez-vous')
  // return res.json()
}

/**
 * Met à jour un rendez-vous existant.
 * @param {number|string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateRendezVous(id, data) {
  // const res = await fetch(`${API_BASE_URL}/rdv.php?id=${id}`, {
  //   method: 'PUT',
  //   headers: defaultHeaders,
  //   body: JSON.stringify(data),
  // })
  // if (!res.ok) throw new Error('Erreur lors de la mise à jour du rendez-vous')
  // return res.json()
}

/**
 * Supprime un rendez-vous.
 * @param {number|string} id
 * @returns {Promise<void>}
 */
export async function deleteRendezVous(id) {
  // const res = await fetch(`${API_BASE_URL}/rdv.php?id=${id}`, {
  //   method: 'DELETE',
  //   headers: defaultHeaders,
  // })
  // if (!res.ok) throw new Error('Erreur lors de la suppression du rendez-vous')
}

/* ══════════════════════════════
   Devis
══════════════════════════════ */

/**
 * Récupère la liste complète des devis.
 * @returns {Promise<Array>}
 */
export async function getDevis() {
  // const res = await fetch(`${API_BASE_URL}/devis.php`, { headers: defaultHeaders })
  // if (!res.ok) throw new Error('Erreur lors du chargement des devis')
  // return res.json()
}

/**
 * Crée un nouveau devis.
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createDevis(data) {
  // const res = await fetch(`${API_BASE_URL}/devis.php`, {
  //   method: 'POST',
  //   headers: defaultHeaders,
  //   body: JSON.stringify(data),
  // })
  // if (!res.ok) throw new Error('Erreur lors de la création du devis')
  // return res.json()
}

/**
 * Met à jour un devis existant.
 * @param {number|string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateDevis(id, data) {
  // const res = await fetch(`${API_BASE_URL}/devis.php?id=${id}`, {
  //   method: 'PUT',
  //   headers: defaultHeaders,
  //   body: JSON.stringify(data),
  // })
  // if (!res.ok) throw new Error('Erreur lors de la mise à jour du devis')
  // return res.json()
}

/**
 * Supprime un devis.
 * @param {number|string} id
 * @returns {Promise<void>}
 */
export async function deleteDevis(id) {
  // const res = await fetch(`${API_BASE_URL}/devis.php?id=${id}`, {
  //   method: 'DELETE',
  //   headers: defaultHeaders,
  // })
  // if (!res.ok) throw new Error('Erreur lors de la suppression du devis')
}
