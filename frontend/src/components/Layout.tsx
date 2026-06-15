import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Home, BarChart3, PlusCircle, Tag, Wallet, LogOut, Sun, Moon } from 'lucide-react'
import './Layout.css'

function getInitialTheme() {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function Layout() {
  const [theme, setTheme] = useState(getInitialTheme)

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.dataset.theme = next
  }

  function logout() {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <h1 className="layout-title">MoneyTrack</h1>
        <div className="layout-header-actions">
          <button className="layout-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="layout-logout" onClick={logout} aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="layout-content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <NavLink to="/" end className="bottom-nav-link">
          <Home size={22} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/transactions" className="bottom-nav-link">
          <BarChart3 size={22} />
          <span>Transactions</span>
        </NavLink>
        <NavLink to="/transactions/new" className="bottom-nav-link bottom-nav-add">
          <PlusCircle size={28} />
        </NavLink>
        <NavLink to="/tags" className="bottom-nav-link">
          <Tag size={22} />
          <span>Tags</span>
        </NavLink>
        <NavLink to="/borrowings" className="bottom-nav-link">
          <Wallet size={22} />
          <span>Borrowings</span>
        </NavLink>
      </nav>
    </div>
  )
}
