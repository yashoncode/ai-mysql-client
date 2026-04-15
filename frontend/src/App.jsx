import React, { useState, useEffect, useCallback } from 'react';
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
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [schemaKey, setSchemaKey] = useState(0);
  const [activeTab, setActiveTab] = useState('query'); // 'query' | 'chat'
  const [exploreWidth, setExploreWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);

  const hasConnections = Object.keys(connections).length > 0;

  useEffect(() => {
    const saved = loadSession();
    if (saved && Object.keys(saved.connections).length > 0) {
      setConnections(saved.connections);
      setActiveConn(saved.activeConnection || Object.keys(saved.connections)[0]);
    }
  }, []);

  // Resize handler for explore bar
  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    const newWidth = e.clientX - 56; // subtract settings bar width
    setExploreWidth(Math.max(180, Math.min(500, newWidth)));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

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
    setShowConnectionModal(false);
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

  // If no connections, show just the connection modal centered
  if (!hasConnections && !showConnectionModal) {
    return (
      <div className="h-full bg-antares-bg flex items-center justify-center">
        <ConnectionForm onConnected={handleConnected} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-antares-bg text-antares-text select-none">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">

        {/* ═══ Settings Bar (narrow icon strip) ═══ */}
        <div className="w-14 flex-shrink-0 bg-antares-sidebar flex flex-col items-center py-2 border-r border-antares-border">
          {/* Connection Icons */}
          <div className="flex-1 flex flex-col items-center gap-1 w-full overflow-y-auto thin-scrollbar">
            {Object.values(connections).map(conn => (
              <button
                key={conn.id}
                onClick={() => handleSwitchConnection(conn.id)}
                onContextMenu={(e) => { e.preventDefault(); handleDisconnect(conn.id); }}
                className={`group relative w-10 h-10 rounded flex items-center justify-center transition-all duration-200 ${
                  activeConnection === conn.id
                    ? 'bg-antares-accent text-white'
                    : 'text-antares-text-dim hover:bg-antares-hover hover:text-white'
                }`}
                title={`${conn.label}\nRight-click to disconnect`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75" />
                </svg>
                {/* Active indicator bar */}
                {activeConnection === conn.id && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r" />
                )}
                {/* Status dot */}
                <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                  activeConnection === conn.id ? 'bg-antares-success' : 'bg-antares-text-dim'
                }`} />
              </button>
            ))}
          </div>

          {/* Bottom icons */}
          <div className="flex flex-col items-center gap-1 border-t border-antares-border pt-2 w-full">
            {/* Add Connection */}
            <button
              onClick={() => setShowConnectionModal(true)}
              className="w-10 h-10 rounded flex items-center justify-center text-antares-text-dim hover:bg-antares-hover hover:text-antares-accent transition-colors"
              title="New connection"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            {/* Disconnect All */}
            {hasConnections && (
              <button
                onClick={handleDisconnectAll}
                className="w-10 h-10 rounded flex items-center justify-center text-antares-text-dim hover:bg-antares-hover hover:text-antares-error transition-colors"
                title="Disconnect all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ═══ Explore Bar (Schema Sidebar) ═══ */}
        {hasConnections && (
          <>
            <div
              className="flex-shrink-0 bg-antares-sidebar flex flex-col border-r border-antares-border overflow-hidden"
              style={{ width: exploreWidth }}
            >
              {/* Explore Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-antares-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-antares-text-dim">Explorer</span>
                <button
                  onClick={() => setSchemaKey(k => k + 1)}
                  className="text-antares-text-dim hover:text-white text-xs p-1 rounded hover:bg-antares-hover"
                  title="Refresh schema"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                </button>
              </div>

              {/* Schema Tree */}
              <div className="flex-1 overflow-y-auto thin-scrollbar py-1">
                <SchemaExplorer key={schemaKey} />
              </div>
            </div>

            {/* Resize Handle */}
            <div
              className="w-1 flex-shrink-0 resize-handle bg-antares-border hover:bg-antares-accent transition-colors"
              onMouseDown={() => setIsResizing(true)}
            />
          </>
        )}

        {/* ═══ Main Workspace Area ═══ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {hasConnections ? (
            <>
              {/* Tab Bar */}
              <div className="flex items-center bg-antares-sidebar border-b border-antares-border px-2">
                <button
                  onClick={() => setActiveTab('query')}
                  className={`relative px-4 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'query'
                      ? 'text-white bg-antares-bg'
                      : 'text-antares-text-dim hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                    Query
                  </span>
                  {activeTab === 'query' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-antares-accent" />}
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`relative px-4 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'text-white bg-antares-bg'
                      : 'text-antares-text-dim hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    AI Chat
                  </span>
                  {activeTab === 'chat' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-antares-accent" />}
                </button>

                {/* Active connection label */}
                <div className="ml-auto flex items-center gap-2 text-2xs text-antares-text-dim pr-2">
                  {connections[activeConnection] && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-antares-success" />
                      <span>{connections[activeConnection].label}</span>
                      {connections[activeConnection].version && (
                        <span className="opacity-50">v{connections[activeConnection].version}</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {activeTab === 'query' ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Query Editor */}
                    <div className="flex-shrink-0">
                      <QueryEditor onResults={setQueryResults} activeConnection={connections[activeConnection]} />
                    </div>
                    {/* Results */}
                    <div className="flex-1 overflow-hidden">
                      <ResultsTable results={queryResults} />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-hidden">
                    <AIChat />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-antares-text-dim">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75" />
                </svg>
                <p className="text-sm">No active connection</p>
                <p className="text-2xs mt-1">Add a connection to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Footer Bar ═══ */}
      <div className="footer-accent flex items-center justify-between px-3 h-6 text-2xs text-white/90 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold">AI MySQL Client</span>
          {connections[activeConnection] && (
            <>
              <span className="opacity-50">|</span>
              <span>{connections[activeConnection].label}</span>
              {connections[activeConnection].version && (
                <>
                  <span className="opacity-50">|</span>
                  <span>MySQL {connections[activeConnection].version}</span>
                </>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>{Object.keys(connections).length} connection{Object.keys(connections).length !== 1 ? 's' : ''}</span>
          <span className="opacity-50">|</span>
          <span>Gemini AI</span>
        </div>
      </div>

      {/* ═══ Connection Modal ═══ */}
      {showConnectionModal && (
        <ConnectionForm
          onConnected={handleConnected}
          onCancel={() => setShowConnectionModal(false)}
        />
      )}
    </div>
  );
}

export default App;
