import React, { useState, useEffect } from 'react';
import { getSchema } from '../services/api';

const SchemaExplorer = ({ onTableSelect }) => {
  const [schema, setSchema] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSchema();
  }, []);

  const loadSchema = async () => {
    try {
      const res = await getSchema();
      if (res.data.success) {
        setSchema(res.data.tables);
        // Expand first table by default
        const firstTable = Object.keys(res.data.tables)[0];
        if (firstTable) setExpanded({ [firstTable]: true });
      }
    } catch (err) {
      setError('Failed to load schema');
    } finally {
      setLoading(false);
    }
  };

  const toggleTable = (table) => {
    setExpanded(prev => ({ ...prev, [table]: !prev[table] }));
  };

  const getKeyIcon = (col) => {
    if (col.Key === 'PRI') return '🔑';
    if (col.Key === 'MUL') return '🔗';
    if (col.Key === 'UNI') return '⚡';
    return '';
  };

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

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Tables ({Object.keys(schema).length})
        </span>
        <button onClick={loadSchema} className="text-gray-400 hover:text-white text-xs">
          ↻
        </button>
      </div>

      {Object.entries(schema).map(([table, columns]) => (
        <div key={table} className="mb-1">
          <button
            onClick={() => toggleTable(table)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors text-left group"
          >
            <span className="text-yellow-400 text-sm">{expanded[table] ? '▼' : '▶'}</span>
            <span className="text-sm text-white font-medium flex-1">📋 {table}</span>
            <span className="text-xs text-gray-500 group-hover:text-gray-300">{columns.length}</span>
          </button>

          {expanded[table] && (
            <div className="ml-4 mt-1 space-y-0.5">
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
      ))}
    </div>
  );
};

export default SchemaExplorer;
