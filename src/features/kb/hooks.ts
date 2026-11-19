import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createArticle,
  deleteArticle,
  fetchArticle,
  fetchArticles,
  publishArticle,
  unpublishArticle,
  updateArticle,
  type ArticleInput,
  type KbArticleDetail,
  type KbFilters,
} from './kb-api'

export function useArticleList(filters: KbFilters) {
  return useQuery({
    queryKey: ['kb', 'list', filters],
    queryFn: () => fetchArticles(filters),
    // Saat pindah halaman atau ganti filter, data lama tetap tampil (agak pudar) sampai data baru datang.
    placeholderData: keepPreviousData,
  })
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ['kb', 'detail', slug],
    queryFn: () => fetchArticle(slug),
  })
}

/**
 * Setelah artikel berubah, detailnya langsung diisi dari respons API
 * (halaman tujuan nggak perlu loading), dan semua daftar diambil ulang.
 */
function useSyncArticle() {
  const queryClient = useQueryClient()

  return (article: KbArticleDetail) => {
    queryClient.setQueryData(['kb', 'detail', article.slug], article)
    void queryClient.invalidateQueries({ queryKey: ['kb', 'list'] })
  }
}

export function useCreateArticle() {
  const sync = useSyncArticle()

  return useMutation({
    mutationFn: (input: ArticleInput) => createArticle(input),
    onSuccess: sync,
  })
}

export function useUpdateArticle(slug: string) {
  const sync = useSyncArticle()

  return useMutation({
    mutationFn: (input: ArticleInput) => updateArticle(slug, input),
    onSuccess: sync,
  })
}

export type ArticleAction = 'publish' | 'unpublish'

export function useArticleAction(slug: string) {
  const queryClient = useQueryClient()
  const sync = useSyncArticle()

  return useMutation({
    mutationFn: (action: ArticleAction) =>
      action === 'publish' ? publishArticle(slug) : unpublishArticle(slug),
    onSuccess: sync,
    // Gagal biasanya karena data sudah berubah (mis. sudah dipublikasikan admin lain).
    // Ambil ulang supaya layar sesuai kondisi terbaru.
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ['kb'] })
    },
  })
}

export function useDeleteArticle(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteArticle(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['kb', 'list'] })
    },
  })
}