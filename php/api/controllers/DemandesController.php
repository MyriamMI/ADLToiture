<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

/**
 * Manages contact-form submissions (demandes).
 * create() is public — all other methods require admin auth.
 */
class DemandesController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /** GET /demandes — list all submissions, newest first. */
    public function getAll(): void
    {
        checkAuth();

        $stmt = $this->db->query('SELECT * FROM demandes ORDER BY date_envoi DESC');
        echo json_encode($stmt->fetchAll());
    }

    /** GET /demandes/{id} — fetch a single submission. */
    public function getById(int $id): void
    {
        checkAuth();

        $stmt = $this->db->prepare('SELECT * FROM demandes WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Demande not found']);
            return;
        }

        echo json_encode($row);
    }

    /**
     * POST /demandes — public endpoint, called by the contact form.
     * Required fields: nom, ville, and telephone OR email.
     */
    public function create(array $data): void
    {
        foreach (['nom', 'ville'] as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '{$field}' is required"]);
                return;
            }
        }

        if (empty($data['telephone']) && empty($data['email'])) {
            http_response_code(400);
            echo json_encode(['error' => "Field 'telephone' or 'email' is required"]);
            return;
        }

        $stmt = $this->db->prepare(
            'INSERT INTO demandes (nom, telephone, email, ville, service, surface, message)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['nom'],
            $data['telephone'],
            $data['email']   ?? null,
            $data['ville'],
            $data['service'] ?? null,
            isset($data['surface']) ? (float) $data['surface'] : null,
            $data['message'] ?? null,
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => (int) $this->db->lastInsertId()]);
    }

    /**
     * PATCH /demandes/{id}/statut  { statut: "nouvelle"|"traitee"|"refusee" }
     * Updates the processing status of a submission.
     */
    public function updateStatut(int $id, array $data): void
    {
        checkAuth();

        $allowed = ['nouvelle', 'traitee', 'refusee', 'reportee', 'reorientee'];
        if (empty($data['statut']) || !in_array($data['statut'], $allowed, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'invalid status']);
            return;
        }

        if ($data['statut'] === 'traitee') {
            $check = $this->db->prepare("SELECT statut FROM demandes WHERE id = ?");
            $check->execute([$id]);
            $row = $check->fetch();
            if (!$row) {
                http_response_code(404);
                echo json_encode(['error' => 'Demande not found']);
                return;
            }
            if ($row['statut'] === 'traitee') {
                http_response_code(409);
                echo json_encode(['error' => 'This request has already been processed.']);
                return;
            }
        }

        $clientId = isset($data['client_id']) ? (int) $data['client_id'] : null;

        $stmt = $this->db->prepare(
            'UPDATE demandes SET statut = ?, client_id = ? WHERE id = ?'
        );
        $stmt->execute([$data['statut'], $clientId, $id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Demande not found']);
            return;
        }

        echo json_encode(['success' => true]);
    }

    /** DELETE /demandes/{id} — remove a submission. */
    public function delete(int $id): void
    {
        checkAuth();

        $stmt = $this->db->prepare('DELETE FROM demandes WHERE id = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Demande not found']);
            return;
        }

        echo json_encode(['success' => true]);
    }
}
