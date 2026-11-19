import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addComment,
  createTicket,
  fetchCategories,
  fetchComments,
  fetchTicket,
  fetchTickets,
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

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
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