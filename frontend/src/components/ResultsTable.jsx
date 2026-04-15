import React, { useState } from 'react';
import { analyzeResults } from '../services/api';

const ResultsTable = ({ results }) => {
  const [aiInsights, setAiInsights] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  if (!results) return (
    <div className="h-full flex items-center justify-center text-antares-text-dim">
      <div className="text-center">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-12.75A1.125 1.125 0 014.5 4.5h15a1.125 1.125 0 011.125 1.125v12.75" />
        </svg>
        <p className="text-2xs">Run a query to see results</p>
      </div>
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

  const getCellColor = (value) => {
    if (value === null || value === undefined) return 'text-antares-text-dim italic';
    if (typeof value === 'number') return 'text-[cornflowerblue]';
    return 'text-antares-text';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Results Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-antares-surface border-b border-antares-border flex-shrink-0">
        <div className="flex items-center gap-3 text-2xs">
          <div className="flex items-center gap-1.5 text-antares-text">
            <svg className="w-3 h-3 text-antares-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625" />
            </svg>
            Results
          </div>
          <span className="px-1.5 py-0.5 rounded bg-antares-accent/20 text-antares-accent font-medium">
            {row_count} rows
          </span>
          <span className="text-antares-text-dim">{execution_time}ms</span>
          <span className="text-antares-text-dim">|</span>
          <span className="text-antares-text-dim">{columns?.length} columns</span>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !data?.length}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-2xs font-medium bg-antares-accent hover:brightness-110 text-white disabled:opacity-40 transition-all"
        >
          {analyzing ? (
            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          )}
          AI Analyze
        </button>
      </div>

      {/* Table */}
      {data && data.length > 0 ? (
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-2xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-antares-sidebar">
                <th className="px-2 py-1.5 text-left text-antares-text-dim font-semibold border-b-2 border-antares-border border-r border-antares-border/50 w-10 text-center">#</th>
                {columns.map(col => (
                  <th key={col} className="px-2 py-1.5 text-left text-antares-text-dim font-semibold border-b-2 border-antares-border border-r border-antares-border/50 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className={`${i % 2 === 0 ? 'bg-antares-bg' : 'bg-antares-surface/30'} hover:bg-antares-hover transition-colors`}>
                  <td className="px-2 py-1 text-center text-antares-text-dim border-r border-antares-border/30 font-mono">{i + 1}</td>
                  {columns.map(col => (
                    <td
                      key={col}
                      className={`px-2 py-1 border-r border-antares-border/20 whitespace-nowrap max-w-xs truncate font-mono ${getCellColor(row[col])}`}
                    >
                      {row[col] === null ? 'NULL' : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-antares-text-dim">
          <div className="text-center text-2xs">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25" />
            </svg>
            No results returned
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-antares-error/10 border-t border-antares-error/30 text-2xs text-antares-error flex-shrink-0">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* AI Insights Panel */}
      {aiInsights && (
        <div className="flex-shrink-0 border-t border-antares-border bg-antares-surface/50 p-3 max-h-48 overflow-y-auto thin-scrollbar">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-antares-accent mb-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            AI Insights
          </h3>
          <p className="text-2xs text-antares-text mb-2">{aiInsights.summary}</p>

          {aiInsights.insights?.length > 0 && (
            <div className="mb-2">
              <h4 className="text-2xs font-semibold text-antares-text-dim uppercase tracking-wider mb-1">Key Findings</h4>
              <ul className="space-y-0.5">
                {aiInsights.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-2xs text-antares-text">
                    <span className="text-antares-success mt-0.5">&#x25CF;</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aiInsights.suggestions?.length > 0 && (
            <div>
              <h4 className="text-2xs font-semibold text-antares-text-dim uppercase tracking-wider mb-1">Suggested Queries</h4>
              <div className="flex flex-wrap gap-1">
                {aiInsights.suggestions.map((suggestion, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-antares-accent/10 text-antares-accent text-2xs border border-antares-accent/20">
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
