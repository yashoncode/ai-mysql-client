import React, { useState, useEffect } from 'react';
import ConnectionForm from './components/ConnectionForm';
import SchemaExplorer from './components/SchemaExplorer';
import QueryEditor from './components/QueryEditor';
import ResultsTable from './components/ResultsTable';
import { setDbToken, setActiveConnection, saveConnections, loadSession, disconnectDB } from './services/api';
import AIChat from './components/AIChat';

function App() {
  const [connections, setConnections] = useState({});
  const [activeConnection, setActiveConn] = useState(null);
  const [queryResults, setQueryResults] = useState(null);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [schemaKey, setSchemaKey] = useState(0);

  const hasConnections = Object.keys(connections).length > 0;

  useEffect(() => {
    const saved = loadSession();
    if (saved && Object.keys(saved.connections).length > 0) {
      setConnections(saved.connections);
      setActiveConn(saved.activeConnection || Object.keys(saved.connections)[0]);
    }
  }, []);

  const handleConnected = (data) => {
    const newConnections = {
      ...connections,
      [data.connection_id]: {
        id: data.connection_id,
        label: data.connection_label,
        version: data.version,
      },
    };
    setConnections(newConnections);
    setDbToken(data.token);
    saveConnections(newConnections);
    setActiveConn(data.connection_id);
    setActiveConnection(data.connection_id);
    setShowAddConnection(false);
    setSchemaKey(k => k + 1);
  };

  const handleDisconnect = async (connId) => {
    try {
      const res = await disconnectDB(connId);
      if (res.data.success) {
        const newConnections = { ...connections };
        delete newConnections[connId];
        setConnections(newConnections);
        saveConnections(newConnections);

        if (res.data.token) {
          setDbToken(res.data.token);
          if (activeConnection === connId) {
            const remaining = Object.keys(newConnections);
            const newActive = remaining[0] || null;
            setActiveConn(newActive);
            setActiveConnection(newActive);
          }
          setSchemaKey(k => k + 1);
        } else {
          setDbToken(null);
          setActiveConn(null);
        }
      }
    } catch {
      // If disconnect fails, just remove locally
      const newConnections = { ...connections };
      delete newConnections[connId];
      setConnections(newConnections);
      if (Object.keys(newConnections).length === 0) {
        setDbToken(null);
        setActiveConn(null);
      }
    }
  };

  const handleDisconnectAll = () => {
    setDbToken(null);
    setConnections({});
    setActiveConn(null);
    setQueryResults(null);
  };

  const handleSwitchConnection = (connId) => {
    setActiveConn(connId);
    setActiveConnection(connId);
  };

  if (!hasConnections && !showAddConnection) {
    return <ConnectionForm onConnected={handleConnected} />;
  }

  if (showAddConnection) {
    return (
      <ConnectionForm
        onConnected={handleConnected}
        onCancel={hasConnections ? () => setShowAddConnection(false) : undefined}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Left Sidebar - Connections & Schema Explorer */}
      <div className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Connections List */}
        <div className="border-b border-gray-700">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Connections</span>
            <button
              onClick={() => setShowAddConnection(true)}
              className="text-green-400 hover:text-green-300 text-lg leading-none"
              title="Add connection"
            >
              +
            </button>
          </div>
          <div className="px-2 pb-2 space-y-1 max-h-40 overflow-y-auto">
            {Object.values(connections).map(conn => (
              <div
                key={conn.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm group ${
                  activeConnection === conn.id
                    ? 'bg-blue-900/50 border border-blue-600'
                    : 'hover:bg-gray-700 border border-transparent'
                }`}
                onClick={() => handleSwitchConnection(conn.id)}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  activeConnection === conn.id ? 'bg-green-400' : 'bg-gray-500'
                }`}></span>
                <span className="flex-1 truncate text-gray-300">{conn.label}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDisconnect(conn.id); }}
                  className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 text-xs"
                  title="Disconnect"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Schema Explorer */}
        <div className="px-4 py-2 border-b border-gray-700">
          <h2 className="text-white font-semibold text-sm">Schema Explorer</h2>
        </div>
        <div className="flex-1 overflow-hidden py-2">
          <SchemaExplorer key={schemaKey} />
        </div>
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleDisconnectAll}
            className="w-full text-xs text-gray-400 hover:text-red-400 transition-colors py-1"
          >
            Disconnect All
          </button>
        </div>
      </div>

      {/* Center - Query Editor + Results */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
        <div className="flex-shrink-0">
          <QueryEditor onResults={setQueryResults} activeConnection={connections[activeConnection]} />
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
