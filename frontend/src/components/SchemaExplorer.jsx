import React, { useState, useEffect } from 'react';
import { getSchema } from '../services/api';

const SchemaExplorer = ({ onTableSelect }) => {
  const [schemas, setSchemas] = useState({});
  const [expanded, setExpanded] = useState({});
  const [expandedDbs, setExpandedDbs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSchema();
  }, []);

  const loadSchema = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSchema();
      if (res.data.success) {
        if (res.data.schemas) {
          setSchemas(res.data.schemas);
          // Expand all databases by default
          const dbExpanded = {};
          Object.keys(res.data.schemas).forEach(id => { dbExpanded[id] = true; });
          setExpandedDbs(dbExpanded);
        } else if (res.data.tables) {
          // Backward compat: single connection
          setSchemas({ _single: { label: 'Database', database: '', tables: res.data.tables } });
          setExpandedDbs({ _single: true });
        }
      }
    } catch (err) {
      setError('Failed to load schema');
    } finally {
      setLoading(false);
    }
  };

  const toggleDb = (dbId) => {
    setExpandedDbs(prev => ({ ...prev, [dbId]: !prev[dbId] }));
  };

  const toggleTable = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getKeyIcon = (col) => {
    if (col.Key === 'PRI') return '🔑';
    if (col.Key === 'MUL') return '🔗';
    if (col.Key === 'UNI') return '⚡';
    return '';
  };

  const totalTables = Object.values(schemas).reduce(
    (sum, db) => sum + Object.keys(db.tables || {}).length, 0
  );

  if (loading) return (
    <div className="flex items-center justify-center h-32 text-gray-400">
      <div className="text-center">
        <div className="animate-spin text-2xl mb-2">⚙️</div>
        <div className="text-sm">Loading schema...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="text-red-400 text-sm p-3">{error}</div>
  );

  const dbEntries = Object.entries(schemas);
  const multiDb = dbEntries.length > 1;

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Tables ({totalTables})
        </span>
        <button onClick={loadSchema} className="text-gray-400 hover:text-white text-xs">
          ↻
        </button>
      </div>

      {dbEntries.map(([dbId, dbInfo]) => (
        <div key={dbId} className="mb-2">
          {multiDb && (
            <button
              onClick={() => toggleDb(dbId)}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-700 rounded-lg transition-colors text-left"
            >
              <span className="text-blue-400 text-xs">{expandedDbs[dbId] ? '▼' : '▶'}</span>
              <span className="text-xs font-semibold text-blue-300 flex-1 truncate">🗄️ {dbInfo.label}</span>
              <span className="text-xs text-gray-500">{Object.keys(dbInfo.tables || {}).length}</span>
            </button>
          )}

          {(expandedDbs[dbId] || !multiDb) && Object.entries(dbInfo.tables || {}).map(([table, columns]) => {
            const tableKey = `${dbId}::${table}`;
            return (
              <div key={tableKey} className={multiDb ? 'ml-2' : ''}>
                <button
                  onClick={() => toggleTable(tableKey)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors text-left group"
                >
                  <span className="text-yellow-400 text-sm">{expanded[tableKey] ? '▼' : '▶'}</span>
                  <span className="text-sm text-white font-medium flex-1">📋 {table}</span>
                  <span className="text-xs text-gray-500 group-hover:text-gray-300">{columns.length}</span>
                </button>

                {expanded[tableKey] && (
                  <div className={`mt-1 space-y-0.5 ${multiDb ? 'ml-6' : 'ml-4'}`}>
                    {columns.map(col => (
                      <div
                        key={col.Field}
                        className="flex items-center gap-2 px-3 py-1.5 rounded text-xs hover:bg-gray-700 cursor-pointer"
                        onClick={() => onTableSelect && onTableSelect(table, col.Field)}
                      >
                        <span className="text-gray-500 w-4">{getKeyIcon(col)}</span>
                        <span className="text-gray-300 flex-1 font-mono">{col.Field}</span>
                        <span className="text-blue-400 text-xs truncate max-w-[70px]">{col.Type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SchemaExplorer;
