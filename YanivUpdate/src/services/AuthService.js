/*
 * AuthService.js
 * ------------------------------------------------------------------
 * Front-side translator to the auth API. Components call these functions
 * with plain values/objects; this file turns them into HTTP requests and
 * returns plain objects. It is the ONLY place on the front that knows
 * about fetch / URLs for auth. Every function is async (returns a Promise).
 * ------------------------------------------------------------------
 */

// Base URL of the Express API. CORS on the server lets the browser call this
// different origin directly (no Vite proxy). In production this would change.
const API_BASE = 'http://localhost:5000/api';

/*
 * Small helper: POST a JSON body, parse the reply, and throw a readable
 * Error on failure. Distinguishes "server unreachable" from "server said no".
 */
async function postJson(url, body) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Cannot reach the server. Is it running?');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }
  return data;
}

// Create a new parent account. Resolves to the created parent (no password).
export function register({ email, password, firstName, lastName }) {
  return postJson(`${API_BASE}/auth/register`, { email, password, firstName, lastName });
}

// Log in. Resolves to the parent (with profiles) or throws on bad credentials.
export function login(email, password) {
  return postJson(`${API_BASE}/auth/login`, { email, password });
}

// Fetch a fresh parent by id — used to restore the session after a refresh.
export async function getParent(id) {
  let response;
  try {
    response = await fetch(`${API_BASE}/parents/${id}`);
  } catch {
    throw new Error('Cannot reach the server. Is it running?');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Could not load parent.');
  }
  return data;
}
