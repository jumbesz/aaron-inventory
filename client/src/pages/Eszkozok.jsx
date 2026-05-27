import { useEffect, useState } from 'react'
import { api } from '../lib/api'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('hu-HU', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Eszkozok() {
  const [eszkozok, setEszkozok] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  const refresh = () => setTick((t) => t + 1)

  useEffect(() => {
    api.getEszkozok()
      .then(setEszkozok)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [tick])

  const handleKiveszem = async (eszkoz) => {
    const nev = window.prompt(`Kinek veszed ki: ${eszkoz.nev}?`)
    if (!nev?.trim()) return
    try {
      await api.kiveszem(eszkoz.id, nev.trim())
      refresh()
    } catch (e) {
      alert(e.message)
    }
  }

  const handleVissza = async (eszkoz) => {
    const kolcsonzes = eszkoz.kolcsonzesek?.[0]
    if (!kolcsonzes) return
    const ok = window.confirm(`Visszahozta ${kolcsonzes.felhasznalo_nev}: ${eszkoz.nev}?`)
    if (!ok) return
    try {
      await api.visszahozom(kolcsonzes.id)
      refresh()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Eszközök</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-400">Betöltés...</p>
        ) : eszkozok.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">Nincsenek eszközök.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Eszköz</th>
                <th className="px-5 py-3">Cikkszám</th>
                <th className="px-5 py-3">Állapot</th>
                <th className="px-5 py-3">Kinél / Mióta</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {eszkozok.map((e) => {
                const aktiv = e.kolcsonzesek?.[0]
                return (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{e.nev}</td>
                    <td className="px-5 py-3 text-gray-500">{e.cikkszam || '—'}</td>
                    <td className="px-5 py-3">
                      {aktiv ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Kiadott
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Szabad
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {aktiv ? (
                        <span>
                          <span className="font-medium text-gray-700">{aktiv.felhasznalo_nev}</span>
                          <span className="text-gray-400"> · </span>
                          {formatDate(aktiv.kiveve_at)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {aktiv ? (
                        <button
                          onClick={() => handleVissza(e)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          Visszahozom
                        </button>
                      ) : (
                        <button
                          onClick={() => handleKiveszem(e)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          Kiveszem
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
