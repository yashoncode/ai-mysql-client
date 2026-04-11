import React, { useState } from 'react';
import { analyzeResults } from '../services/api';

const ResultsTable = ({ results }) => {
  const [aiInsights, setAiInsights] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  if (!results) return (
    <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-500">
      <div className="text-4xl mb-3">📊</div>
      <p>Run a query to see results here</p>
    </div>
  );

  const { data, columns, row_count, execution_time, query } = results;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await analyzeResults(query, data);
      if (res.data.success) {
        setAiInsights(res.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">Query Results</span>
          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">
            {row_count} rows
          </span>
          <span className="text-xs text-gray-500">{execution_time}ms</span>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !data?.length}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
        >
          {analyzing ? '⚙️ Analyzing...' : '✨ AI Analyze'}
        </button>
      </div>

      {/* Table */}
      {data && data.length > 0 ? (
        <div className="overflow-auto max-h-64">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 sticky top-0">
              <tr>
                {columns.map(col => (
                  <th key={col} className="text-left px-4 py-2 text-gray-300 font-medium whitespace-nowrap border-b border-gray-700">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                  {columns.map(col => (
                    <td key={col} className="px-4 py-2 text-gray-300 border-b border-gray-700/50 whitespace-nowrap max-w-xs truncate">
                      {row[col] === null ? <span className="text-gray-600 italic">NULL</span> : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <div className="text-3xl mb-2">📭</div>
          <p>No results returned</p>
        </div>
      )}

      {error && (
        <div className="mx-4 my-2 bg-red-900/50 border border-red-500 text-red-300 rounded p-2 text-sm">
          {error}
        </div>
      )}

      {/* AI Insights Panel */}
      {aiInsights && (
        <div className="border-t border-gray-700 bg-gray-900/50 p-4">
          <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
            ✨ AI Insights
          </h3>
          <p className="text-gray-300 text-sm mb-4">{aiInsights.summary}</p>

          {aiInsights.insights?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-gray-400 text-xs font-semibold uppercase mb-2">Key Findings</h4>
              <ul className="space-y-1">
                {aiInsights.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aiInsights.suggestions?.length > 0 && (
            <div>
              <h4 className="text-gray-400 text-xs font-semibold uppercase mb-2">Suggested Queries</h4>
              <div className="flex flex-wrap gap-2">
                {aiInsights.suggestions.map((suggestion, i) => (
                  <span key={i} className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded border border-blue-800">
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsTable;
