import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchDashboard } from './dashboard-api'

export function useDashboard(from: string, to: string) {
  return useQuery({
    queryKey: ['dashboard', { from, to }],
    queryFn: () => fetchDashboard(from, to),
    // Saat ganti rentang, angka lama tetap tampil (agak pudar) sampai angka baru datang.
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  })
}