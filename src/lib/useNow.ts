import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void): () => void {
  const id = window.setInterval(onChange, 30_000)

  return () => window.clearInterval(id)
}

function getSnapshot(): number {
  // Dibulatkan ke menit supaya nilainya stabil antar render dalam menit yang sama.
  return Math.floor(Date.now() / 60_000) * 60_000
}

/**
 * Waktu sekarang (ms) yang diperbarui otomatis, supaya sisa waktu SLA di layar
 * tetap berjalan tanpa perlu refresh halaman.
 */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot)
}