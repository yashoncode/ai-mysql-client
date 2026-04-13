import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const setDbToken = (token) => {
  if (token) {
    api.defaults.headers.common['X-DB-Token'] = token;
    localStorage.setItem('dbToken', token);
  } else {
    delete api.defaults.headers.common['X-DB-Token'];
    delete api.defaults.headers.common['X-DB-Active'];
    localStorage.removeItem('dbToken');
    localStorage.removeItem('connections');
    localStorage.removeItem('activeConnection');
  }
};

export const setActiveConnection = (connectionId) => {
  if (connectionId) {
    api.defaults.headers.common['X-DB-Active'] = connectionId;
    localStorage.setItem('activeConnection', connectionId);
  } else {
    delete api.defaults.headers.common['X-DB-Active'];
    localStorage.removeItem('activeConnection');
  }
};

export const saveConnections = (connections) => {
  localStorage.setItem('connections', JSON.stringify(connections));
};

export const loadSession = () => {
  const token = localStorage.getItem('dbToken');
  const connections = localStorage.getItem('connections');
  const activeConnection = localStorage.getItem('activeConnection');
  if (token && connections) {
    api.defaults.headers.common['X-DB-Token'] = token;
    if (activeConnection) {
      api.defaults.headers.common['X-DB-Active'] = activeConnection;
    }
    return {
      connections: JSON.parse(connections),
      activeConnection,
    };
  }
  return null;
};

export const connectDB = (credentials) => api.post('/connect', credentials);
export const disconnectDB = (connectionId) => api.post('/disconnect', { connection_id: connectionId });
export const getSchema = () => api.get('/schema');
export const executeQuery = (sql) => api.post('/query', { sql });
export const generateSQL = (question) => api.post('/ai/generate-sql', { question });
export const analyzeResults = (query, results) => api.post('/ai/analyze', { query, results });
export const chatWithAI = (message, history) => api.post('/ai/chat', { message, history });

export default api;
