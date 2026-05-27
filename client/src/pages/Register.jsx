import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [felhasznalonev, setFelhasznalonev] = useState('')
  const [jelszo, setJelszo] = useState('')
  const [jelszoMegint, setJelszoMegint] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (jelszo !== jelszoMegint) {
      setError('A két jelszó nem egyezik')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { token } = await api.register(felhasznalonev, jelszo)
      login(token)
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
            <Dumbbell size={28} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Aaron Inventory</h1>
          <p className="text-emerald-500 text-sm font-medium mt-0.5">Nutriversum</p>
        </div>

        {/* Card */}
        <div className="bg-gray-800 rounded-2xl border border-white/10 p-7 shadow-xl">
          <h2 className="text-white font-semibold text-lg mb-5">Regisztráció</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Felhasználónév</label>
              <input
                type="text"
                value={felhasznalonev}
                onChange={(e) => setFelhasznalonev(e.target.value)}
                minLength={3}
                className="w-full px-3 py-2.5 bg-gray-900 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Jelszó</label>
              <input
                type="password"
                value={jelszo}
                onChange={(e) => setJelszo(e.target.value)}
                minLength={6}
                className="w-full px-3 py-2.5 bg-gray-900 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                autoComplete="new-password"
                required
              />
              <p className="text-xs text-gray-600 mt-1">Minimum 6 karakter</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Jelszó megerősítése</label>
              <input
                type="password"
                value={jelszoMegint}
                onChange={(e) => setJelszoMegint(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-900 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                autoComplete="new-password"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20"
            >
              {loading ? 'Regisztráció...' : 'Regisztráció'}
            </button>
          </form>
          <p className="text-sm text-gray-500 text-center mt-5">
            Már van fiókod?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Bejelentkezés
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
