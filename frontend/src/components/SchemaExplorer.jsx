import React, { useState, useEffect } from 'react';
import { getSchema } from '../services/api';

const SchemaExplorer = ({ onTableSelect }) => {
  const [schemas, setSchemas] = useState({});
  const [expanded, setExpanded] = useState({});
  const [expandedDbs, setExpandedDbs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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
          const dbExpanded = {};
          Object.keys(res.data.schemas).forEach(id => { dbExpanded[id] = true; });
          setExpandedDbs(dbExpanded);
        } else if (res.data.tables) {
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
    if (col.Key === 'PRI') return <span className="text-[goldenrod]" title="Primary Key">PK</span>;
    if (col.Key === 'MUL') return <span className="text-[chocolate]" title="Foreign Key">FK</span>;
    if (col.Key === 'UNI') return <span className="text-[deepskyblue]" title="Unique">UQ</span>;
    return null;
  };

  const getTypeColor = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('int') || t.includes('decimal') || t.includes('float') || t.includes('double')) return 'text-[cornflowerblue]';
    if (t.includes('varchar') || t.includes('text') || t.includes('char')) return 'text-[seagreen]';
    if (t.includes('date') || t.includes('time') || t.includes('year')) return 'text-[coral]';
    if (t.includes('blob') || t.includes('binary')) return 'text-[darkorchid]';
    if (t.includes('enum') || t.includes('set') || t.includes('bool')) return 'text-[goldenrod]';
    if (t.includes('json')) return 'text-[yellowgreen]';
    return 'text-antares-text-dim';
  };

  const totalTables = Object.values(schemas).reduce(
    (sum, db) => sum + Object.keys(db.tables || {}).length, 0
  );

  if (loading) return (
    <div className="flex items-center justify-center h-24 text-antares-text-dim">
      <div className="text-center text-2xs">
        <svg className="animate-spin w-5 h-5 mx-auto mb-2 text-antares-accent" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Loading schema...
      </div>
    </div>
  );

  if (error) return (
    <div className="text-antares-error text-2xs p-3">{error}</div>
  );

  const dbEntries = Object.entries(schemas);
  const multiDb = dbEntries.length > 1;

  // Filter tables by search
  const filterTables = (tables) => {
    if (!search) return Object.entries(tables);
    return Object.entries(tables).filter(([name]) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="px-2 pb-2">
        <div className="relative">
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-antares-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tables..."
            className="w-full bg-antares-bg border border-antares-border rounded text-2xs text-antares-text pl-7 pr-2 py-1 focus:outline-none focus:border-antares-accent"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto thin-scrollbar">
        {dbEntries.map(([dbId, dbInfo]) => {
          const filteredTables = filterTables(dbInfo.tables || {});

          return (
            <div key={dbId}>
              {/* Database Header */}
              {multiDb && (
                <button
                  onClick={() => toggleDb(dbId)}
                  className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-antares-hover transition-colors text-left group sticky top-0 z-10 bg-antares-sidebar"
                >
                  <svg className={`w-3 h-3 text-antares-text-dim transition-transform ${expandedDbs[dbId] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  <svg className="w-3.5 h-3.5 text-antares-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                  </svg>
                  <span className="text-2xs font-medium text-antares-text truncate flex-1">{dbInfo.label}</span>
                  <span className="text-2xs text-antares-text-dim opacity-0 group-hover:opacity-100">{Object.keys(dbInfo.tables || {}).length}</span>
                </button>
              )}

              {/* Tables */}
              {(expandedDbs[dbId] || !multiDb) && filteredTables.map(([table, columns]) => {
                const tableKey = `${dbId}::${table}`;
                return (
                  <div key={tableKey}>
                    <button
                      onClick={() => toggleTable(tableKey)}
                      className={`w-full flex items-center gap-1.5 py-1 hover:bg-antares-hover transition-colors text-left group ${multiDb ? 'pl-6 pr-2' : 'px-2'}`}
                    >
                      <svg className={`w-2.5 h-2.5 text-antares-text-dim transition-transform flex-shrink-0 ${expanded[tableKey] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                      <svg className="w-3.5 h-3.5 text-antares-warning flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-12.75A1.125 1.125 0 014.5 4.5h15a1.125 1.125 0 011.125 1.125v12.75m-18 0h18M4.5 4.5h15" />
                      </svg>
                      <span className="text-2xs text-antares-text truncate flex-1 font-mono">{table}</span>
                      <span className="text-2xs text-antares-text-dim opacity-0 group-hover:opacity-100 flex-shrink-0">{columns.length}</span>
                    </button>

                    {expanded[tableKey] && (
                      <div className={multiDb ? 'ml-6' : 'ml-2'}>
                        {columns.map(col => (
                          <div
                            key={col.Field}
                            className="flex items-center gap-1.5 pl-5 pr-2 py-0.5 hover:bg-antares-hover cursor-pointer transition-colors"
                            onClick={() => onTableSelect && onTableSelect(table, col.Field)}
                          >
                            {getKeyIcon(col) ? (
                              <span className="text-2xs w-4 text-center font-bold flex-shrink-0">{getKeyIcon(col)}</span>
                            ) : (
                              <span className="w-4 flex-shrink-0" />
                            )}
                            <span className="text-2xs text-antares-text font-mono truncate flex-1">{col.Field}</span>
                            <span className={`text-2xs truncate max-w-[80px] flex-shrink-0 ${getTypeColor(col.Type)}`}>
                              {col.Type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {totalTables === 0 && !loading && (
          <div className="text-center text-2xs text-antares-text-dim py-4">No tables found</div>
        )}
      </div>
    </div>
  );
};

export default SchemaExplorer;
