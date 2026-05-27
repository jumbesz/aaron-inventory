import { useEffect, useState } from 'react'
import { api } from '../lib/api'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('hu-HU', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Dashboard() {
  const [eszkozok, setEszkozok] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getEszkozok()
      .then(setEszkozok)
      .catch((e) => setError(e.message))
  }, [])

  const osszes = eszkozok?.length ?? null
  const kiadottak = eszkozok?.filter((e) => e.kolcsonzesek?.length > 0) ?? []
  const szabad = osszes !== null ? osszes - kiadottak.length : null

  const cards = [
    { label: 'Összes eszköz', value: osszes ?? '—' },
    { label: 'Szabad', value: szabad ?? '—' },
    { label: 'Kiadott', value: kiadottak.length || (osszes === null ? '—' : 0) },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-3xl font-semibold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      {kiadottak.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Jelenleg kiadott eszközök
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3">Eszköz</th>
                  <th className="px-5 py-3">Cikkszám</th>
                  <th className="px-5 py-3">Kinél</th>
                  <th className="px-5 py-3">Kivéve</th>
                </tr>
              </thead>
              <tbody>
                {kiadottak.map((e) => {
                  const k = e.kolcsonzesek[0]
                  return (
                    <tr key={e.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-5 py-3 font-medium text-gray-800">{e.nev}</td>
                      <td className="px-5 py-3 text-gray-500">{e.cikkszam || '—'}</td>
                      <td className="px-5 py-3 text-gray-700">{k.felhasznalo_nev}</td>
                      <td className="px-5 py-3 text-gray-500">{formatDate(k.kiveve_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
