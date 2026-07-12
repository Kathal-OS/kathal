import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Containers from './pages/Containers'
import Images from './pages/Images'
import Settings from './pages/Settings'

const nav = [
  { to: '/',         icon: '📊', label: 'Dashboard' },
  { to: '/containers', icon: '🐳', label: 'Containers' },
  { to: '/images',    icon: '📦', label: 'Images' },
  { to: '/settings',  icon: '⚙️',  label: 'Settings' },
]

export default function App() {
  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🍈</span>
            <span className="bg-gradient-to-r from-kathal-400 to-kathal-600 bg-clip-text text-transparent">
              KATHAL
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Portable OS Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-kathal-600/20 text-kathal-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-600">KATHAL v0.1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/containers" element={<Containers />} />
          <Route path="/images" element={<Images />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
