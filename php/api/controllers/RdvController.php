<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

/**
 * CRUD for the rdv table + iCal export.
 * All endpoints require admin authentication.
 * ical_uid is auto-generated on create and never updated.
 */
class RdvController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /** GET /rdv — list all appointments with client name, most recent first. */
    public function getAll(): void
    {
        checkAuth();

        $stmt = $this->db->query(
            'SELECT r.*, c.nom AS client_nom
             FROM rdv r
             JOIN clients c ON c.id = r.client_id
             ORDER BY r.date_rdv DESC, r.id DESC'
        );
        echo json_encode($stmt->fetchAll());
    }

    /** GET /rdv/{id} — fetch a single appointment with client info. */
    public function getById(int $id): void
    {
        checkAuth();

        $stmt = $this->db->prepare(
            'SELECT r.*, c.nom AS client_nom, c.telephone AS client_telephone
             FROM rdv r
             JOIN clients c ON c.id = r.client_id
             WHERE r.id = ?'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'RDV not found']);
            return;
        }

        echo json_encode($row);
    }

    /**
     * POST /rdv  { client_id, service, date_demande, date_rdv?, heure_debut?, heure_fin?, statut?, notes? }
     * Generates a unique ical_uid automatically.
     */
    public function create(array $data): void
    {
        checkAuth();

        foreach (['client_id', 'service', 'date_demande'] as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '{$field}' is required"]);
                return;
            }
        }

        $icalUid = uniqid('adl-', true) . '@adltoiture.be';

        $stmt = $this->db->prepare(
            'INSERT INTO rdv
             (client_id, service, date_demande, date_rdv, heure_debut, heure_fin, statut, notes, ical_uid)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            (int)  $data['client_id'],
            $data['service'],
            $data['date_demande'],
            $data['date_rdv']    ?? null,
            $data['heure_debut'] ?? null,
            $data['heure_fin']   ?? null,
            $data['statut']      ?? 'en_attente',
            $data['notes']       ?? null,
            $icalUid,
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => (int) $this->db->lastInsertId()]);
    }

    /**
     * PUT /rdv/{id} — full update of an appointment.
     * ical_uid is intentionally excluded from updates (RFC 5545 requires it to be stable).
     */
    public function update(int $id, array $data): void
    {
        checkAuth();

        $stmt = $this->db->prepare(
            'UPDATE rdv
             SET client_id = ?, service = ?, date_rdv = ?, heure_debut = ?,
                 heure_fin = ?, date_confirmation = ?, statut = ?, notes = ?
             WHERE id = ?'
        );
        $stmt->execute([
            (int)  ($data['client_id']         ?? 0),
            $data['service']                   ?? '',
            $data['date_rdv']                  ?? null,
            $data['heure_debut']               ?? null,
            $data['heure_fin']                 ?? null,
            $data['date_confirmation']         ?? null,
            $data['statut']                    ?? 'en_attente',
            $data['notes']                     ?? null,
            $id,
        ]);

        if ($stmt->rowCount() === 0) {
            $check = $this->db->prepare('SELECT id FROM rdv WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'RDV not found']);
                return;
            }
        }

        echo json_encode(['success' => true]);
    }

    /** DELETE /rdv/{id} — remove an appointment. */
    public function delete(int $id): void
    {
        checkAuth();

        $stmt = $this->db->prepare('DELETE FROM rdv WHERE id = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'RDV not found']);
            return;
        }

        echo json_encode(['success' => true]);
    }

    /**
     * GET /rdv/{id}/ical — download a .ics file for the appointment.
     * Overrides the JSON Content-Type header set in index.php.
     * date_rdv must be set; falls back to 08:00–09:00 when times are missing.
     */
    public function exportIcal(int $id): void
    {
        checkAuth();

        $stmt = $this->db->prepare(
            'SELECT r.*, c.nom AS client_nom, c.telephone AS client_telephone
             FROM rdv r
             JOIN clients c ON c.id = r.client_id
             WHERE r.id = ?'
        );
        $stmt->execute([$id]);
        $rdv = $stmt->fetch();

        if (!$rdv || empty($rdv['date_rdv'])) {
            http_response_code(404);
            echo json_encode(['error' => 'RDV not found or date_rdv not set']);
            return;
        }

        $start   = $rdv['date_rdv'] . ' ' . ($rdv['heure_debut'] ?? '08:00:00');
        $end     = $rdv['date_rdv'] . ' ' . ($rdv['heure_fin']   ?? '09:00:00');
        $dtStart = gmdate('Ymd\THis\Z', strtotime($start));
        $dtEnd   = gmdate('Ymd\THis\Z', strtotime($end));
        $dtStamp = gmdate('Ymd\THis\Z');

        $summary     = "RDV – {$rdv['service']} ({$rdv['client_nom']})";
        $description = "Client : {$rdv['client_nom']} / Tél : {$rdv['client_telephone']}";

        $ics  = "BEGIN:VCALENDAR\r\n";
        $ics .= "VERSION:2.0\r\n";
        $ics .= "PRODID:-//ADL Toiture//FR\r\n";
        $ics .= "CALSCALE:GREGORIAN\r\n";
        $ics .= "BEGIN:VEVENT\r\n";
        $ics .= "UID:{$rdv['ical_uid']}\r\n";
        $ics .= "DTSTAMP:{$dtStamp}\r\n";
        $ics .= "DTSTART:{$dtStart}\r\n";
        $ics .= "DTEND:{$dtEnd}\r\n";
        $ics .= "SUMMARY:{$summary}\r\n";
        $ics .= "DESCRIPTION:{$description}\r\n";
        $ics .= "END:VEVENT\r\n";
        $ics .= "END:VCALENDAR\r\n";

        header('Content-Type: text/calendar; charset=utf-8');
        header('Content-Disposition: attachment; filename="rdv-' . $id . '.ics"');
        echo $ics;
    }
}

