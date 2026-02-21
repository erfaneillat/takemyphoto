import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import {
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Tag,
  Palette,
  Images,
  Users,
  Mail,
  AlertCircle,
  Store,
  ChevronDown,
  ChevronRight,
  FolderOpen
} from 'lucide-react'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [shopSubmenuOpen, setShopSubmenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/categories', icon: Tag, label: 'Categories' },
    { path: '/styles', icon: Palette, label: 'Styles' },
    { path: '/generated-images', icon: Images, label: 'Generated Images' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/contacts', icon: Mail, label: 'Contacts' },
    { path: '/error-logs', icon: AlertCircle, label: 'Error Logs' },
  ]

  const shopSubItems = [
    { path: '/shops', icon: Store, label: 'Shops' },
    { path: '/shops/categories', icon: FolderOpen, label: 'Categories' },
    { path: '/shops/samples', icon: Images, label: 'Sample Images' },
    { path: '/shops/styles', icon: Palette, label: 'Styles' },
    { path: '/shops/logos', icon: Images, label: 'Logos' },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname === path
  }

  const isShopSectionActive = () => {
    return location.pathname.startsWith('/shops')
  }

  // Auto-open submenu if a shop route is active
  const isShopOpen = shopSubmenuOpen || isShopSectionActive()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-20'
          } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
          {sidebarOpen && (
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Nero</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 text-gray-700 hover:text-black"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive(item.path)
                  ? 'bg-black text-white shadow-lg shadow-black/20'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }`}
              >
                <Icon size={22} className="transition-transform group-hover:scale-110" />
                {sidebarOpen && <span className="font-semibold text-[15px]">{item.label}</span>}
              </Link>
            )
          })}

          {/* Shop Section with Submenu */}
          <div>
            <button
              onClick={() => {
                if (sidebarOpen) {
                  setShopSubmenuOpen(!isShopOpen)
                } else {
                  navigate('/shops')
                }
              }}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group w-full ${isShopSectionActive() && !isShopOpen
                ? 'bg-black text-white shadow-lg shadow-black/20'
                : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                }`}
            >
              <Store size={22} className="transition-transform group-hover:scale-110" />
              {sidebarOpen && (
                <>
                  <span className="font-semibold text-[15px] flex-1 text-left">Shops</span>
                  {isShopOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </>
              )}
            </button>

            {/* Submenu */}
            {sidebarOpen && isShopOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-4">
                {shopSubItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm ${isActive(item.path)
                        ? 'bg-black text-white shadow-md shadow-black/20'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                        }`}
                    >
                      <Icon size={18} className="transition-transform group-hover:scale-110" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              logout()
              navigate('login')
            }}
            className="flex items-center gap-4 px-4 py-3.5 w-full rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut size={22} className="transition-transform group-hover:scale-110" />
            {sidebarOpen && <span className="font-semibold text-[15px]">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {(() => {
                const allItems = [...menuItems, ...shopSubItems]
                const active = allItems.find((item) => isActive(item.path))
                return active?.label || 'Dashboard'
              })()}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center text-white font-bold text-base shadow-lg cursor-pointer transition-transform hover:scale-105">
                A
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
