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
    <div className="border-b border-antares-border">
      {/* AI Generate Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-antares-surface border-b border-antares-border">
        <svg className="w-3.5 h-3.5 text-antares-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        <input
          type="text"
          value={aiQuestion}
          onChange={e => setAiQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGenerateSQL()}
          placeholder="Describe your query in natural language..."
          className="flex-1 bg-antares-bg border border-antares-border rounded text-2xs text-antares-text-bright px-2.5 py-1 focus:outline-none focus:border-antares-accent"
        />
        <button
          onClick={handleGenerateSQL}
          disabled={aiLoading || !aiQuestion.trim()}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-2xs font-medium bg-antares-accent hover:brightness-110 text-white disabled:opacity-40 transition-all flex-shrink-0"
        >
          {aiLoading ? (
            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          )}
          Generate
        </button>
      </div>

      {explanation && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-antares-accent/10 border-b border-antares-border text-2xs text-antares-accent">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
          <span className="truncate">{explanation}</span>
        </div>
      )}

      {/* Monaco Editor */}
      <Editor
        height="180px"
        language="sql"
        value={sql}
        onChange={value => setSql(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 6, bottom: 6 },
          lineHeight: 20,
          renderLineHighlight: 'gutter',
          lineNumbersMinChars: 3,
          folding: false,
          glyphMargin: false,
          overviewRulerBorder: false,
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />

      {/* Query Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-antares-surface border-t border-antares-border">
        <div className="flex items-center gap-2 text-2xs text-antares-text-dim">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
          </svg>
          Read-only mode: SELECT queries only
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setSql(''); setExplanation(''); setError(''); }}
            className="px-2.5 py-1 rounded text-2xs text-antares-text-dim hover:text-white hover:bg-antares-hover transition-colors border border-transparent hover:border-antares-border"
          >
            Clear
          </button>
          <button
            onClick={handleRun}
            disabled={loading || !sql.trim()}
            className="flex items-center gap-1 px-3 py-1 rounded text-2xs font-medium bg-antares-success hover:brightness-110 text-white disabled:opacity-40 transition-all"
          >
            {loading ? (
              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {loading ? 'Running...' : 'Run'}
            <span className="text-white/50 ml-1">⌘↵</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-antares-error/10 border-t border-antares-error/30 text-2xs text-antares-error">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span className="truncate">{error}</span>
        </div>
      )}
    </div>
  );
};

export default QueryEditor;
