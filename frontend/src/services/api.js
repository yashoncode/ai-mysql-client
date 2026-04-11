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
    localStorage.removeItem('dbToken');
    localStorage.removeItem('connectionInfo');
  }
};

export const saveConnectionInfo = (info) => {
  localStorage.setItem('connectionInfo', JSON.stringify(info));
};

export const loadSession = () => {
  const token = localStorage.getItem('dbToken');
  const info = localStorage.getItem('connectionInfo');
  if (token && info) {
    api.defaults.headers.common['X-DB-Token'] = token;
    return JSON.parse(info);
  }
  return null;
};

export const connectDB = (credentials) => api.post('/connect', credentials);
export const getSchema = () => api.get('/schema');
export const executeQuery = (sql) => api.post('/query', { sql });
export const generateSQL = (question) => api.post('/ai/generate-sql', { question });
export const analyzeResults = (query, results) => api.post('/ai/analyze', { query, results });
export const chatWithAI = (message, history) => api.post('/ai/chat', { message, history });

export default api;
