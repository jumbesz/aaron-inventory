import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function parseToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'))

  const payload = token ? parseToken(token) : null
  const username = payload?.sub ?? null
  const szerepkor = payload?.szerepkor ?? null
  const isAdmin = szerepkor === 'admin'

  const login = (t) => {
    localStorage.setItem('auth_token', t)
    setToken(t)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token, username, szerepkor, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
