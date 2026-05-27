export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Összes eszköz', value: '—' },
          { label: 'Szabad', value: '—' },
          { label: 'Kiadott', value: '—' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-3xl font-semibold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}