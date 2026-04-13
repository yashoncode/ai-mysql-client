<?php

namespace App\Http\Controllers;

use App\Services\DynamicDatabaseService;
use App\Services\GeminiAIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Crypt;
use Exception;

class DatabaseController extends Controller
{
    public function __construct(
        protected DynamicDatabaseService $dbService,
        protected GeminiAIService $aiService
    ) {}

    protected function decodeToken(Request $request): array
    {
        $token = $request->header('X-DB-Token');
        if (!$token) {
            return [];
        }
        return json_decode(Crypt::decryptString($token), true) ?: [];
    }

    protected function encodeToken(array $connections): string
    {
        return Crypt::encryptString(json_encode($connections));
    }

    protected function reconnect(Request $request, ?string $connectionId = null): void
    {
        $connections = $this->decodeToken($request);
        if (empty($connections)) {
            throw new Exception('No database connection. Please connect first.');
        }

        $id = $connectionId ?? $request->input('connection_id') ?? $request->header('X-DB-Active');
        if ($id && isset($connections[$id])) {
            $this->dbService->connect($connections[$id]);
        } else {
            // Default to first connection
            $this->dbService->connect(reset($connections));
        }
    }

    protected function reconnectAll(Request $request): array
    {
        $connections = $this->decodeToken($request);
        if (empty($connections)) {
            throw new Exception('No database connection. Please connect first.');
        }
        return $connections;
    }

    public function connect(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'host'     => 'required|string',
            'port'     => 'required|integer|min:1|max:65535',
            'database' => 'required|string',
            'username' => 'required|string',
            'password' => 'nullable|string',
        ]);

        try {
            $result = $this->dbService->testConnection($validated);

            // Build connections map: merge with existing or start fresh
            $connections = $this->decodeToken($request);
            $id = uniqid('db_');
            $connections[$id] = $validated;

            $token = $this->encodeToken($connections);

            return response()->json([
                'success' => true,
                'message' => 'Connected successfully',
                'version' => $result['version'],
                'server_time' => $result['server_time'],
                'token' => $token,
                'connection_id' => $id,
                'connection_label' => $validated['database'] . '@' . $validated['host'],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function disconnect(Request $request): JsonResponse
    {
        $request->validate(['connection_id' => 'required|string']);

        $connections = $this->decodeToken($request);
        $id = $request->input('connection_id');

        unset($connections[$id]);

        if (empty($connections)) {
            return response()->json([
                'success' => true,
                'token' => null,
                'connections' => [],
            ]);
        }

        return response()->json([
            'success' => true,
            'token' => $this->encodeToken($connections),
            'connections' => collect($connections)->map(fn($c, $cid) => [
                'id' => $cid,
                'label' => $c['database'] . '@' . $c['host'],
            ])->values(),
        ]);
    }

    public function schema(Request $request): JsonResponse
    {
        try {
            $connections = $this->reconnectAll($request);
            $allSchemas = [];

            foreach ($connections as $id => $creds) {
                $this->dbService->connect($creds);
                $label = $creds['database'] . '@' . $creds['host'];
                $tables = $this->dbService->getTables();
                $schema = [];
                foreach ($tables as $table) {
                    $schema[$table] = $this->dbService->getTableSchema($table);
                }
                $allSchemas[$id] = [
                    'label' => $label,
                    'database' => $creds['database'],
                    'tables' => $schema,
                ];
            }

            return response()->json([
                'success' => true,
                'schemas' => $allSchemas,
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function query(Request $request): JsonResponse
    {
        $request->validate(['sql' => 'required|string']);

        try {
            $this->reconnect($request);
            $result = $this->dbService->executeQuery($request->input('sql'));

            return response()->json([
                'success' => true,
                ...$result,
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function generateSQL(Request $request): JsonResponse
    {
        $request->validate(['question' => 'required|string']);

        try {
            $connections = $this->reconnectAll($request);
            $schema = '';
            foreach ($connections as $id => $creds) {
                $this->dbService->connect($creds);
                $schema .= "=== Database: {$creds['database']}@{$creds['host']} ===\n";
                $schema .= $this->dbService->getFullSchema() . "\n";
            }
            $result = $this->aiService->generateSQL($request->input('question'), $schema);

            return response()->json(['success' => true, ...$result]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function analyze(Request $request): JsonResponse
    {
        $request->validate([
            'query'   => 'required|string',
            'results' => 'required|array',
        ]);

        try {
            $this->reconnect($request);
            $schema = $this->dbService->getFullSchema();
            $result = $this->aiService->analyzeResults(
                $request->input('query'),
                $request->input('results'),
                $schema
            );

            return response()->json(['success' => true, ...$result]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string',
            'history' => 'nullable|array',
        ]);

        try {
            $connections = $this->reconnectAll($request);
            $schema = '';
            foreach ($connections as $id => $creds) {
                $this->dbService->connect($creds);
                $schema .= "=== Database: {$creds['database']}@{$creds['host']} ===\n";
                $schema .= $this->dbService->getFullSchema() . "\n";
            }
            $response = $this->aiService->chat(
                $request->input('message'),
                $schema,
                $request->input('history', [])
            );

            return response()->json(['success' => true, 'response' => $response]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }
}
