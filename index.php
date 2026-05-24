<?php

/**
 * API entry point — handles CORS, parses the URL, and dispatches to controllers.
 * All responses are JSON except GET /rdv/{id}/ical which returns text/calendar.
 *
 * Route map:
 *   POST   /auth/login
 *   POST   /auth/logout
 *   GET    /auth/check
 *   GET    /demandes
 *   GET    /demandes/{id}
 *   POST   /demandes
 *   PATCH  /demandes/{id}/statut
 *   GET    /clients
 *   GET    /clients/{id}
 *   POST   /clients
 *   PUT    /clients/{id}
 *   DELETE /clients/{id}
 *   GET    /rdv
 *   GET    /rdv/{id}
 *   GET    /rdv/{id}/ical
 *   POST   /rdv
 *   PUT    /rdv/{id}
 *   DELETE /rdv/{id}
 *   GET    /devis
 *   GET    /devis/{id}
 *   POST   /devis
 *   PUT    /devis/{id}
 *   DELETE /devis/{id}
 *   GET    /avis
 *   POST   /avis
 *   PATCH  /avis/{id}/statut
 *   DELETE /avis/{id}
 *   GET    /faq
 *   POST   /faq
 *   PUT    /faq/{id}
 *   DELETE /faq/{id}
 */

// ── CORS ──────────────────────────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (str_contains($origin, 'localhost')) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Respond to CORS preflight immediately.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Session ───────────────────────────────────────────────────────────────────
// Cookie sécurisé en HTTPS
ini_set('session.cookie_secure', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'None');
session_start();

// ── URL parsing ───────────────────────────────────────────────────────────────
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$base       = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
$path       = ltrim(substr($requestUri, strlen($base)), '/');
$segments   = explode('/', $path);

$resource = $segments[0] ?? '';               // e.g. "demandes"
$id       = isset($segments[1]) && ctype_digit($segments[1])
            ? (int) $segments[1]
            : null;                           // numeric ID or null
$action   = $segments[2] ?? '';               // e.g. "statut" or "ical"

$method = $_SERVER['REQUEST_METHOD'];

// ── Request body (JSON) ───────────────────────────────────────────────────────
$body = [];
if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true) ?? [];
}

// ── DEBUG temporaire ──────────────────────────────────────────────────────────
error_log("[ROUTER] uri=$requestUri base=$base path=$path segments=" . implode('|', $segments));
error_log("[ROUTER] method=$method resource=$resource id=" . var_export($id, true) . " action=$action body=" . json_encode($body));

// ── Controller map ────────────────────────────────────────────────────────────
$controllerMap = [
    'auth'     => 'AuthController',
    'kpi'      => 'KpiController',
    'demandes' => 'DemandesController',
    'clients'  => 'ClientsController',
    'rdv'      => 'RdvController',
    'devis'    => 'DevisController',
    'avis'     => 'AvisController',
    'faq'      => 'FaqController',
];

if (!array_key_exists($resource, $controllerMap)) {
    http_response_code(404);
    echo json_encode(['error' => "Resource '{$resource}' not found"]);
    exit;
}

require_once __DIR__ . '/controllers/' . $controllerMap[$resource] . '.php';

// ── Dispatch ──────────────────────────────────────────────────────────────────
try {
    $ctrl = new $controllerMap[$resource]();

    switch ($resource) {

        // --- KPI ------------------------------------------------------------
        case 'kpi':
            if ($method === 'GET') {
                $ctrl->get();
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
            }
            break;

        // --- Auth -----------------------------------------------------------
        // /auth/login and /auth/logout → $segments[1] holds the sub-action,
        // not $action ($segments[2]) which would be empty for these two-segment URLs.
        case 'auth':
            $authAction = $segments[1] ?? '';
            if ($method === 'POST' && $authAction === 'login') {
                $ctrl->login($body);
            } elseif ($method === 'POST' && $authAction === 'logout') {
                $ctrl->logout();
            } elseif ($method === 'GET' && $authAction === 'check') {
                $ctrl->check();
            } elseif ($method === 'GET' && $authAction === 'hash') {
                $ctrl->generateHash(); // DEBUG — remove before production
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Method or route not allowed']);
            }
            break;

        // --- Demandes -------------------------------------------------------
        case 'demandes':
            if ($method === 'GET' && $id === null) {
                $ctrl->getAll();
            } elseif ($method === 'GET' && $id !== null) {
                $ctrl->getById($id);
            } elseif ($method === 'POST' && $id === null) {
                $ctrl->create($body);
            } elseif (in_array($method, ['PUT', 'PATCH'], true) && $id !== null && $action === 'statut') {
                $ctrl->updateStatut($id, $body);
            } elseif ($method === 'DELETE' && $id !== null) {
                $ctrl->delete($id);
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Method or route not allowed']);
            }
            break;

        // --- Clients / Devis (standard CRUD) --------------------------------
        case 'clients':
        case 'devis':
            if ($method === 'GET' && $id === null) {
                $ctrl->getAll();
            } elseif ($method === 'GET' && $id !== null) {
                $ctrl->getById($id);
            } elseif ($method === 'POST' && $id === null) {
                $ctrl->create($body);
            } elseif (in_array($method, ['PUT', 'PATCH'], true) && $id !== null) {
                $ctrl->update($id, $body);
            } elseif ($method === 'DELETE' && $id !== null) {
                $ctrl->delete($id);
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Method or route not allowed']);
            }
            break;

        // --- RDV (CRUD + iCal export) ----------------------------------------
        case 'rdv':
            if ($method === 'GET' && $id === null) {
                $ctrl->getAll();
            } elseif ($method === 'GET' && $id !== null && $action === 'ical') {
                $ctrl->exportIcal($id);
            } elseif ($method === 'GET' && $id !== null) {
                $ctrl->getById($id);
            } elseif ($method === 'POST' && $id === null) {
                $ctrl->create($body);
            } elseif (in_array($method, ['PUT', 'PATCH'], true) && $id !== null) {
                $ctrl->update($id, $body);
            } elseif ($method === 'DELETE' && $id !== null) {
                $ctrl->delete($id);
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Method or route not allowed']);
            }
            break;

        // --- Avis -----------------------------------------------------------
        case 'avis':
            if ($method === 'GET') {
                $ctrl->getAll();
            } elseif ($method === 'POST' && $id === null) {
                $ctrl->create($body);
            } elseif (in_array($method, ['PUT', 'PATCH'], true) && $id !== null && $action === 'statut') {
                $ctrl->updateStatut($id, $body);
            } elseif ($method === 'DELETE' && $id !== null) {
                $ctrl->delete($id);
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Method or route not allowed']);
            }
            break;

        // --- FAQ ------------------------------------------------------------
        case 'faq':
            if ($method === 'GET') {
                $ctrl->getAll();
            } elseif ($method === 'POST' && $id === null) {
                $ctrl->create($body);
            } elseif (in_array($method, ['PUT', 'PATCH'], true) && $id !== null) {
                $ctrl->update($id, $body);
            } elseif ($method === 'DELETE' && $id !== null) {
                $ctrl->delete($id);
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Method or route not allowed']);
            }
            break;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'detail' => $e->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'detail' => $e->getMessage()]);
}
