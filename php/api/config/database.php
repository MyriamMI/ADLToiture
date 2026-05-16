<?php

/**
 * Database — Singleton PDO connection to adltoiture_db.
 * Use Database::getInstance()->getConnection() to get the PDO object.
 */
class Database
{
    private static ?Database $instance = null;
    private PDO $pdo;

    // LOCAL
    // private string $host     = 'localhost';
    // private string $dbname   = 'adltoiture_db';
    // private string $user     = 'root';
    // private string $password = '';

    private string $host     = 'mysql-adltoiture.alwaysdata.net';
    private string $dbname   = 'adltoiture_db';
    private string $user     = 'adltoiture';
    private string $password = 'Mimi215821580.';

    private function __construct()
    {
        $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset=utf8mb4";

        $this->pdo = new PDO($dsn, $this->user, $this->password, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }

    /** Returns the unique Database instance. */
    public static function getInstance(): Database
    {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    /** Returns the underlying PDO connection. */
    public function getConnection(): PDO
    {
        return $this->pdo;
    }

    /** Prevent cloning and unserialization of the Singleton. */
    private function __clone() {}
    public function __wakeup(): void {}
}
