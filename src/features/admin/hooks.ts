import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  createUser,
  deleteCategory,
  fetchAuditLogs,
  fetchSlaPolicies,
  fetchUserOptions,
  fetchUsers,
  updateCategory,
  updateSlaPolicy,
  updateUser,
  type AuditFilters,
  type CategoryInput,
  type SlaPolicyInput,
  type UserFilters,
  type UserInput,
} from './admin-api'

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => fetchUsers(filters),
    // Saat pindah halaman atau ganti filter, data lama tetap tampil (agak pudar) sampai data baru datang.
    placeholderData: keepPreviousData,
  })
}

export function useUserOptions() {
  return useQuery({
    queryKey: ['admin', 'user-options'],
    queryFn: fetchUserOptions,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Satu hook untuk buat dan ubah pengguna: userId null berarti buat baru.
 * Perubahan pengguna ikut mempengaruhi daftar agent, dashboard, dan data akun
 * yang sedang login (mis. nama di sidebar), jadi semuanya diambil ulang.
 */
export function useSaveUser(userId: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UserInput) =>
      userId === null ? createUser(input) : updateUser(userId, input),
    onSuccess: () => {
      for (const key of ['admin', 'agents', 'dashboard', 'me']) {
        void queryClient.invalidateQueries({ queryKey: [key] })
      }
    },
  })
}

function useInvalidateCategories() {
  const queryClient = useQueryClient()

  // Nama kategori tampil di daftar tiket dan artikel, jadi ikut diambil ulang.
  return () => {
    for (const key of ['categories', 'tickets', 'kb']) {
      void queryClient.invalidateQueries({ queryKey: [key] })
    }
  }
}

export function useSaveCategory(categoryId: number | null) {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: (input: CategoryInput) =>
      categoryId === null ? createCategory(input) : updateCategory(categoryId, input),
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: invalidate,
  })
}

export function useSlaPolicies() {
  return useQuery({
    queryKey: ['admin', 'sla'],
    queryFn: fetchSlaPolicies,
  })
}

export function useSaveSlaPolicy(policyId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SlaPolicyInput) => updateSlaPolicy(policyId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'sla'] })
    },
  })
}

export function useAuditLogs(filters: AuditFilters) {
  return useQuery({
    queryKey: ['admin', 'audit', filters],
    queryFn: () => fetchAuditLogs(filters),
    placeholderData: keepPreviousData,
  })
}