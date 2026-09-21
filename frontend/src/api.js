const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'tm_token';
const USER_KEY = 'tm_user';

// ---- session helpers (token is kept in localStorage)
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};
export const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  // Expired / invalid token on a protected call -> forget it and go to the login page
  if (response.status === 401 && token) {
    clearSession();
    window.location.assign('/login');
    throw new Error('Session expired. Please log in again.');
  }
  if (!response.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
}

// ---- auth
export const registerUser = (name, email, password) =>
  request('/auth/register', { method: 'POST', body: { name, email, password } });
export const loginUser = (email, password) =>
  request('/auth/login', { method: 'POST', body: { email, password } });

// ---- tasks
export const fetchTasks = () => request('/tasks');
export const createTask = (title, description) =>
  request('/tasks', { method: 'POST', body: { title, description } });
export const updateTask = (id, updates) =>
  request(`/tasks/${id}`, { method: 'PUT', body: updates });
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });

// ---- Practical 13 (AI)
export const generateDescription = (title) =>
  request('/api/ai/generate-description', { method: 'POST', body: { title } });
