import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Package, Tag, Building2, TrendingUp,
  Settings, LogOut, ShoppingBag, ArrowLeft, Menu,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useConfig } from '@/hooks/useConfig'
import LoginModal from '@/components/shared/LoginModal'

const NAV = [
  { to: 'dashboard',     label: 'Dashboard',    Icon: LayoutDashboard },
  { to: 'productos',     label: 'Productos',     Icon: Package },
  { to: 'categorias',    label: 'Categorías',    Icon: Tag },
  { to: 'companias',     label: 'Compañías',     Icon: Building2 },
  { to: 'ventas',        label: 'Ventas',        Icon: TrendingUp },
  { to: 'configuracion', label: 'Configuración', Icon: Settings },
]

export default function AdminLayout() {
  const { isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const { data: config = {} } = useConfig()
  const [showLogin,    setShowLogin]    = useState(false)
  const [sidebarOpen,  setSidebarOpen]  = useState(false)

  useEffect(() => {
    if (!isAdmin) setShowLogin(true)
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <LoginModal
        open={showLogin}
        onClose={() => { setShowLogin(false); navigate('/') }}
      />
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F8F6F2]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-gray-900 flex flex-col z-40
                         transition-transform duration-300 lg:translate-x-0
                         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">
                {config.nombre || 'Mi Tienda'}
              </p>
              <p className="text-gray-500 text-[11px] mt-0.5">Panel de Administración</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <button onClick={() => navigate('/')} className="admin-sidebar-link w-full">
            <ArrowLeft className="w-4 h-4" /> Ver tienda
          </button>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="admin-sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 lg:pl-60 min-h-screen flex flex-col">
        {/* Mobile topbar */}
        <div className="lg:hidden bg-gray-900 px-4 h-14 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif text-white text-base">
            {config.nombre || 'Admin'}
          </span>
        </div>

        <main className="flex-1 p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
