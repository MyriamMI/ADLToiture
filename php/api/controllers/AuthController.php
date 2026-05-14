<?php

require_once __DIR__ . '/../config/database.php';

/**
 * Handles admin authentication (login / logout).
 * Passwords are stored as bcrypt hashes — use password_hash() to create them.
 */
class AuthController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * POST /auth/login  { email, password }
     * Sets $_SESSION['admin_id'] on success.
     */
    public function login(array $data): void
    {
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }

        $stmt = $this->db->prepare('SELECT id, email, password_hash FROM admin WHERE email = ? LIMIT 1');
        $stmt->execute([$data['email']]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($data['password'], $admin['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        session_regenerate_id(true); // prevent session fixation
        $_SESSION['admin_id']    = $admin['id'];
        $_SESSION['admin_email'] = $admin['email'];

        echo json_encode(['success' => true, 'email' => $admin['email']]);
    }

    /**
     * GET /auth/hash — DEBUG ONLY, remove before production.
     * Returns the bcrypt hash for "admin123" to seed the admin table.
     */
    public function generateHash(): void
    {
        echo json_encode(['hash' => password_hash('admin123', PASSWORD_DEFAULT)]);
    }

    /**
     * GET /auth/check
     * Returns {"authenticated": true} if a session is active, 401 otherwise.
     */
    public function check(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!empty($_SESSION['admin_id'])) {
            echo json_encode(['authenticated' => true]);
        } else {
            http_response_code(401);
            echo json_encode(['authenticated' => false]);
        }
    }

    /**
     * POST /auth/logout
     * Destroys the current session.
     */
    public function logout(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $_SESSION = [];
        session_destroy();

        echo json_encode(['success' => true, 'message' => 'Logged out']);
    }
}
