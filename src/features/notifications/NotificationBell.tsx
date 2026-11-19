import { useEffect, useRef, useState } from 'react'
import {
  Bell,
  CheckCheck,
  Clock,
  MessageSquare,
  OctagonAlert,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { InlineError, Spinner } from '../../components/feedback'
import { Button } from '../../components/ui'
import { describeError } from '../../lib/error'
import { formatRelative } from '../../lib/format'
import { useNow } from '../../lib/useNow'
import { useMarkAllRead, useMarkRead, useNotifications } from './hooks'
import type { NotificationItem } from './notifications-api'

interface TypeStyle {
  icon: LucideIcon
  className: string
}

const typeStyles: Record<string, TypeStyle> = {
  'ticket.assigned': { icon: UserPlus, className: 'bg-brand/10 text-brand' },
  'ticket.commented': { icon: MessageSquare, className: 'bg-slate-100 text-slate-600' },
  'ticket.sla_warning': { icon: Clock, className: 'bg-amber-100 text-amber-700' },
  'ticket.sla_breached': { icon: OctagonAlert, className: 'bg-red-100 text-red-700' },
}

const fallbackStyle: TypeStyle = { icon: Bell, className: 'bg-slate-100 text-slate-600' }

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const now = useNow()

  const query = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const unread = query.data?.unread_count ?? 0
  const items = query.data?.data ?? []
  const total = query.data?.meta.total ?? 0

  // Panel tertutup kalau klik di luar atau menekan Escape.
  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      const wrapper = wrapperRef.current

      if (wrapper !== null && event.target instanceof Node && !wrapper.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function openItem(item: NotificationItem) {
    if (!item.is_read) markRead.mutate(item.id)

    setOpen(false)

    if (item.ticket_id !== null) void navigate(`/tickets/${item.ticket_id}`)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        variant="sidebar"
        className="relative px-2.5"
        aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="size-4" aria-hidden="true" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 flex min-w-4.5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] leading-4.5 font-semibold text-white"
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifikasi"
          className="fixed top-16 right-3 left-3 z-50 rounded-md border border-line bg-white text-ink shadow-lg md:absolute md:top-full md:right-auto md:left-0 md:mt-2 md:w-[22rem]"
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold">Notifikasi</h2>
            <Button
              variant="secondary"
              className="px-2 py-1 text-xs"
              disabled={unread === 0 || markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="size-3.5" aria-hidden="true" />
              Tandai semua dibaca
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {query.isPending && (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            )}

            {query.isError && query.data === undefined && (
              <div className="p-4">
                <InlineError message={describeError(query.error)} />
              </div>
            )}

            {query.data !== undefined && items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted">Belum ada notifikasi.</p>
            )}

            {items.length > 0 && (
              <ul className="divide-y divide-line">
                {items.map((item) => {
                  const style = (item.type === null ? undefined : typeStyles[item.type]) ?? fallbackStyle
                  const Icon = style.icon

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => openItem(item)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 ${
                          item.is_read ? '' : 'bg-tint'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${style.className}`}
                        >
                          <Icon className="size-4" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-sm [overflow-wrap:anywhere] ${
                              item.is_read ? 'text-muted' : 'font-medium'
                            }`}
                          >
                            {item.message ?? 'Notifikasi baru'}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {item.ticket_number !== null && `${item.ticket_number} · `}
                            {formatRelative(item.created_at, now)}
                          </span>
                        </span>

                        {!item.is_read && (
                          <>
                            <span
                              aria-hidden="true"
                              className="mt-2 size-2 shrink-0 rounded-full bg-brand"
                            />
                            <span className="sr-only">Belum dibaca</span>
                          </>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {total > items.length && (
            <p className="border-t border-line px-4 py-2 text-xs text-muted">
              Menampilkan {items.length} notifikasi terbaru dari {total}.
            </p>
          )}
        </div>
      )}
    </div>
  )
}