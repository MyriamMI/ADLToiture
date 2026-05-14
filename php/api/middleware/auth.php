<?php

/**
 * Auth middleware.
 * Call checkAuth() at the top of any admin-only controller method.
 */

/**
 * Verifies that an active admin session exists.
 * Sends HTTP 401 JSON and exits if not authenticated.
 */
function checkAuth(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (empty($_SESSION['admin_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized — please log in']);
        exit;
    }
}
