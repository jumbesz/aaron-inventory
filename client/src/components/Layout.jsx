import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Wrench, Users, LogOut, Dumbbell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { logout, isAdmin, username } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navItem = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-500/15 text-emerald-400'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-60 bg-gray-900 flex flex-col">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 px-5 py-5 border-b border-white/10 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 group-hover:bg-emerald-400 transition-colors">
            <Dumbbell size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Aaron Inventory</p>
            <p className="text-emerald-500 text-xs font-medium">Nutriversum</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          <NavLink to="/" end className={navItem}>
            <LayoutDashboard size={17} />
            Dashboard
          </NavLink>
          <NavLink to="/eszkozok" className={navItem}>
            <Wrench size={17} />
            Eszközök
          </NavLink>
          {isAdmin && (
            <NavLink to="/felhasznalok" className={navItem}>
              <Users size={17} />
              Felhasználók
            </NavLink>
          )}
        </nav>

        {/* User + logout */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <span className="text-emerald-400 text-xs font-bold uppercase">{username?.[0]}</span>
            </div>
            <span className="text-gray-300 text-sm font-medium truncate">{username}</span>
            {isAdmin && (
              <span className="ml-auto text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                Admin
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors"
          >
            <LogOut size={17} />
            Kijelentkezés
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <Outlet />
      </main>
    </div>
  )
}
