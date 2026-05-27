import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Regisztráció</h1>
          <p className="text-sm text-gray-500 mt-1">Aaron Inventory</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Felhasználónév</label>
            <input
              type="text"
              value={felhasznalonev}
              onChange={(e) => setFelhasznalonev(e.target.value)}
              minLength={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jelszó</label>
            <input
              type="password"
              value={jelszo}
              onChange={(e) => setJelszo(e.target.value)}
              minLength={6}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="new-password"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Minimum 6 karakter</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jelszó megerősítése</label>
            <input
              type="password"
              value={jelszoMegint}
              onChange={(e) => setJelszoMegint(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="new-password"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Regisztráció...' : 'Regisztráció'}
          </button>
        </form>
        <p className="text-sm text-gray-500 text-center mt-4">
          Már van fiókod?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Bejelentkezés</Link>
        </p>
      </div>
    </div>
  )
}
