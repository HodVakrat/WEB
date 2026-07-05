/*
 * ProfileService.js
 * ------------------------------------------------------------------
 * Front-side translator for profile management. Each function calls the
 * server and resolves to the UPDATED parent, so the caller can refresh
 * its state. The only place on the front that knows the profile URLs.
 * ------------------------------------------------------------------
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Shared helper: run a request, parse the reply, throw a readable error.
async function request(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error('Cannot reach the server. Is it running?');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }
  return data;
}

// Add a profile to a parent. Resolves to the updated parent.
export function addProfile(parentId, { name, avatar, birthday }) {
  return request(`${API_BASE}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parentId, name, avatar, birthday }),
  });
}

// Edit an existing profile. Resolves to the updated parent.
export function editProfile(profileId, { name, avatar, birthday }) {
  return request(`${API_BASE}/profiles/${profileId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, avatar, birthday }),
  });
}

// Delete a profile (cascades to its results on the server). Resolves to updated parent.
export function deleteProfile(profileId) {
  return request(`${API_BASE}/profiles/${profileId}`, { method: 'DELETE' });
}

/*
 * Buy an avatar for a profile. The server checks the wallet, deducts
 * the cost and saves the new avatar. Resolves to the updated parent.
 */
export function buyAvatar(profileId, { avatar, cost }) {
  return request(`${API_BASE}/profiles/${profileId}/avatar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ avatar, cost }),
  });
}