import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, setUnauthorizedHandler } from '../../lib/api'
import { clearToken, getToken, setToken } from '../../lib/token'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'
import { fetchMe, loginRequest, logoutRequest } from './auth-api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [hasToken, setHasToken] = useState<boolean>(() => getToken() !== null)

  const dropToken = useCallback(() => {
    clearToken()
    setHasToken(false)
  }, [])

  // Sesi berakhir: token dibuang dan semua cache dikosongkan, supaya data user lama
  // nggak bocor ke user berikutnya yang login di browser yang sama.
  const endSession = useCallback(() => {
    dropToken()
    queryClient.clear()
  }, [dropToken, queryClient])

  useEffect(() => {
    setUnauthorizedHandler(endSession)

    return () => setUnauthorizedHandler(null)
  }, [endSession])

  const { data, isError, refetch } = useQuery({
    queryKey: ['me'],
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      try {
        return await fetchMe()
      } catch (error) {
        // Akun dinonaktifkan setelah login: API membalas 403, sesinya harus berakhir juga.
        if (error instanceof ApiError && error.status === 403) dropToken()

        throw error
      }
    },
  })

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginRequest(email, password)

      setToken(result.token)
      queryClient.setQueryData(['me'], result.user)
      setHasToken(true)
    },
    [queryClient],
  )

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // Token mungkin sudah kedaluwarsa. Apa pun hasilnya, sesi lokal tetap diakhiri.
    }

    endSession()
  }, [endSession])

  const retry = useCallback(() => {
    void refetch()
  }, [refetch])

  const user = hasToken ? (data ?? null) : null

  let status: AuthStatus

  if (!hasToken) {
    status = 'unauthenticated'
  } else if (isError) {
    status = 'error'
  } else if (user === null) {
    status = 'loading'
  } else {
    status = 'authenticated'
  }

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, logout, retry }),
    [status, user, login, logout, retry],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}