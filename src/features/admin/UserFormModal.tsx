import { useState, type FormEvent } from 'react'
import { InlineError } from '../../components/feedback'
import { Modal } from '../../components/Modal'
import { Button, Field } from '../../components/ui'
import { ApiError } from '../../lib/api'
import { describeActionError } from '../../lib/error'
import { roleLabel } from '../../lib/labels'
import { controlClass } from '../../lib/styles'
import type { UserRole } from '../../types/api'
import { useAuth } from '../auth/useAuth'
import type { AdminUser, UserInput } from './admin-api'
import { useSaveUser } from './hooks'

const roles: UserRole[] = ['requester', 'agent', 'admin']

/**
 * Dialog tambah (user null) atau edit pengguna. Dipasang dengan key yang berbeda
 * per pengguna, jadi isian selalu mulai dari data yang benar.
 */
export function UserFormModal({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const { user: me } = useAuth()
  const mutation = useSaveUser(user?.id ?? null)

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [role, setRole] = useState<UserRole>(user?.role ?? 'requester')
  const [isActive, setIsActive] = useState(user?.is_active ?? true)
  const [password, setPassword] = useState('')

  const isEdit = user !== null
  const isSelf = user !== null && me?.id === user.id
  const apiError = mutation.error instanceof ApiError ? mutation.error : null
  const fieldErrors = apiError?.errors ?? {}
  const hasFieldErrors = Object.keys(fieldErrors).length > 0

  const passwordInvalid = isEdit ? password !== '' && password.length < 8 : password.length < 8
  const incomplete = name.trim() === '' || email.trim() === '' || passwordInvalid
  const deactivating = isEdit && !isSelf && user.is_active && !isActive

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const input: UserInput = { name: name.trim(), email: email.trim(), role }

    if (password !== '') input.password = password
    if (isEdit) input.is_active = isActive

    mutation.mutate(input, { onSuccess: onClose })
  }

  let passwordHint = 'Minimal 8 karakter.'

  if (isEdit) {
    passwordHint = isSelf
      ? 'Kosongkan kalau nggak mau mengganti. Minimal 8 karakter.'
      : 'Kosongkan kalau nggak mau mengganti. Password baru mencabut semua sesi login pengguna ini.'
  }

  return (
    <Modal title={isEdit ? 'Edit pengguna' : 'Tambah pengguna'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mutation.isError && !hasFieldErrors && (
          <InlineError message={describeActionError(mutation.error)} />
        )}

        <Field label="Nama" htmlFor="user-name" error={fieldErrors.name?.[0]}>
          <input
            id="user-name"
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={controlClass}
          />
        </Field>

        <Field label="Email" htmlFor="user-email" error={fieldErrors.email?.[0]}>
          <input
            id="user-email"
            type="email"
            required
            maxLength={150}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={controlClass}
          />
        </Field>

        <Field
          label="Peran"
          htmlFor="user-role"
          error={fieldErrors.role?.[0]}
          hint={isSelf ? 'Kamu nggak bisa mengubah peran akunmu sendiri.' : undefined}
        >
          <select
            id="user-role"
            value={role}
            disabled={isSelf}
            onChange={(event) => {
              const selected = roles.find((option) => option === event.target.value)

              if (selected !== undefined) setRole(selected)
            }}
            className={controlClass}
          >
            {roles.map((option) => (
              <option key={option} value={option}>
                {roleLabel[option]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={isEdit ? 'Password baru' : 'Password'}
          htmlFor="user-password"
          error={fieldErrors.password?.[0]}
          hint={passwordHint}
        >
          <input
            id="user-password"
            type="password"
            autoComplete="new-password"
            required={!isEdit}
            maxLength={100}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={controlClass}
          />
        </Field>

        {isEdit && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isActive}
                disabled={isSelf}
                onChange={(event) => setIsActive(event.target.checked)}
                className="size-4 rounded border-line"
              />
              Akun aktif
            </label>
            {isSelf && (
              <p className="mt-1 text-xs text-muted">
                Kamu nggak bisa menonaktifkan akunmu sendiri.
              </p>
            )}
            {deactivating && (
              <p className="mt-1 text-xs text-amber-800">
                Pengguna ini langsung keluar dari semua sesi dan nggak bisa login lagi. Tiket yang
                dipegangnya tetap atas namanya sampai admin meng-assign ulang.
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={mutation.isPending || incomplete}>
            {mutation.isPending ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Tambah pengguna'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
        </div>
      </form>
    </Modal>
  )
}