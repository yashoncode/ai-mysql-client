import React, { useState } from 'react';
import { connectDB } from '../services/api';

const ConnectionForm = ({ onConnected, onCancel }) => {
  const [formData, setFormData] = useState({
    host: 'localhost',
    port: 3306,
    database: '',
    username: 'root',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testSuccess, setTestSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'port' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTestSuccess('');
    try {
      const res = await connectDB(formData);
      if (res.data.success) {
        onConnected(res.data);
      } else {
        setError(res.data.message || 'Connection failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Connection failed. Check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setError('');
    setTestSuccess('');
    try {
      const res = await connectDB(formData);
      if (res.data.success) {
        setTestSuccess(`Connected! MySQL ${res.data.version}`);
      } else {
        setError(res.data.message || 'Test failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Connection test failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-antares-bg border border-antares-border text-antares-text-bright rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-antares-accent transition-colors";
  const labelClass = "block text-2xs font-medium text-antares-text-dim mb-1 uppercase tracking-wider";

  const content = (
    <div className="bg-antares-surface rounded shadow-2xl w-full max-w-lg border border-antares-border">
      {/* Modal Header */}
      <div className="bg-antares-sidebar px-4 py-2.5 rounded-t border-b border-antares-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-antares-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
          </svg>
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            {onCancel ? 'New Connection' : 'Connect to Database'}
          </span>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-antares-text-dim hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-4">
        {error && (
          <div className="flex items-center gap-2 bg-antares-error/10 border border-antares-error/30 text-antares-error rounded px-3 py-2 mb-4 text-xs">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {testSuccess && (
          <div className="flex items-center gap-2 bg-antares-success/10 border border-antares-success/30 text-antares-success rounded px-3 py-2 mb-4 text-xs">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {testSuccess}
          </div>
        )}

        <div className="grid grid-cols-12 gap-x-4 gap-y-3">
          {/* Client */}
          <div className="col-span-5">
            <label className={labelClass}>Client</label>
            <div className="flex items-center gap-2 bg-antares-bg border border-antares-border rounded px-2.5 py-1.5 text-xs text-antares-text-dim">
              <svg className="w-3.5 h-3.5 text-[#00758F]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              MySQL / MariaDB
            </div>
          </div>

          {/* Host */}
          <div className="col-span-7">
            <label className={labelClass}>Host</label>
            <input type="text" name="host" value={formData.host} onChange={handleChange} className={inputClass} required />
          </div>

          {/* Port */}
          <div className="col-span-3">
            <label className={labelClass}>Port</label>
            <input type="number" name="port" value={formData.port} onChange={handleChange} className={inputClass} required />
          </div>

          {/* Database */}
          <div className="col-span-9">
            <label className={labelClass}>Database</label>
            <input type="text" name="database" value={formData.database} onChange={handleChange} className={inputClass} placeholder="schema_name" required />
          </div>

          {/* Username */}
          <div className="col-span-6">
            <label className={labelClass}>User</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className={inputClass} required />
          </div>

          {/* Password */}
          <div className="col-span-6">
            <label className={labelClass}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="••••••" />
          </div>
        </div>

        {/* Footer Actions - Antares style: Test | Save | Connect */}
        <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-antares-border">
          <button
            type="button"
            onClick={handleTest}
            disabled={loading || !formData.host || !formData.database}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-antares-border text-antares-text hover:bg-antares-hover hover:text-white disabled:opacity-40 transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-antares-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Test
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded text-xs font-medium border border-antares-border text-antares-text hover:bg-antares-hover hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !formData.host || !formData.database}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-medium bg-antares-success hover:brightness-110 text-white disabled:opacity-40 transition-all"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                Connect
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // If used as modal overlay, wrap with backdrop
  if (onCancel) {
    return (
      <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4" onClick={onCancel}>
        <div onClick={e => e.stopPropagation()}>
          {content}
        </div>
      </div>
    );
  }

  // First-time connection (no backdrop, centered in parent)
  return content;
};

export default ConnectionForm;
