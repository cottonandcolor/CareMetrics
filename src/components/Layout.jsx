import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
  LayoutDashboard, FlaskConical, Pill, HeartPulse,
  TrendingUp, Users, FileDown, LogOut, Menu, X, Activity,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scan', icon: FlaskConical, label: 'Lab Scanner' },
  { to: '/medications', icon: Pill, label: 'Medications' },
  { to: '/symptoms', icon: HeartPulse, label: 'Symptoms' },
  { to: '/trends', icon: TrendingUp, label: 'Trends' },
  { to: '/caregiver', icon: Users, label: 'Caregiver' },
  { to: '/export', icon: FileDown, label: 'Export' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-surface">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-primary-dark text-white
        flex flex-col transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <Activity className="w-8 h-8 text-accent-light" />
          <span className="text-xl font-bold tracking-tight">CareMetrics</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors
                ${isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-white/90 truncate">{user?.name}</p>
            <p className="text-xs text-white/50 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-alt"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Activity className="w-6 h-6 text-primary" />
          <span className="font-bold text-primary">CareMetrics</span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
