import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ConnectionError, FullPageSpinner } from '../components/feedback'
import { useAuth } from '../features/auth/useAuth'
import { redirectTarget } from '../lib/redirect'
import type { UserRole } from '../types/api'

/**
 * Semua halaman di dalamnya butuh login. Belum login: diarahkan ke /login,
 * dengan membawa halaman tujuan supaya bisa kembali setelah login.
 */
export function RequireAuth() {
  const { status, retry } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullPageSpinner />
  if (status === 'error') return <ConnectionError onRetry={retry} />

  if (status === 'unauthenticated') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return <Outlet />
}

/**
 * Halaman untuk tamu (login). Kalau sudah login, langsung diarahkan keluar.
 */
export function GuestOnly() {
  const { status, retry } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullPageSpinner />
  if (status === 'error') return <ConnectionError onRetry={retry} />

  if (status === 'authenticated') {
    return <Navigate to={redirectTarget(location.state)} replace />
  }

  return <Outlet />
}

/**
 * Pembatas tampilan per role. Pembatas sebenarnya tetap di API (Policy dan Gate),
 * ini cuma supaya user nggak melihat halaman yang pasti ditolak.
 */
export function RequireRole({ roles }: { roles: UserRole[] }) {
  const { user } = useAuth()

  if (user === null || !roles.includes(user.role)) {
    return <Navigate to="/tickets" replace />
  }

  return <Outlet />
}