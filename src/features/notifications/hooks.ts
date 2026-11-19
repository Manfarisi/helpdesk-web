import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './notifications-api'

const NOTIFICATIONS_KEY = ['notifications'] as const

/**
 * Daftar notifikasi terbaru sekaligus jumlah yang belum dibaca (unread_count).
 * Diambil ulang tiap 30 detik. Polling otomatis berhenti saat tab di latar belakang.
 */
export function useNotifications() {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'preview'],
    queryFn: fetchNotifications,
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}

export function useMarkRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
    },
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
    },
  })
}