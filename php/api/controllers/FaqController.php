<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

/**
 * CRUD for the faq table.
 * getAll() is public. create(), update(), delete() require admin auth.
 */
class FaqController
{
    private PDO $db;

    /** Allowed category values (mirrors the ENUM in the schema). */
    private const CATEGORIES = ['Services', 'Devis', 'Zone', 'Urgences', 'Garanties'];

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /** GET /faq — public list of all FAQ entries grouped by category. */
    public function getAll(): void
    {
        $stmt = $this->db->query('SELECT * FROM faq ORDER BY categorie, id');
        echo json_encode($stmt->fetchAll());
    }

    /**
     * POST /faq  { question, reponse, categorie }
     * categorie must be one of: Services, Devis, Zone, Urgences, Garanties.
     */
    public function create(array $data): void
    {
        checkAuth();

        foreach (['question', 'reponse', 'categorie'] as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '{$field}' is required"]);
                return;
            }
        }

        if (!in_array($data['categorie'], self::CATEGORIES, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'categorie must be one of: ' . implode(', ', self::CATEGORIES)]);
            return;
        }

        $stmt = $this->db->prepare(
            'INSERT INTO faq (question, reponse, categorie) VALUES (?, ?, ?)'
        );
        $stmt->execute([$data['question'], $data['reponse'], $data['categorie']]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => (int) $this->db->lastInsertId()]);
    }

    /** PUT /faq/{id}  { question, reponse, categorie } — full update of a FAQ entry. */
    public function update(int $id, array $data): void
    {
        checkAuth();

        if (isset($data['categorie']) && !in_array($data['categorie'], self::CATEGORIES, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'categorie must be one of: ' . implode(', ', self::CATEGORIES)]);
            return;
        }

        $stmt = $this->db->prepare(
            'UPDATE faq SET question = ?, reponse = ?, categorie = ? WHERE id = ?'
        );
        $stmt->execute([
            $data['question']  ?? '',
            $data['reponse']   ?? '',
            $data['categorie'] ?? 'Services',
            $id,
        ]);

        if ($stmt->rowCount() === 0) {
            $check = $this->db->prepare('SELECT id FROM faq WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'FAQ entry not found']);
                return;
            }
        }

        echo json_encode(['success' => true]);
    }

    /** DELETE /faq/{id} — remove a FAQ entry. */
    public function delete(int $id): void
    {
        checkAuth();

        $stmt = $this->db->prepare('DELETE FROM faq WHERE id = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'FAQ entry not found']);
            return;
        }

        echo json_encode(['success' => true]);
    }
}
