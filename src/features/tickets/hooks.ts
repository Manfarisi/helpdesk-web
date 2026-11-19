import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Ticket, TicketStatus } from '../../types/api'
import {
  addComment,
  assignTicket,
  claimTicket,
  createTicket,
  fetchAssignableUsers,
  fetchCategories,
  fetchComments,
  fetchHistory,
  fetchTicket,
  fetchTickets,
  transitionTicket,
  type CreateTicketInput,
  type TicketFilters,
} from './tickets-api'

export function useTicketList(filters: TicketFilters) {
  return useQuery({
    queryKey: ['tickets', 'list', filters],
    queryFn: () => fetchTickets(filters),
    // Saat pindah halaman atau tab, data lama tetap tampil (agak pudar) sampai data baru datang.
    placeholderData: keepPreviousData,
  })
}

export function useTicket(id: number) {
  return useQuery({
    queryKey: ['tickets', 'detail', id],
    queryFn: () => fetchTicket(id),
  })
}

export function useComments(ticketId: number) {
  return useQuery({
    queryKey: ['tickets', 'comments', ticketId],
    queryFn: () => fetchComments(ticketId),
  })
}

export function useTicketHistory(ticketId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['tickets', 'history', ticketId],
    queryFn: () => fetchHistory(ticketId),
    enabled,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAssignableUsers(enabled: boolean) {
  return useQuery({
    queryKey: ['agents'],
    queryFn: fetchAssignableUsers,
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTicketInput) => createTicket(input),
    onSuccess: (ticket) => {
      // Detail langsung tersedia, jadi halaman tujuan nggak perlu menunggu loading.
      queryClient.setQueryData(['tickets', 'detail', ticket.id], ticket)
      void queryClient.invalidateQueries({ queryKey: ['tickets', 'list'] })
    },
  })
}

export function useAddComment(ticketId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { body: string; isInternal: boolean }) => addComment(ticketId, input),
    // Komentar bisa mengubah tiket (first response terisi, atau tiket pending lanjut
    // otomatis), jadi semua data tiket diambil ulang.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export type TicketAction =
  | { type: 'claim' }
  | { type: 'assign'; assigneeId: number }
  | { type: 'transition'; to: TicketStatus }

/**
 * Satu mutation untuk semua tindakan di kartu Workflow, jadi cuma ada satu status
 * loading dan satu pesan error di kartu itu.
 */
export function useTicketAction(ticketId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (action: TicketAction): Promise<Ticket> => {
      switch (action.type) {
        case 'claim':
          return claimTicket(ticketId)
        case 'assign':
          return assignTicket(ticketId, action.assigneeId)
        case 'transition':
          return transitionTicket(ticketId, action.to)
      }
    },
    onSuccess: (ticket) => {
      queryClient.setQueryData(['tickets', 'detail', ticketId], ticket)
      void queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
    // Gagal biasanya karena data sudah berubah (mis. tiket sudah diambil agent lain).
    // Ambil ulang supaya layar sesuai kondisi terbaru.
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}