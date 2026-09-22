import { API_BASE } from '../lib/apiBase';
export const login = async (email: string, password: string) => {

  const resp = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!resp.ok) throw new Error('Login failed');
  return resp.json();
};

export const register = async (name: string, email: string, password: string) => {
  const resp = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password }),
  });
  if (!resp.ok) throw new Error('Registration failed');
  return resp.json();
};

export const githubLogin = () => {
  // Redirect browser to backend GitHub OAuth start endpoint (via proxy)
  window.location.href = '/api/auth/github';
};
