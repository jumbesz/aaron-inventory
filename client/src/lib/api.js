const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Ismeretlen hiba')
  return data
}

export const api = {
  getEszkozok: () => request('/eszkozok'),
  addEszkoz: (body) => request('/eszkozok', { method: 'POST', body: JSON.stringify(body) }),
  kiveszem: (eszkoz_id, felhasznalo_nev) =>
    request('/kolcsonzesek', { method: 'POST', body: JSON.stringify({ eszkoz_id, felhasznalo_nev }) }),
  visszahozom: (kolcsonzes_id) =>
    request(`/kolcsonzesek/${kolcsonzes_id}/visszahozas`, { method: 'PATCH' }),
}
