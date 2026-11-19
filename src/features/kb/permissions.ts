import type { User } from '../../types/api'
import type { KbArticle } from './kb-api'

/**
 * Semua fungsi di sini cuma cerminan KbArticlePolicy di API, supaya tombol yang pasti
 * ditolak nggak ditampilkan. Penjaga sebenarnya tetap API (403 dan 422).
 */

export function canWriteArticles(user: User): boolean {
  return user.role === 'admin' || user.role === 'agent'
}

// Admin boleh mengedit apa saja. Agent hanya draft miliknya sendiri.
export function canEditArticle(user: User, article: Pick<KbArticle, 'author' | 'status'>): boolean {
  if (user.role === 'admin') return true

  return user.role === 'agent' && article.author.id === user.id && article.status === 'draft'
}

// Publikasikan, tarik ke draft, dan hapus: khusus admin.
export function canManageArticle(user: User): boolean {
  return user.role === 'admin'
}