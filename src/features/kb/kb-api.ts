import { api } from '../../lib/api'
import type { Category, Paginated } from '../../types/api'

export type KbArticleStatus = 'draft' | 'published'

// Item di daftar artikel: ada excerpt, tanpa isi lengkap.
export interface KbArticle {
  id: number
  title: string
  slug: string
  excerpt: string
  status: KbArticleStatus
  category: Category
  author: { id: number; name: string }
  published_at: string | null
  created_at: string
  updated_at: string
}

// Satu artikel (halaman baca dan editor): sama seperti di atas, plus isi lengkap.
export interface KbArticleDetail extends KbArticle {
  body: string
}

export interface KbFilters {
  search?: string
  categoryId?: number
  status?: KbArticleStatus
  page: number
}

export interface ArticleInput {
  title: string
  body: string
  category_id: number
}

export const KB_PER_PAGE = 12

function articlePath(slug: string): string {
  return `/kb/articles/${encodeURIComponent(slug)}`
}

export function fetchArticles(filters: KbFilters): Promise<Paginated<KbArticle>> {
  return api.get<Paginated<KbArticle>>('/kb/articles', {
    search: filters.search,
    category_id: filters.categoryId,
    status: filters.status,
    page: filters.page,
    per_page: KB_PER_PAGE,
  })
}

export async function fetchArticle(slug: string): Promise<KbArticleDetail> {
  const response = await api.get<{ data: KbArticleDetail }>(articlePath(slug))

  return response.data
}

export async function createArticle(input: ArticleInput): Promise<KbArticleDetail> {
  const response = await api.post<{ data: KbArticleDetail }>('/kb/articles', input)

  return response.data
}

export async function updateArticle(slug: string, input: ArticleInput): Promise<KbArticleDetail> {
  const response = await api.patch<{ data: KbArticleDetail }>(articlePath(slug), input)

  return response.data
}

export async function publishArticle(slug: string): Promise<KbArticleDetail> {
  const response = await api.post<{ data: KbArticleDetail }>(`${articlePath(slug)}/publish`)

  return response.data
}

export async function unpublishArticle(slug: string): Promise<KbArticleDetail> {
  const response = await api.post<{ data: KbArticleDetail }>(`${articlePath(slug)}/unpublish`)

  return response.data
}

export async function deleteArticle(slug: string): Promise<void> {
  await api.delete<void>(articlePath(slug))
}