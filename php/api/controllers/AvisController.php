<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

/**
 * Manages customer reviews (avis).
 * - getAll()      public: returns only validated reviews; admin: returns all.
 * - create()      public: inserts a new review in 'en_attente' state.
 * - updateStatut() admin: validates or rejects a review.
 * - delete()      admin: removes a review permanently.
 */
class AvisController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * GET /avis
     * Returns all reviews when admin is authenticated, only 'valide' ones otherwise.
     */
    public function getAll(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!empty($_SESSION['admin_id'])) {
            $stmt = $this->db->query('SELECT * FROM avis ORDER BY date DESC');
        } else {
            $stmt = $this->db->query("SELECT * FROM avis WHERE statut = 'valide' ORDER BY date DESC");
        }

        echo json_encode($stmt->fetchAll());
    }

    /**
     * POST /avis  { nom, note, commentaire, date }
     * Public endpoint — new review is set to 'en_attente' until admin validates it.
     * note must be between 1 and 5.
     */
    public function create(array $data): void
    {
        foreach (['nom', 'note', 'commentaire', 'date'] as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '{$field}' is required"]);
                return;
            }
        }

        $note = (int) $data['note'];
        if ($note < 1 || $note > 5) {
            http_response_code(400);
            echo json_encode(['error' => 'note must be an integer between 1 and 5']);
            return;
        }

        $stmt = $this->db->prepare(
            'INSERT INTO avis (nom, note, commentaire, date) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['nom'],
            $note,
            $data['commentaire'],
            $data['date'],
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => (int) $this->db->lastInsertId()]);
    }

    /**
     * PATCH /avis/{id}/statut  { statut: "en_attente"|"valide" }
     * Validates or rejects a pending review.
     */
    public function updateStatut(int $id, array $data): void
    {
        checkAuth();

        $allowed = ['en_attente', 'valide'];
        if (empty($data['statut']) || !in_array($data['statut'], $allowed, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'statut must be one of: ' . implode(', ', $allowed)]);
            return;
        }

        $stmt = $this->db->prepare('UPDATE avis SET statut = ? WHERE id = ?');
        $stmt->execute([$data['statut'], $id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Avis not found']);
            return;
        }

        echo json_encode(['success' => true]);
    }

    /** DELETE /avis/{id} — permanently remove a review. */
    public function delete(int $id): void
    {
        checkAuth();

        $stmt = $this->db->prepare('DELETE FROM avis WHERE id = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Avis not found']);
            return;
        }

        echo json_encode(['success' => true]);
    }
}
