<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

/**
 * GET /kpi — dashboard summary: counts per table + recent RDV and clients.
 * Requires admin authentication.
 */
class KpiController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function get(): void
    {
        checkAuth();

        $kpi = [
            'rdvEnAttente'    => (int) $this->db->query("SELECT COUNT(*) FROM rdv WHERE statut = 'en_attente'")->fetchColumn(),
            'rdvConfirmes'    => (int) $this->db->query("SELECT COUNT(*) FROM rdv WHERE statut = 'confirme' AND MONTH(date_rdv) = MONTH(CURRENT_DATE) AND YEAR(date_rdv) = YEAR(CURRENT_DATE)")->fetchColumn(),
            'clientsActifs'   => (int) $this->db->query("SELECT COUNT(*) FROM clients WHERE actif = 1")->fetchColumn(),
            'travauxTermines' => (int) $this->db->query("SELECT COUNT(*) FROM rdv WHERE statut = 'termine'")->fetchColumn(),
            'devisTotal'      => (int) $this->db->query("SELECT COUNT(*) FROM devis")->fetchColumn(),
            'demandesNouv'    => (int) $this->db->query("SELECT COUNT(*) FROM demandes WHERE statut = 'nouvelle'")->fetchColumn(),
        ];

        $stmtRdv = $this->db->query(
            'SELECT r.id, r.date_rdv, r.heure_debut, s.nom AS service, r.statut, c.nom AS client_nom
             FROM rdv r
             JOIN clients c ON c.id = r.client_id
             JOIN services s ON s.id = r.service_id
             ORDER BY r.date_rdv DESC, r.id DESC
             LIMIT 5'
        );

        $stmtClients = $this->db->query(
            'SELECT id, nom, telephone, email, ville, statut, date_creation
             FROM clients
             WHERE actif = 1
             ORDER BY date_creation DESC
             LIMIT 4'
        );

        echo json_encode([
            'kpi'            => $kpi,
            'rdvRecents'     => $stmtRdv->fetchAll(),
            'clientsRecents' => $stmtClients->fetchAll(),
        ]);
    }
}
