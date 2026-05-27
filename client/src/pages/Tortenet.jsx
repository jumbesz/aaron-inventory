import { useEffect, useState } from 'react'
import { PackagePlus, LogOut, LogIn } from 'lucide-react'
import { api } from '../lib/api'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('hu-HU', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

const MUVELET = {
  KIVEVE: {
    label: 'Kivéve', icon: LogOut,
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  VISSZAHOZVA: {
    label: 'Visszahozva', icon: LogIn,
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  INSERT: {
    label: 'Új eszköz', icon: PackagePlus,
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
}

const PAGE_SIZE = 50

export default function Tortenet() {
  const [rows, setRows] = useState([])
  const [count, setCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    setLoading(true)
    api.getTortenet(PAGE_SIZE, offset)
      .then(({ data, count }) => { setRows(data); setCount(count) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [offset])

  const totalPages = count !== null ? Math.ceil(count / PAGE_SIZE) : null
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  const Pagination = () => totalPages > 1 ? (
    <div className="flex items-center justify-between px-4 md:px-5 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-400">{currentPage}. oldal / {totalPages}</p>
      <div className="flex gap-2">
        <button onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))} disabled={offset === 0}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
          Előző
        </button>
        <button onClick={() => setOffset((o) => o + PAGE_SIZE)} disabled={offset + PAGE_SIZE >= count}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
          Következő
        </button>
      </div>
    </div>
  ) : null

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Történet</h1>
        {count !== null && (
          <span className="text-sm text-gray-400">{count} esemény</span>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-400">Betöltés...</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">Nincs még esemény.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-400 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3">Esemény</th>
                    <th className="px-5 py-3">Eszköz</th>
                    <th className="px-5 py-3">Felhasználó</th>
                    <th className="px-5 py-3">Időpont</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const m = MUVELET[r.muvelet] ?? { label: r.muvelet, icon: PackagePlus, badge: 'bg-gray-50 text-gray-600 border-gray-200' }
                    const Icon = m.icon
                    return (
                      <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${m.badge}`}>
                            <Icon size={11} />{m.label}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-800">{r.eszkozok?.nev ?? '—'}</p>
                          {r.eszkozok?.cikkszam && <p className="text-xs text-gray-400">{r.eszkozok.cikkszam}</p>}
                        </td>
                        <td className="px-5 py-3">
                          {r.felhasznalo_nev ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold flex items-center justify-center uppercase shrink-0">{r.felhasznalo_nev[0]}</span>
                              <span className="text-gray-700">{r.felhasznalo_nev}</span>
                            </span>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-5 py-3 text-gray-400 tabular-nums">{formatDate(r.tortent_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {rows.map((r) => {
                const m = MUVELET[r.muvelet] ?? { label: r.muvelet, icon: PackagePlus, badge: 'bg-gray-50 text-gray-600 border-gray-200' }
                const Icon = m.icon
                return (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${m.badge}`}>
                        <Icon size={10} />{m.label}
                      </span>
                      <span className="text-xs text-gray-400 tabular-nums">{formatDate(r.tortent_at)}</span>
                    </div>
                    <p className="font-medium text-gray-800 text-sm">{r.eszkozok?.nev ?? '—'}</p>
                    {r.felhasznalo_nev && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 text-[9px] font-bold flex items-center justify-center uppercase shrink-0">{r.felhasznalo_nev[0]}</span>
                        <span className="text-xs text-gray-500">{r.felhasznalo_nev}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <Pagination />
          </>
        )}
      </div>
    </div>
  )
}
