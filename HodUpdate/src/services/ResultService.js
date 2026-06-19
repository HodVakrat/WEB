/*
 * ResultService.js
 * ------------------------------------------------------------------
 * Front-side translator for quiz results: save a finished quiz and read
 * a profile's results. The only place on the front that knows the result
 * URLs. Every function is async (returns a Promise).
 * ------------------------------------------------------------------
 */
const API_BASE = 'http://localhost:5000/api';

async function request(url, options = {}) {
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

// Save a finished quiz. Resolves to { result, coins } (coins = new wallet balance).
export function saveQuizResult({ profileId, subject, level, score, total, questionLevels }) {
  return request(`${API_BASE}/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, subject, level, score, total, questionLevels }),
  });
}

// Get all results for a profile (newest first). Resolves to an array.
export function getResults(profileId) {
  return request(`${API_BASE}/results/${profileId}`);
}
