<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

/**
 * CRUD for the clients table.
 * All endpoints require admin authentication.
 */
class ClientsController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /** GET /clients — list all clients, newest first. */
    public function getAll(): void
    {
        checkAuth();

        $stmt = $this->db->query('SELECT * FROM clients ORDER BY date_creation DESC');
        echo json_encode($stmt->fetchAll());
    }

    /** GET /clients/{id} — fetch a single client. */
    public function getById(int $id): void
    {
        checkAuth();

        $stmt = $this->db->prepare('SELECT * FROM clients WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Client not found']);
            return;
        }

        echo json_encode($row);
    }

    /**
     * POST /clients  { nom, telephone, ville, email?, adresse?, statut? }
     * Required: nom, telephone, ville.
     */
    public function create(array $data): void
    {
        checkAuth();

        foreach (['nom', 'telephone', 'ville'] as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '{$field}' is required"]);
                return;
            }
        }

        $stmt = $this->db->prepare(
            'INSERT INTO clients (nom, telephone, email, adresse, ville, statut)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['nom'],
            $data['telephone'],
            $data['email']   ?? null,
            $data['adresse'] ?? null,
            $data['ville'],
            $data['statut']  ?? 'nouveau',
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => (int) $this->db->lastInsertId()]);
    }

    /**
     * PUT /clients/{id} — full update of a client record.
     * Note: rowCount() returns 0 when all submitted values are identical to stored ones.
     */
    public function update(int $id, array $data): void
    {
        checkAuth();

        $stmt = $this->db->prepare(
            'UPDATE clients
             SET nom = ?, telephone = ?, email = ?, adresse = ?, ville = ?, statut = ?
             WHERE id = ?'
        );
        $stmt->execute([
            $data['nom']      ?? '',
            $data['telephone'] ?? '',
            $data['email']    ?? null,
            $data['adresse']  ?? null,
            $data['ville']    ?? '',
            $data['statut']   ?? 'nouveau',
            $id,
        ]);

        if ($stmt->rowCount() === 0) {
            // Returns 404 if no row matched; also triggers when no value changed.
            $check = $this->db->prepare('SELECT id FROM clients WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Client not found']);
                return;
            }
        }

        echo json_encode(['success' => true]);
    }

    /** DELETE /clients/{id} — remove a client. */
    public function delete(int $id): void
    {
        checkAuth();

        $stmt = $this->db->prepare('DELETE FROM clients WHERE id = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Client not found']);
            return;
        }

        echo json_encode(['success' => true]);
    }
}
