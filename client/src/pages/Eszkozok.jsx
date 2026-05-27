import { useEffect, useState } from 'react'
import { Plus, X, LogIn, LogOut } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('hu-HU', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Megerősítő modal ──────────────────────────────────────────────────────────

function ConfirmModal({ title, children, confirmLabel, confirmClass, onConfirm, onClose, loading, error }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 disabled:opacity-40">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
        <div className="flex justify-end gap-2 px-6 pb-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            Mégse
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors ${confirmClass}`}
          >
            {loading ? 'Folyamatban...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Kiveszem modal ────────────────────────────────────────────────────────────

function KiveszemModal({ eszkoz, username, onClose, onDone }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleConfirm = async () => {
    setError(null)
    setLoading(true)
    try {
      await api.kiveszem(eszkoz.id, username)
      onDone()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <ConfirmModal
      title="Eszköz kivétele"
      confirmLabel="Kiveszem"
      confirmClass="bg-blue-600 hover:bg-blue-700"
      onConfirm={handleConfirm}
      onClose={onClose}
      loading={loading}
      error={error}
    >
      <p className="text-sm text-gray-600 mb-4">Az alábbi eszköz a te nevedre lesz rögzítve:</p>
      <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex flex-col gap-1">
        <p className="font-medium text-gray-800">{eszkoz.nev}</p>
        {eszkoz.cikkszam && <p className="text-xs text-gray-500">{eszkoz.cikkszam}</p>}
      </div>
    </ConfirmModal>
  )
}

// ── Visszahozom modal ─────────────────────────────────────────────────────────

function VissszaModal({ eszkoz, onClose, onDone }) {
  const kolcsonzes = eszkoz.kolcsonzesek[0]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleConfirm = async () => {
    setError(null)
    setLoading(true)
    try {
      await api.visszahozom(kolcsonzes.id)
      onDone()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <ConfirmModal
      title="Eszköz visszahozása"
      confirmLabel="Visszahozom"
      confirmClass="bg-gray-700 hover:bg-gray-800"
      onConfirm={handleConfirm}
      onClose={onClose}
      loading={loading}
      error={error}
    >
      <p className="text-sm text-gray-600 mb-4">Visszahozottként rögzíted az alábbi eszközt:</p>
      <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex flex-col gap-1">
        <p className="font-medium text-gray-800">{eszkoz.nev}</p>
        {eszkoz.cikkszam && <p className="text-xs text-gray-500">{eszkoz.cikkszam}</p>}
      </div>
    </ConfirmModal>
  )
}

// ── Új eszköz modal ───────────────────────────────────────────────────────────

function UjEszkozModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ nev: '', cikkszam: '', kiszerelesek: '', megjegyzes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.addEszkoz(form)
      onSaved()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Új eszköz</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Név *</label>
            <input
              value={form.nev}
              onChange={set('nev')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cikkszám</label>
            <input
              value={form.cikkszam}
              onChange={set('cikkszam')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kiszerelés</label>
            <input
              value={form.kiszerelesek}
              onChange={set('kiszerelesek')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Megjegyzés</label>
            <textarea
              value={form.megjegyzes}
              onChange={set('megjegyzes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex justify-end gap-2 mt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              Mégse
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Mentés...' : 'Mentés'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Főkomponens ───────────────────────────────────────────────────────────────

export default function Eszkozok() {
  const { username, isAdmin } = useAuth()
  const [eszkozok, setEszkozok] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  const [ujModal, setUjModal] = useState(false)
  const [kiveszemEszkoz, setKiveszemEszkoz] = useState(null)
  const [visszaEszkoz, setVissszaEszkoz] = useState(null)

  const refresh = () => setTick((t) => t + 1)

  useEffect(() => {
    api.getEszkozok()
      .then(setEszkozok)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [tick])

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Eszközök</h1>
        {isAdmin && (
          <button
            onClick={() => setUjModal(true)}
            className="flex items-center gap-2 px-3 py-2 md:px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Új eszköz</span>
            <span className="sm:hidden">Új</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <p className="p-6 text-sm text-gray-400">Betöltés...</p>
      ) : eszkozok.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-400">Nincsenek eszközök.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
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
                  const visszaJogosult = aktiv && (isAdmin || aktiv.felhasznalo_nev === username)
                  return (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{e.nev}</td>
                      <td className="px-5 py-3 text-gray-500">{e.cikkszam || '—'}</td>
                      <td className="px-5 py-3">
                        {aktiv ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Kiadott</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Szabad</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {aktiv ? (
                          <span><span className="font-medium text-gray-700">{aktiv.felhasznalo_nev}</span><span className="text-gray-400"> · </span>{formatDate(aktiv.kiveve_at)}</span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {aktiv ? (
                          visszaJogosult && (
                            <button onClick={() => setVissszaEszkoz(e)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                              Visszahozom
                            </button>
                          )
                        ) : (
                          <button onClick={() => setKiveszemEszkoz(e)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                            Kiveszem
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-2">
            {eszkozok.map((e) => {
              const aktiv = e.kolcsonzesek?.[0]
              const visszaJogosult = aktiv && (isAdmin || aktiv.felhasznalo_nev === username)
              return (
                <div key={e.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{e.nev}</p>
                      {e.cikkszam && <p className="text-xs text-gray-400 mt-0.5">{e.cikkszam}</p>}
                    </div>
                    {aktiv ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 shrink-0">Kiadott</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 shrink-0">Szabad</span>
                    )}
                  </div>
                  {aktiv && (
                    <p className="text-xs text-gray-500 mb-3">
                      <span className="font-medium text-gray-700">{aktiv.felhasznalo_nev}</span>
                      <span className="text-gray-400"> · </span>
                      {formatDate(aktiv.kiveve_at)}
                    </p>
                  )}
                  <div className="flex justify-end">
                    {aktiv ? (
                      visszaJogosult && (
                        <button onClick={() => setVissszaEszkoz(e)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                          Visszahozom
                        </button>
                      )
                    ) : (
                      <button onClick={() => setKiveszemEszkoz(e)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                        Kiveszem
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {ujModal && (
        <UjEszkozModal onClose={() => setUjModal(false)} onSaved={() => { setUjModal(false); refresh() }} />
      )}
      {kiveszemEszkoz && (
        <KiveszemModal
          eszkoz={kiveszemEszkoz}
          username={username}
          onClose={() => setKiveszemEszkoz(null)}
          onDone={() => { setKiveszemEszkoz(null); refresh() }}
        />
      )}
      {visszaEszkoz && (
        <VissszaModal
          eszkoz={visszaEszkoz}
          onClose={() => setVissszaEszkoz(null)}
          onDone={() => { setVissszaEszkoz(null); refresh() }}
        />
      )}
    </div>
  )
}
