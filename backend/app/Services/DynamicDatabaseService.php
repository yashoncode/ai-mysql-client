<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
use Exception;

class DynamicDatabaseService
{
    protected array $credentials = [];

    public function connect(array $credentials): void
    {
        $this->credentials = $credentials;

        Config::set('database.connections.user_mysql', [
            'driver'    => 'mysql',
            'host'      => $credentials['host'],
            'port'      => $credentials['port'] ?? 3306,
            'database'  => $credentials['database'],
            'username'  => $credentials['username'],
            'password'  => $credentials['password'],
            'charset'   => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix'    => '',
            'strict'    => true,
        ]);

        DB::purge('user_mysql');
        DB::reconnect('user_mysql');
    }

    public function testConnection(array $credentials): array
    {
        $this->connect($credentials);

        $result = DB::connection('user_mysql')
            ->select('SELECT VERSION() as version, NOW() as server_time');

        return [
            'success' => true,
            'version' => $result[0]->version ?? 'Unknown',
            'server_time' => $result[0]->server_time ?? null,
        ];
    }

    public function getTables(): array
    {
        $results = DB::connection('user_mysql')->select('SHOW TABLES');
        return array_map(fn($row) => array_values((array) $row)[0], $results);
    }

    public function getTableSchema(string $table): array
    {
        $table = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
        $results = DB::connection('user_mysql')->select("DESCRIBE `{$table}`");
        return array_map(fn($row) => (array) $row, $results);
    }

    public function getFullSchema(): string
    {
        $tables = $this->getTables();
        $schema = "";

        foreach ($tables as $table) {
            $columns = $this->getTableSchema($table);
            $schema .= "Table: {$table}\n";
            foreach ($columns as $col) {
                $key = $col['Key'] ?? '';
                $null = $col['Null'] ?? '';
                $schema .= "  - {$col['Field']} ({$col['Type']})";
                if ($key === 'PRI') $schema .= " PRIMARY KEY";
                if ($key === 'MUL') $schema .= " FOREIGN KEY";
                if ($null === 'NO') $schema .= " NOT NULL";
                $schema .= "\n";
            }
            $schema .= "\n";
        }

        return $schema;
    }

    public function executeQuery(string $sql): array
    {
        $trimmed = trim(strtoupper(ltrim($sql)));
        $allowedStarts = ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN', 'DESC'];
        $isAllowed = false;
        foreach ($allowedStarts as $allowed) {
            if (str_starts_with($trimmed, $allowed)) {
                $isAllowed = true;
                break;
            }
        }

        if (!$isAllowed) {
            throw new Exception("Only SELECT, SHOW, DESCRIBE, and EXPLAIN queries are allowed.");
        }

        $start = microtime(true);
        $results = DB::connection('user_mysql')->select($sql);
        $executionTime = round((microtime(true) - $start) * 1000, 2);

        $data = array_map(fn($row) => (array) $row, $results);
        $columns = !empty($data) ? array_keys($data[0]) : [];

        return [
            'data'           => $data,
            'columns'        => $columns,
            'row_count'      => count($data),
            'execution_time' => $executionTime,
        ];
    }
}
