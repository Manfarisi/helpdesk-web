import { BookOpen, LayoutDashboard, LogOut, Ticket, type LucideIcon } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '../components/ui'
import { useAuth } from '../features/auth/useAuth'
import { NotificationBell } from '../features/notifications/NotificationBell'
import type { UserRole } from '../types/api'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  roles?: UserRole[]
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    items: [
      { to: '/tickets', label: 'Tiket', icon: Ticket },
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'agent'] },
    ],
  },
  {
    title: 'Pengetahuan',
    items: [{ to: '/kb', label: 'Knowledge Base', icon: BookOpen }],
  },
]

const roleInfo: Record<UserRole, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'text-amber-300' },
  agent: { label: 'Agent', className: 'text-sky-300' },
  requester: { label: 'Requester', className: 'text-emerald-300' },
}

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded px-3 py-2 text-sm font-medium whitespace-nowrap ${
          isActive
            ? 'bg-sidebar-active text-white'
            : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
        }`
      }
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {item.label}
    </NavLink>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()

  if (user === null) return null

  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => item.roles === undefined || item.roles.includes(user.role),
      ),
    }))
    .filter((section) => section.items.length > 0)

  const role = roleInfo[user.role]

  function signOut() {
    void logout()
  }

  return (
    <div className="min-h-screen md:flex">
      {/* Layar kecil: bar atas dengan menu yang bisa digeser. */}
      <header className="relative z-30 bg-sidebar text-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-bold leading-tight">Helpdesk</p>
            <p className="text-xs text-slate-300">
              {user.name} · {role.label}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button variant="sidebar" onClick={signOut} aria-label="Keluar">
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
          {visibleSections
            .flatMap((section) => section.items)
            .map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
        </nav>
      </header>

      {/* Layar lebar: sidebar tetap di kiri. */}
      <aside className="hidden bg-sidebar text-white md:sticky md:top-0 md:z-30 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col">
        <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
          <div>
            <p className="text-lg font-bold">Helpdesk</p>
            <p className="text-xs text-slate-300">Service Desk Console</p>
          </div>
          <NotificationBell />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {visibleSections.map((section, index) => (
            <div key={section.title ?? 'main'} className={index === 0 ? '' : 'mt-6'}>
              {section.title !== undefined && (
                <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <SidebarLink key={item.to} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <p className="truncate text-sm">
            <span className="font-semibold">{user.name}</span>
            <span className="mx-1.5 text-slate-500">·</span>
            <span className={`font-medium ${role.className}`}>{role.label}</span>
          </p>
          <p className="truncate text-xs text-slate-400">{user.email}</p>
          <Button variant="sidebar" onClick={signOut} className="mt-3 w-full justify-start">
            <LogOut className="size-4" aria-hidden="true" />
            Keluar
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="h-0.5 bg-brand" />
        <Outlet />
      </main>
    </div>
  )
}