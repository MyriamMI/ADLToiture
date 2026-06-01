<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

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
     * Returns a signed JWT (HS256) valid for 8 hours.
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

        $secret = $_ENV['JWT_SECRET'] ?? null;
        if (empty($secret)) {
            http_response_code(500);
            echo json_encode(['error' => 'Server misconfiguration']);
            exit;
        }
        $header  = jwt_base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = jwt_base64url_encode(json_encode([
            'admin_id' => $admin['id'],
            'email'    => $admin['email'],
            'exp'      => time() + 8 * 3600,
        ]));
        $signature = jwt_base64url_encode(hash_hmac('sha256', "$header.$payload", $secret, true));

        echo json_encode([
            'success' => true,
            'token'   => "$header.$payload.$signature",
            'email'   => $admin['email'],
        ]);
    }

    /**
     * GET /auth/check
     * Returns {"authenticated": true} if the JWT is valid, 401 otherwise.
     */
    public function check(): void
    {
        checkAuth();
        echo json_encode(['authenticated' => true]);
    }

    /**
     * POST /auth/logout
     * Token-based auth — no server-side state to destroy.
     * The client removes the token from localStorage.
     */
    public function logout(): void
    {
        echo json_encode(['success' => true, 'message' => 'Logged out']);
    }
}
