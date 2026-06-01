<?php

/**
 * JWT authentication middleware.
 * - checkAuth() : strict — exits with 401 if token is missing or invalid.
 * - tryAuth()   : lenient — returns payload array or null, never exits.
 */

function jwt_base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function jwt_base64url_decode(string $data): string
{
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Tries to validate the JWT from Authorization: Bearer header.
 * Returns the payload array on success, null on any failure (no side effects).
 */
function tryAuth(): ?array
{
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (!str_starts_with($authHeader, 'Bearer ')) {
        return null;
    }

    $token = substr($authHeader, 7);
    $parts = explode('.', $token);

    if (count($parts) !== 3) {
        return null;
    }

    [$header, $payload, $signature] = $parts;

    $secret = $_ENV['JWT_SECRET'] ?? null;
    if (empty($secret)) {
        http_response_code(500);
        echo json_encode(['error' => 'Server misconfiguration']);
        exit;
    }
    $expected = jwt_base64url_encode(hash_hmac('sha256', "$header.$payload", $secret, true));

    if (!hash_equals($expected, $signature)) {
        return null;
    }

    $data = json_decode(jwt_base64url_decode($payload), true);

    if (!is_array($data)) {
        return null;
    }

    if (isset($data['exp']) && $data['exp'] < time()) {
        return null;
    }

    return $data;
}

/**
 * Validates the JWT from Authorization: Bearer header.
 * Returns the payload array on success.
 * Sends HTTP 401 JSON and exits on any failure.
 */
function checkAuth(): array
{
    $payload = tryAuth();

    if ($payload === null) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized — missing or invalid token']);
        exit;
    }

    return $payload;
}
