// src/utils/api.js
const BASE = import.meta.env.VITE_API_URL || '/api';

export async function checkHealth() {
  const r = await fetch(`${BASE}/health`);
  return r.json();
}

export async function getMetrics() {
  const r = await fetch(`${BASE}/metrics`);
  return r.json();
}

export async function predictEmail(subject, body) {
  const r = await fetch(`${BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, body }),
  });
  return r.json();
}

export async function getExamples() {
  const r = await fetch(`${BASE}/examples`);
  return r.json();
}

export async function analyzeBulk(emails) {
  const r = await fetch(`${BASE}/analyze-bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails }),
  });
  return r.json();
}
