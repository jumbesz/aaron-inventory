const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api'

function getToken() {
  return localStorage.getItem('auth_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })

  if (res.status === 401) {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
    return
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Ismeretlen hiba')
  return data
}

export const api = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getEszkozok: () => request('/eszkozok'),
  addEszkoz: (body) => request('/eszkozok', { method: 'POST', body: JSON.stringify(body) }),
  kiveszem: (eszkoz_id, felhasznalo_nev) =>
    request('/kolcsonzesek', { method: 'POST', body: JSON.stringify({ eszkoz_id, felhasznalo_nev }) }),
  visszahozom: (kolcsonzes_id) =>
    request(`/kolcsonzesek/${kolcsonzes_id}/visszahozas`, { method: 'PATCH' }),
}
