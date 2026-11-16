import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import type { UserRole } from '../types/api'

interface NavItem {
  to: string
  label: string
  roles?: UserRole[]
}

const navItems: NavItem[] = [
  { to: '/tickets', label: 'Tiket' },
  { to: '/kb', label: 'Knowledge Base' },
  { to: '/dashboard', label: 'Dashboard', roles: ['admin', 'agent'] },
]

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  agent: 'Agent',
  requester: 'Requester',
}

export function AppLayout() {
  const { user, logout } = useAuth()

  if (user === null) return null

  const items = navItems.filter((item) => item.roles === undefined || item.roles.includes(user.role))

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-200 bg-white md:w-56 md:shrink-0 md:border-r md:border-b-0">
        <div className="px-4 py-3 text-lg font-semibold md:py-5">Helpdesk</div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="text-right">
            <p className="text-sm font-medium leading-tight">{user.name}</p>
            <p className="text-xs text-slate-500">{roleLabels[user.role]}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void logout()
            }}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Keluar
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}