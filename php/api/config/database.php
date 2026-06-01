<?php

class Database
{
    // Singleton instance
    private static ?Database $instance = null;

    // PDO connection
    private PDO $pdo;

    // Connection parameters — loaded from the .env file
    private string $host;
    private string $dbname;
    private string $user;
    private string $password;

    // Private constructor — prevents direct instantiation with "new Database()"
    private function __construct()
    {
        // Load variables from the .env file
        $this->loadEnv(__DIR__ . '/../../.env');

        // Read environment variables; ?? sets a fallback if the key is absent
        $this->host     = $_ENV['DB_HOST']     ?? 'localhost';
        $this->dbname   = $_ENV['DB_NAME']      ?? 'adltoiture_db';
        $this->user     = $_ENV['DB_USER']      ?? 'adltoiture';
        $this->password = $_ENV['DB_PASSWORD']  ?? '';

        // PDO DSN with UTF-8 encoding
        $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset=utf8mb4";

        // PDO options:
        // - ERRMODE_EXCEPTION : throws an exception on query failure
        // - FETCH_ASSOC       : returns rows as associative arrays
        // - EMULATE_PREPARES  : false — use real prepared statements (safer)
        $this->pdo = new PDO($dsn, $this->user, $this->password, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }

    // Reads the .env file line by line and loads each variable into $_ENV.
    // Skips empty lines and lines starting with #.
    private function loadEnv(string $path): void
    {
        if (!is_file($path)) return;
        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) continue;
            // Split key and value on the first "=" sign
            [$key, $value] = explode('=', $line, 2) + [1 => ''];
            $_ENV[trim($key)] = trim($value);
        }
    }

    // Returns the single instance, creating it on first call.
    public static function getInstance(): Database
    {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    // Returns the PDO connection for use in controllers.
    public function getConnection(): PDO
    {
        return $this->pdo;
    }

    // Prevents cloning — enforces singleton uniqueness.
    private function __clone() {}

    // Prevents unserialization — enforces singleton uniqueness.
    public function __wakeup(): void {}
}