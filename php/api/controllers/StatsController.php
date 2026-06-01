<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

/**
 * GET /stats — real statistics from the database.
 * Each query is wrapped in a try/catch that logs the exact error
 * and returns it in the JSON response.
 */
class StatsController
{
    private PDO $db;

    private const MONTHS = ['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
                             'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    private function query(string $label, string $sql): \PDOStatement
    {
        try {
            $stmt = $this->db->query($sql);
            return $stmt;
        } catch (\Throwable $e) {
            $msg = "[StatsController::$label] " . $e->getMessage();
            error_log($msg);
            http_response_code(500);
            echo json_encode(['error' => $msg]);
            exit;
        }
    }

    public function get(): void
    {
        checkAuth();

        // ── KPI: revenue this month ───────────────────────────────────────────
        $caMois = (float) $this->query('caMois',
            "SELECT COALESCE(SUM(montant_ttc), 0) FROM devis
             WHERE statut = 'accepte'
               AND MONTH(date_creation) = MONTH(CURRENT_DATE)
               AND YEAR(date_creation)  = YEAR(CURRENT_DATE)"
        )->fetchColumn();

        // ── KPI: previous month revenue (for trend calculation) ──────────────
        $caMoisPrev = (float) $this->query('caMoisPrev',
            "SELECT COALESCE(SUM(montant_ttc), 0) FROM devis
             WHERE statut = 'accepte'
               AND MONTH(date_creation) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
               AND YEAR(date_creation)  = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))"
        )->fetchColumn();

        $caEvolution = $caMoisPrev > 0
            ? round(($caMois - $caMoisPrev) / $caMoisPrev * 100, 1)
            : 0;

        // ── KPI: appointments this month ─────────────────────────────────────
        $rdvMois = (int) $this->query('rdvMois',
            "SELECT COUNT(*) FROM rdv
             WHERE MONTH(date_rdv) = MONTH(CURRENT_DATE)
               AND YEAR(date_rdv)  = YEAR(CURRENT_DATE)"
        )->fetchColumn();

        // ── KPI: pending appointments ─────────────────────────────────────────
        $rdvEnAttente = (int) $this->query('rdvEnAttente',
            "SELECT COUNT(*) FROM rdv WHERE statut = 'en_attente'"
        )->fetchColumn();

        // ── KPI: accepted quotes ──────────────────────────────────────────────
        $devisAcceptes = (int) $this->query('devisAcceptes',
            "SELECT COUNT(*) FROM devis WHERE statut = 'accepte'"
        )->fetchColumn();

        // ── KPI: sent quotes (full pipeline) ─────────────────────────────────
        $devisEnvoyes = (int) $this->query('devisEnvoyes',
            "SELECT COUNT(*) FROM devis WHERE statut IN ('accepte','envoye','refuse')"
        )->fetchColumn();

        $tauxConversion = $devisEnvoyes > 0
            ? (int) round($devisAcceptes / $devisEnvoyes * 100)
            : 0;

