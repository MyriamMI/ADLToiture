<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

/**
 * CRUD for the devis table.
 * getById() also returns the associated devis_lignes rows.
 * create() and update() accept an optional 'lignes' array to manage line items.
 * All endpoints require admin authentication.
 */
class DevisController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /** GET /devis — list all quotes with client name, newest first. */
    public function getAll(): void
    {
        checkAuth();

        $stmt = $this->db->query(
            'SELECT d.*, c.nom AS client_nom
             FROM devis d
             JOIN clients c ON c.id = d.client_id
             ORDER BY d.date_creation DESC'
        );
        echo json_encode($stmt->fetchAll());
    }

    /** GET /devis/{id} — fetch a quote with its line items. */
    public function getById(int $id): void
    {
        checkAuth();

        $stmt = $this->db->prepare(
            'SELECT d.*, c.nom AS client_nom
             FROM devis d
             JOIN clients c ON c.id = d.client_id
             WHERE d.id = ?'
        );
        $stmt->execute([$id]);
        $devis = $stmt->fetch();

        if (!$devis) {
            http_response_code(404);
            echo json_encode(['error' => 'Devis not found']);
            return;
        }

        $stmtLines = $this->db->prepare('SELECT * FROM devis_lignes WHERE devis_id = ? ORDER BY id');
        $stmtLines->execute([$id]);
        $devis['lignes'] = $stmtLines->fetchAll();

        echo json_encode($devis);
    }

    /**
     * POST /devis  { client_id, service, statut?, tva?, montant_ht?, montant_tva?, montant_ttc?, notes?, lignes? }
     * lignes: [{ description, quantite?, unite?, prix_unitaire?, total? }]
     */
    public function create(array $data): void
    {
        checkAuth();

        if (empty($data['client_id']) || empty($data['service'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Fields client_id and service are required']);
            return;
        }

        $stmt = $this->db->prepare(
            'INSERT INTO devis (client_id, service, statut, tva, montant_ht, montant_tva, montant_ttc, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            (int)    $data['client_id'],
            $data['service'],
            $data['statut']       ?? 'brouillon',
            (int)   ($data['tva']          ?? 6),
            (float) ($data['montant_ht']   ?? 0),
            (float) ($data['montant_tva']  ?? 0),
            (float) ($data['montant_ttc']  ?? 0),
            $data['notes']        ?? null,
        ]);

        $devisId = (int) $this->db->lastInsertId();

        if (!empty($data['lignes']) && is_array($data['lignes'])) {
            $this->insertLignes($devisId, $data['lignes']);
        }

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $devisId]);
    }

    /**
     * PUT /devis/{id} — full update of a quote.
     * When 'lignes' is provided, existing lines are replaced entirely.
     */
    public function update(int $id, array $data): void
    {
        checkAuth();

        if (empty($data['client_id']) || empty($data['service'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Fields client_id and service are required']);
            return;
        }

        $stmt = $this->db->prepare(
            'UPDATE devis
             SET client_id = ?, service = ?, statut = ?, date_envoi = ?, date_reponse = ?,
                 tva = ?, montant_ht = ?, montant_tva = ?, montant_ttc = ?, notes = ?
             WHERE id = ?'
        );
        $stmt->execute([
            (int)    ($data['client_id']     ?? 0),
            $data['service']                 ?? '',
            $data['statut']                  ?? 'brouillon',
            $data['date_envoi']              ?? null,
            $data['date_reponse']            ?? null,
            (int)   ($data['tva']            ?? 6),
            (float) ($data['montant_ht']     ?? 0),
            (float) ($data['montant_tva']    ?? 0),
            (float) ($data['montant_ttc']    ?? 0),
            $data['notes']                   ?? null,
            $id,
        ]);

        if ($stmt->rowCount() === 0) {
            $check = $this->db->prepare('SELECT id FROM devis WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Devis not found']);
                return;
            }
        }

        if (isset($data['lignes']) && is_array($data['lignes'])) {
            $this->db->prepare('DELETE FROM devis_lignes WHERE devis_id = ?')->execute([$id]);
            $this->insertLignes($id, $data['lignes']);
        }

        echo json_encode(['success' => true]);
    }

    /** DELETE /devis/{id} — remove a quote and all its line items. */
    public function delete(int $id): void
    {
        checkAuth();

        // Lines must be deleted first (no ON DELETE CASCADE in the schema).
        $this->db->prepare('DELETE FROM devis_lignes WHERE devis_id = ?')->execute([$id]);

        $stmt = $this->db->prepare('DELETE FROM devis WHERE id = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Devis not found']);
            return;
        }

        echo json_encode(['success' => true]);
    }

    /** Helper — bulk-insert line items for a given devis_id. */
    private function insertLignes(int $devisId, array $lignes): void
    {
        $stmt = $this->db->prepare(
            'INSERT INTO devis_lignes (devis_id, description, quantite, unite, prix_unitaire, total)
             VALUES (?, ?, ?, ?, ?, ?)'
        );

        foreach ($lignes as $ligne) {
            $stmt->execute([
                $devisId,
                $ligne['description']  ?? '',
                (float) ($ligne['quantite']      ?? 1),
                $ligne['unite']        ?? null,
                (float) ($ligne['prix_unitaire'] ?? 0),
                (float) ($ligne['total']         ?? 0),
            ]);
        }
    }
}
