import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { InlineError } from '../components/feedback'
import { useAuth } from '../features/auth/useAuth'
import { ApiError } from '../lib/api'

const demoAccounts = [
  { label: 'Admin', email: 'admin@helpdesk.test' },
  { label: 'Agent', email: 'agent1@helpdesk.test' },
  { label: 'Requester', email: 'requester1@helpdesk.test' },
]

const DEMO_PASSWORD = 'password'

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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold">Helpdesk</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Masuk untuk melanjutkan</p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
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
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
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
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
            {fieldErrors.password?.[0] !== undefined && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {mutation.isPending ? 'Memproses…' : 'Masuk'}
          </button>
        </form>

        <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-4">
          <p className="text-xs text-slate-500">Akun demo (password: {DEMO_PASSWORD})</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setEmail(account.email)
                  setPassword(DEMO_PASSWORD)
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}