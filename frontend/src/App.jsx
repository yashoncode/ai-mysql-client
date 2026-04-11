import React, { useState, useEffect } from 'react';
import ConnectionForm from './components/ConnectionForm';
import SchemaExplorer from './components/SchemaExplorer';
import QueryEditor from './components/QueryEditor';
import ResultsTable from './components/ResultsTable';
import { setDbToken, loadSession } from './services/api';
import AIChat from './components/AIChat';

function App() {
  const [connected, setConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [queryResults, setQueryResults] = useState(null);

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setConnected(true);
      setConnectionInfo(saved);
    }
  }, []);

  const handleConnected = (info) => {
    setConnected(true);
    setConnectionInfo(info);
  };

  if (!connected) {
    return <ConnectionForm onConnected={handleConnected} />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Left Sidebar - Schema Explorer */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-xs text-gray-400 truncate">
              Connected · MySQL {connectionInfo?.version?.split('-')[0]}
            </span>
          </div>
          <h2 className="text-white font-semibold mt-1 text-sm">Schema Explorer</h2>
        </div>
        <div className="flex-1 overflow-hidden py-2">
          <SchemaExplorer />
        </div>
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={() => { setDbToken(null); setConnected(false); setConnectionInfo(null); setQueryResults(null); }}
            className="w-full text-xs text-gray-400 hover:text-red-400 transition-colors py-1"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Center - Query Editor + Results */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
        <div className="flex-shrink-0">
          <QueryEditor onResults={setQueryResults} />
        </div>
        <div className="flex-1 overflow-auto min-h-0">
          <ResultsTable results={queryResults} />
        </div>
      </div>

      {/* Right Sidebar - AI Chat */}
      <div className="w-96 border-l border-gray-700 p-4">
        <AIChat />
      </div>
    </div>
  );
}

export default App;
