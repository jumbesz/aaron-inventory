import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getEszkozok()
      .then((eszkozok) => {
        const osszes = eszkozok.length
        const kiadott = eszkozok.filter((e) => e.kolcsonzesek?.length > 0).length
        setStats({ osszes, szabad: osszes - kiadott, kiadott })
      })
      .catch((e) => setError(e.message))
  }, [])

  const cards = [
    { label: 'Összes eszköz', value: stats?.osszes ?? '—' },
    { label: 'Szabad', value: stats?.szabad ?? '—' },
    { label: 'Kiadott', value: stats?.kiadott ?? '—' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-3xl font-semibold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
