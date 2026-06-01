<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

/**
 * GET /services  — returns all services from the services table.
 * POST /services — creates a new service and returns {id, nom}.
 */
class ServicesController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /** GET /services — list all services in alphabetical order. */
    public function getAll(): void
    {
        checkAuth();
        $stmt = $this->db->query('SELECT id, nom FROM services ORDER BY nom');
        echo json_encode($stmt->fetchAll());
    }

    /** POST /services { nom } — create a new service, returns {id, nom}. */
    public function create(array $data): void
    {
        checkAuth();

        if (empty($data['nom'])) {
            http_response_code(400);
            echo json_encode(['error' => 'nom is required']);
            return;
        }

        $nom  = trim($data['nom']);
        $stmt = $this->db->prepare('INSERT INTO services (nom) VALUES (?)');
        $stmt->execute([$nom]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => (int) $this->db->lastInsertId(), 'nom' => $nom]);
    }
}
