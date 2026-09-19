export const login = async (email: string, password: string) => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!resp.ok) throw new Error('Login failed');
  return resp.json();
};

export const register = async (name: string, email: string, password: string) => {
  const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password }),
  });
  if (!resp.ok) throw new Error('Registration failed');
  return resp.json();
};

export const githubLogin = () => {
  // Redirect browser to backend GitHub OAuth start endpoint
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
};
