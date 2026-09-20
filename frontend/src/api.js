// One shared base URL for the whole app (change it in frontend/.env, not in the code)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Every API call goes through this one helper: same error handling everywhere
async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // The backend sends { error, message }: prefer the detailed message
    throw new Error(data.message || data.error || 'Request failed');
  }
  return data;
}

export const fetchTasks = () => request('/tasks');
export const createTask = (title, description) =>
  request('/tasks', { method: 'POST', body: { title, description } });
export const updateTask = (id, updates) =>
  request(`/tasks/${id}`, { method: 'PUT', body: updates });
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });
