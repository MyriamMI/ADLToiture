<?php

class Database
{
    // Unique instance de la classe (pattern Singleton)
    private static ?Database $instance = null;
    
    // Connexion PDO
    private PDO $pdo;

    // Paramètres de connexion — chargés depuis le fichier .env
    private string $host;
    private string $dbname;
    private string $user;
    private string $password;

    // Constructeur privé — empêche d'instancier la classe avec "new Database()"
    private function __construct()
    {
        // Charge les variables du fichier .env
        $this->loadEnv(__DIR__ . '/../.env');

        // Récupère les variables d'environnement
        // Le ?? définit une valeur par défaut si la variable est absente
        $this->host     = $_ENV['DB_HOST']     ?? 'localhost';
        $this->dbname   = $_ENV['DB_NAME']      ?? 'adltoiture_db';
        $this->user     = $_ENV['DB_USER']      ?? 'adltoiture';
        $this->password = $_ENV['DB_PASSWORD']  ?? '';

        // Chaîne de connexion PDO avec encodage UTF-8
        $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset=utf8mb4";

        // Crée la connexion PDO avec 3 options importantes :
        // - ERRMODE_EXCEPTION : lance une exception si une requête échoue
        // - FETCH_ASSOC : retourne les résultats en tableau associatif (clé => valeur)
        // - EMULATE_PREPARES false : utilise les vraies requêtes préparées (plus sécurisé)
        $this->pdo = new PDO($dsn, $this->user, $this->password, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }

    // Lit le fichier .env ligne par ligne et charge chaque variable dans $_ENV
    // Ignore les lignes vides et les commentaires (qui commencent par #)
    private function loadEnv(string $path): void
    {
        if (!is_file($path)) return;
        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) continue;
            // Sépare la clé et la valeur sur le signe "="
            [$key, $value] = explode('=', $line, 2) + [1 => ''];
            $_ENV[trim($key)] = trim($value);
        }
    }

    // Point d'entrée unique — retourne toujours la même instance
    // Si elle n'existe pas encore, elle est créée ici
    public static function getInstance(): Database
    {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    // Retourne la connexion PDO pour l'utiliser dans les contrôleurs
    public function getConnection(): PDO
    {
        return $this->pdo;
    }

    // Empêche le clonage de l'instance (garantit l'unicité du Singleton)
    private function __clone() {}
    
    // Empêche la désérialisation de l'instance
    public function __wakeup(): void {}
}
