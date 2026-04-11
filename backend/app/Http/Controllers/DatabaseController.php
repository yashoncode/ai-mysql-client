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

            // Return encrypted credentials as a token for stateless reconnection
            $token = Crypt::encryptString(json_encode($validated));

            return response()->json([
                'success' => true,
                'message' => 'Connected successfully',
                'version' => $result['version'],
                'server_time' => $result['server_time'],
                'token' => $token,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    protected function reconnect(Request $request): void
    {
        $token = $request->header('X-DB-Token');
        if (!$token) {
            throw new Exception('No database connection. Please connect first.');
        }
        $credentials = json_decode(Crypt::decryptString($token), true);
        $this->dbService->connect($credentials);
    }

    public function schema(Request $request): JsonResponse
    {
        try {
            $this->reconnect($request);
            $tables = $this->dbService->getTables();
            $schema = [];

            foreach ($tables as $table) {
                $schema[$table] = $this->dbService->getTableSchema($table);
            }

            return response()->json([
                'success' => true,
                'tables'  => $schema,
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
            $this->reconnect($request);
            $schema = $this->dbService->getFullSchema();
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
            $this->reconnect($request);
            $schema = $this->dbService->getFullSchema();
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
