import { useEffect } from 'react'
import { useMatches } from 'react-router-dom'

const APP_NAME = 'Helpdesk'

function titleOf(handle: unknown): string | null {
  if (
    typeof handle === 'object' &&
    handle !== null &&
    'title' in handle &&
    typeof handle.title === 'string'
  ) {
    return handle.title
  }

  return null
}

/**
 * Judul tab browser dari rute yang sedang aktif. Rute paling dalam yang punya
 * handle.title yang dipakai, misalnya "Tiket · Helpdesk".
 */
export function useRouteTitle(): void {
  const matches = useMatches()

  const title = [...matches]
    .reverse()
    .map((match) => titleOf(match.handle))
    .find((value): value is string => value !== null)

  useEffect(() => {
    document.title = title === undefined ? APP_NAME : `${title} · ${APP_NAME}`
  }, [title])
}