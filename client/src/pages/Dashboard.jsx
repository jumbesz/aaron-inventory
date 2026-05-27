import { useEffect, useState } from 'react'
import { Package, CheckCircle, ArrowUpRight } from 'lucide-react'
import { api } from '../lib/api'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('hu-HU', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

const CARDS = [
  { key: 'osszes', label: 'Összes eszköz', icon: Package, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
  { key: 'szabad', label: 'Szabad', icon: CheckCircle, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  { key: 'kiadott', label: 'Kiadott', icon: ArrowUpRight, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
]

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
  const values = { osszes: osszes ?? '—', szabad: szabad ?? '—', kiadott: osszes === null ? '—' : kiadottak.length }

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6">Dashboard</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        {CARDS.map(({ key, label, icon: Icon, iconBg, iconColor }) => (
          <div key={key} className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 flex items-center gap-4">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
              <Icon size={20} className={iconColor} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-0.5">{label}</p>
              <p className="text-2xl md:text-3xl font-semibold text-gray-800">{values[key]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Kiadott eszközök */}
      {kiadottak.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Jelenleg kiadott eszközök
          </h2>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-400 text-xs uppercase tracking-wide">
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
                    <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{e.nev}</td>
                      <td className="px-5 py-3 text-gray-400">{e.cikkszam || '—'}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold flex items-center justify-center uppercase">{k.felhasznalo_nev[0]}</span>
                          <span className="text-gray-700 font-medium">{k.felhasznalo_nev}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400">{formatDate(k.kiveve_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-2">
            {kiadottak.map((e) => {
              const k = e.kolcsonzesek[0]
              return (
                <div key={e.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-medium text-gray-800 text-sm">{e.nev}</p>
                    {e.cikkszam && <span className="text-xs text-gray-400 shrink-0">{e.cikkszam}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold flex items-center justify-center uppercase shrink-0">{k.felhasznalo_nev[0]}</span>
                    <span className="text-sm text-gray-700 font-medium">{k.felhasznalo_nev}</span>
                    <span className="text-gray-300 text-xs">·</span>
                    <span className="text-xs text-gray-400">{formatDate(k.kiveve_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
