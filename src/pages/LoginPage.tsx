import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { InlineError } from '../components/feedback'
import { Button } from '../components/ui'
import { useAuth } from '../features/auth/useAuth'
import { ApiError } from '../lib/api'

const demoAccounts = [
  { label: 'Admin', email: 'admin@helpdesk.test' },
  { label: 'Agent', email: 'agent1@helpdesk.test' },
  { label: 'Requester', email: 'requester1@helpdesk.test' },
]

const DEMO_PASSWORD = 'password'

const inputClass =
  'mt-1 w-full rounded border border-line px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Setelah login berhasil, GuestOnly (parent route) yang mengarahkan ke halaman tujuan.
  const mutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      login(credentials.email, credentials.password),
  })

  const error = mutation.error instanceof ApiError ? mutation.error : null
  const fieldErrors = error?.errors ?? {}
  const hasFieldErrors = Object.keys(fieldErrors).length > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    mutation.mutate({ email, password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-white">
          <h1 className="text-2xl font-bold">Helpdesk</h1>
          <p className="mt-1 text-sm text-slate-300">Service Desk Console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-md bg-white p-6 shadow-lg">
          <h2 className="text-base font-semibold">Masuk ke akunmu</h2>

          {error !== null && !hasFieldErrors && <InlineError message={error.message} />}

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
            {fieldErrors.email?.[0] !== undefined && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
            {fieldErrors.password?.[0] !== undefined && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password[0]}</p>
            )}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? 'Memproses…' : 'Masuk'}
          </Button>
        </form>

        <div className="mt-4 rounded-md border border-sidebar-border bg-sidebar-hover/50 p-4 text-white">
          <p className="text-xs text-slate-300">Akun demo (password: {DEMO_PASSWORD})</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {demoAccounts.map((account) => (
              <Button
                key={account.email}
                variant="sidebar"
                className="px-3 py-1.5 text-xs"
                onClick={() => {
                  setEmail(account.email)
                  setPassword(DEMO_PASSWORD)
                }}
              >
                {account.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}