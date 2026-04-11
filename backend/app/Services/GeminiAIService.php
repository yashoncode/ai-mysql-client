<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class GeminiAIService
{
    protected string $apiKey;
    protected string $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', '');
    }

    public function generateSQL(string $question, string $schema): array
    {
        $prompt = <<<PROMPT
You are an expert SQL query generator. Given the following database schema and a natural language question, generate the appropriate SQL query.

Database Schema:
{$schema}

Question: {$question}

Respond with ONLY a JSON object (no markdown, no code fences) with this exact structure:
{"sql": "YOUR SQL QUERY HERE", "explanation": "Brief explanation of the query"}
PROMPT;

        $result = $this->callGemini($prompt);

        return [
            'sql'         => $result['sql'] ?? '',
            'explanation' => $result['explanation'] ?? '',
        ];
    }

    public function analyzeResults(string $query, array $results, string $schema): array
    {
        $resultsSample = array_slice($results, 0, 20);
        $resultsJson = json_encode($resultsSample, JSON_PRETTY_PRINT);
        $totalRows = count($results);

        $prompt = <<<PROMPT
You are a data analyst. Analyze the following SQL query results and provide insights.

Database Schema:
{$schema}

SQL Query Executed:
{$query}

Query Results (showing {$totalRows} rows):
{$resultsJson}

Respond with ONLY a JSON object (no markdown, no code fences) with this exact structure:
{
  "summary": "A 2-3 sentence summary of what the data shows",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "suggestions": ["follow-up query suggestion 1", "follow-up query suggestion 2"],
  "chart_type": "bar|line|pie|table|none"
}
PROMPT;

        $result = $this->callGemini($prompt);

        return [
            'summary'     => $result['summary'] ?? 'Analysis complete.',
            'insights'    => $result['insights'] ?? [],
            'suggestions' => $result['suggestions'] ?? [],
            'chart_type'  => $result['chart_type'] ?? 'table',
        ];
    }

    public function chat(string $message, string $schema, array $history = []): string
    {
        $historyText = '';
        foreach ($history as $msg) {
            $role = $msg['role'] === 'user' ? 'User' : 'Assistant';
            $historyText .= "{$role}: {$msg['content']}\n";
        }

        $prompt = <<<PROMPT
You are an expert database assistant. You help users understand their database schema and data.

Database Schema:
{$schema}

Conversation History:
{$historyText}

User: {$message}

Provide a helpful, concise response about the database. You can suggest SQL queries, explain the schema, or answer questions about the data.
PROMPT;

        $result = $this->callGemini($prompt, false);
        return is_string($result) ? $result : ($result['response'] ?? 'I could not generate a response. Please try again.');
    }

    public function callGemini(string $prompt, bool $expectJson = true): mixed
    {
        if (empty($this->apiKey)) {
            throw new Exception("Gemini API key is not configured.");
        }

        $response = Http::timeout(30)->post("{$this->apiUrl}?key={$this->apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature'     => 0.1,
                'maxOutputTokens' => 2048,
            ],
        ]);

        if (!$response->successful()) {
            Log::error('Gemini API error', ['status' => $response->status(), 'body' => $response->body()]);
            throw new Exception("Gemini API error: " . $response->status());
        }

        $data = $response->json();
        $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

        if (!$expectJson) {
            return $text;
        }

        // Clean markdown fences
        $text = preg_replace('/^```(?:json)?\s*/m', '', $text);
        $text = preg_replace('/\s*```\s*$/m', '', $text);
        $text = trim($text);

        $parsed = json_decode($text, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Failed to parse Gemini JSON response', ['text' => $text]);
            throw new Exception("Failed to parse AI response as JSON.");
        }

        return $parsed;
    }
}
