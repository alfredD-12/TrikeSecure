const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function parseResponse(res) {
  const data = await res.json().catch(() => ({ message: 'Unexpected server response.' }));
  if (!res.ok) {
    return { message: data?.message || 'Request failed.' };
  }
  return data;
}

export async function register(fullName, username, email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ fullName, username, email, password }),
  });
  return parseResponse(res);
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  return parseResponse(res);
}

export async function logout() {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return parseResponse(res);
}

export async function getMe() {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });
  return parseResponse(res);
}
