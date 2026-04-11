import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { executeQuery, generateSQL } from '../services/api';

const QueryEditor = ({ onResults }) => {
  const [sql, setSql] = useState('SELECT * FROM customers LIMIT 10;');
  const [aiQuestion, setAiQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [explanation, setExplanation] = useState('');

  const handleRun = async () => {
    if (!sql.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await executeQuery(sql);
      if (res.data.success) {
        onResults({ ...res.data, query: sql });
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Query execution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSQL = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setError('');
    setExplanation('');
    try {
      const res = await generateSQL(aiQuestion);
      if (res.data.success) {
        setSql(res.data.sql);
        setExplanation(res.data.explanation);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate SQL');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      {/* AI Input Bar */}
      <div className="bg-purple-900/30 border-b border-gray-700 p-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">✨</span>
            <input
              type="text"
              value={aiQuestion}
              onChange={e => setAiQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerateSQL()}
              placeholder="Describe what you want to query in natural language..."
              className="w-full bg-gray-700 text-white pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 border border-gray-600"
            />
          </div>
          <button
            onClick={handleGenerateSQL}
            disabled={aiLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            {aiLoading ? '⚙️ Generating...' : '🤖 Generate SQL'}
          </button>
        </div>
        {explanation && (
          <p className="text-purple-300 text-xs mt-2 pl-1">💡 {explanation}</p>
        )}
      </div>

      {/* Monaco Editor */}
      <div className="border-b border-gray-700">
        <Editor
          height="200px"
          language="sql"
          value={sql}
          onChange={value => setSql(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 8 },
          }}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs text-gray-500">⚠️ Only SELECT queries allowed</span>
        <div className="flex gap-2">
          <button
            onClick={() => setSql('')}
            className="text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleRun}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-5 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? '⚙️ Running...' : '▶ Run Query'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mb-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg p-2 text-sm">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default QueryEditor;
