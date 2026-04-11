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
  } else {
    delete api.defaults.headers.common['X-DB-Token'];
  }
};

export const connectDB = (credentials) => api.post('/connect', credentials);
export const getSchema = () => api.get('/schema');
export const executeQuery = (sql) => api.post('/query', { sql });
export const generateSQL = (question) => api.post('/ai/generate-sql', { question });
export const analyzeResults = (query, results) => api.post('/ai/analyze', { query, results });
export const chatWithAI = (message, history) => api.post('/ai/chat', { message, history });

export default api;
