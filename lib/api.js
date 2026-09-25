const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

export function getApiBase() {
  return API_BASE;
}

export function getBackendOrigin() {
  return API_BASE.replace(/\/api$/, '');
}

async function parseResponse(response) {
  let payload = null;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok) {
    const error = new Error(payload?.message || `Request gagal (${response.status})`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export async function apiFetch(path, options = {}) {
  const { token, body, headers, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  return parseResponse(response);
}

export async function apiUpload(path, formData, { token, method = 'POST' } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
    cache: 'no-store',
  });
  return parseResponse(response);
}

export async function apiDownload(path, { token, filename = 'download' } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });
  if (!response.ok) {
    let payload = null;
    try { payload = await response.json(); } catch {}
    throw new Error(payload?.message || `Gagal mengunduh file (${response.status})`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
