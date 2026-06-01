<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

/**
 * Manages customer reviews (avis).
 * - getAll()       public: returns only validated, non-deleted reviews.
 *                  admin:  returns all non-deleted; ?deleted=1 returns soft-deleted.
 * - create()       public: inserts a new review in 'en_attente' state.
 * - updateStatut() admin: validates or rejects a review.
 * - delete()       admin: soft delete (sets deleted_at = NOW()).
 * - restore()      admin: undoes soft delete (sets deleted_at = NULL).
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
     * ?deleted=1 → admin only, returns soft-deleted reviews.
     * Default    → admin: all non-deleted; public: only 'valide' non-deleted.
     */
    public function getAll(): void
    {
        $deleted = isset($_GET['deleted']) && $_GET['deleted'] === '1';

        if ($deleted) {
            checkAuth();
            $stmt = $this->db->query(
                'SELECT * FROM avis WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
            );
        } elseif (tryAuth() !== null) {
            $stmt = $this->db->query(
                'SELECT * FROM avis WHERE deleted_at IS NULL ORDER BY date DESC'
            );
        } else {
            $stmt = $this->db->query(
                "SELECT * FROM avis WHERE statut = 'valide' AND deleted_at IS NULL ORDER BY date DESC"
            );
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

        $stmt = $this->db->prepare('UPDATE avis SET statut = ? WHERE id = ? AND deleted_at IS NULL');
        $stmt->execute([$data['statut'], $id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Avis not found']);
            return;
        }

        echo json_encode(['success' => true]);
    }

    /** DELETE /avis/{id} — soft delete (sets deleted_at). */
    public function delete(int $id): void
    {
        checkAuth();

        $stmt = $this->db->prepare(
            'UPDATE avis SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL'
        );
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Avis not found']);
            return;
        }

        echo json_encode(['success' => true]);
    }

    /** PUT /avis/{id}/restore — undo soft delete (clears deleted_at). */
    public function restore(int $id): void
    {
        checkAuth();

        $stmt = $this->db->prepare(
            "UPDATE avis SET deleted_at = NULL, statut = 'en_attente' WHERE id = ? AND deleted_at IS NOT NULL"
        );
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Avis not found or not deleted']);
            return;
        }

        echo json_encode(['success' => true]);
    }
}
