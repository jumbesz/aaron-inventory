import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('hu-HU', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

const SZEREPKOR_LABEL = {
  admin: { label: 'Admin', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  felhasznalo: { label: 'Felhasználó', cls: 'bg-gray-50 text-gray-600 border-gray-200' },
}

export default function Felhasznalok() {
  const { isAdmin } = useAuth()
  const [felhasznalok, setFelhasznalok] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isAdmin) return
    api.getFelhasznalok()
      .then(setFelhasznalok)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Felhasználók</h1>
        <p className="text-sm text-gray-500">Ehhez az oldalhoz nincs jogosultságod.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Felhasználók</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-400">Betöltés...</p>
        ) : felhasznalok.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">Nincsenek felhasználók.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3">Felhasználónév</th>
                <th className="px-5 py-3">Szerepkör</th>
                <th className="px-5 py-3">Regisztrálva</th>
              </tr>
            </thead>
            <tbody>
              {felhasznalok.map((f) => {
                const r = SZEREPKOR_LABEL[f.szerepkor] ?? SZEREPKOR_LABEL.felhasznalo
                return (
                  <tr key={f.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{f.felhasznalonev}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${r.cls}`}>
                        {r.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(f.letrehozva_at)}</td>
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