        // ── Appointments per month (last 6 months) ────────────────────────────
        $stmtRdv = $this->query('rdvParMois',
            "SELECT YEAR(date_rdv) AS annee, MONTH(date_rdv) AS mois_num, COUNT(*) AS nb
             FROM rdv
             WHERE date_rdv >= DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH), '%Y-%m-01')
               AND date_rdv IS NOT NULL
             GROUP BY annee, mois_num
             ORDER BY annee, mois_num"
        );
        $rdvParMois = array_map(fn($r) => [
            'mois' => self::MONTHS[(int) $r['mois_num']],
            'nb'   => (int) $r['nb'],
        ], $stmtRdv->fetchAll());

        // ── Revenue per month (last 6 months) ────────────────────────────────
        $stmtCa = $this->query('caParMois',
            "SELECT YEAR(date_creation) AS annee, MONTH(date_creation) AS mois_num,
                    COALESCE(SUM(montant_ttc), 0) AS ca
             FROM devis
             WHERE statut = 'accepte'
               AND date_creation >= DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 5 MONTH), '%Y-%m-01')
             GROUP BY annee, mois_num
             ORDER BY annee, mois_num"
        );
        $caParMois = array_map(fn($r) => [
            'mois' => self::MONTHS[(int) $r['mois_num']],
            'ca'   => (float) $r['ca'],
        ], $stmtCa->fetchAll());

        // ── Quote statuses ────────────────────────────────────────────────────
        $stmtStatuts = $this->query('statutsDevis',
            "SELECT statut, COUNT(*) AS nb FROM devis GROUP BY statut"
        );
        $statutMap = [];
        foreach ($stmtStatuts->fetchAll() as $r) {
            $statutMap[$r['statut']] = (int) $r['nb'];
        }
        $statutsDevis = [
            ['label' => 'Acceptés',   'value' => $statutMap['accepte']    ?? 0],
            ['label' => 'En attente', 'value' => $statutMap['en_attente'] ?? 0],
            ['label' => 'Envoyés',    'value' => $statutMap['envoye']     ?? 0],
            ['label' => 'Refusés',    'value' => $statutMap['refuse']     ?? 0],
        ];

        // ── Requested services (% of total appointments) ─────────────────────
        $stmtSvc = $this->query('servicesDemandes',
            "SELECT s.nom AS label, COUNT(r.id) AS nb
             FROM rdv r
             JOIN services s ON s.id = r.service_id
             GROUP BY s.id, s.nom
             ORDER BY nb DESC
             LIMIT 5"
        );
        $svcRows  = $stmtSvc->fetchAll();
        $totalRdv = array_sum(array_column($svcRows, 'nb'));
        $servicesDemandes = array_map(fn($r) => [
            'label' => $r['label'],
            'pct'   => $totalRdv > 0 ? (int) round($r['nb'] / $totalRdv * 100) : 0,
        ], $svcRows);

        // ── Top 5 services this month ─────────────────────────────────────────
        $stmtTop = $this->query('topServices',
            "SELECT
               s.nom AS service,
               COUNT(r.id) AS rdv,
               COALESCE((
                 SELECT COUNT(r2.id) FROM rdv r2
                 WHERE r2.service_id = s.id
                   AND MONTH(r2.date_rdv) = MONTH(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
                   AND YEAR(r2.date_rdv)  = YEAR(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH))
               ), 0) AS rdv_prev
             FROM rdv r
             JOIN services s ON s.id = r.service_id
             WHERE MONTH(r.date_rdv) = MONTH(CURRENT_DATE)
               AND YEAR(r.date_rdv)  = YEAR(CURRENT_DATE)
             GROUP BY s.id, s.nom
             ORDER BY rdv DESC
             LIMIT 5"
        );
        $topServices = array_map(function ($r) {
            $curr      = (int) $r['rdv'];
            $prev      = (int) $r['rdv_prev'];
            $evolution = $prev > 0 ? (int) round(($curr - $prev) / $prev * 100) : 0;
            return [
                'service'   => $r['service'],
                'rdv'       => $curr,
                'ca'        => 0,
                'evolution' => $evolution,
            ];
        }, $stmtTop->fetchAll());

        echo json_encode([
            'kpi' => [
                'caMois'         => $caMois,
                'caEvolution'    => $caEvolution,
                'rdvMois'        => $rdvMois,
                'rdvEnAttente'   => $rdvEnAttente,
                'devisAcceptes'  => $devisAcceptes,
                'devisEnvoyes'   => $devisEnvoyes,
                'tauxConversion' => $tauxConversion,
                'tauxObjectif'   => 70,
            ],
            'rdvParMois'       => $rdvParMois,
            'caParMois'        => $caParMois,
            'statutsDevis'     => $statutsDevis,
            'servicesDemandes' => $servicesDemandes,
            'topServices'      => $topServices,
        ]);
    }
}
