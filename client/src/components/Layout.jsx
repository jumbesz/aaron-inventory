import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Wrench, Users, LogOut, Dumbbell, History, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function SidebarContent({ isAdmin, username, onNav, onLogout }) {
  const navItem = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-500/15 text-emerald-400'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`

  return (
    <>
      {/* Logo */}
      <Link to="/" onClick={onNav} className="flex items-center gap-3 px-5 py-5 border-b border-white/10 group">
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
        <NavLink to="/" end className={navItem} onClick={onNav}>
          <LayoutDashboard size={17} />
          Dashboard
        </NavLink>
        <NavLink to="/eszkozok" className={navItem} onClick={onNav}>
          <Wrench size={17} />
          Eszközök
        </NavLink>
        <NavLink to="/tortenet" className={navItem} onClick={onNav}>
          <History size={17} />
          Történet
        </NavLink>
        {isAdmin && (
          <NavLink to="/felhasznalok" className={navItem} onClick={onNav}>
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
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors"
        >
          <LogOut size={17} />
          Kijelentkezés
        </button>
      </div>
    </>
  )
}

export default function Layout() {
  const { logout, isAdmin, username } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">

      {/* ── Mobile top bar ── */}
      <header className="flex md:hidden items-center gap-3 px-4 py-3 bg-gray-900 border-b border-white/10 shrink-0">
        <button onClick={() => setOpen(true)} className="text-gray-400 hover:text-white transition-colors p-1">
          <Menu size={22} />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
            <Dumbbell size={13} className="text-white" />
          </div>
          <span className="text-white font-semibold text-sm">Aaron Inventory</span>
        </Link>
      </header>

      {/* ── Mobile overlay backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 flex flex-col
          transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:w-60 md:shrink-0
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-white md:hidden"
        >
          <X size={20} />
        </button>

        <SidebarContent
          isAdmin={isAdmin}
          username={username}
          onNav={() => setOpen(false)}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
