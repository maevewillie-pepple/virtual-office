import { useEffect, useRef } from 'react'
import type { OfficeNotice } from '../../office/notices'
import { noticeAction, noticeAge, noticeDetail, noticeHeadline } from '../../office/notices'

interface NotificationCentreProps {
  notices: OfficeNotice[]
  userId: string
  onOpen: (notice: OfficeNotice) => void
  onMarkAll: () => void
  onClose: () => void
}

export default function NotificationCentre({ notices, userId, onOpen, onMarkAll, onClose }: NotificationCentreProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const unread = notices.some(notice => !notice.read)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const onPointer = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (panelRef.current?.contains(target)) return
      if (target instanceof Element && target.closest('[data-notices-toggle]')) return
      onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [onClose])

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notification centre"
      className="absolute right-3 top-[60px] z-[80] flex max-h-[min(440px,calc(100%-80px))] w-[min(360px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <h2 className="text-[13px] font-semibold text-ink">Notifications</h2>
        {unread && (
          <button
            type="button"
            onClick={onMarkAll}
            className="text-[12px] text-olive hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {notices.length === 0 && (
          <p className="px-3 py-6 text-[13px] leading-5 text-ink-3">
            Quiet for now. Waves, meeting discussions, Spotify jams, and whiteboard notes show up here.
          </p>
        )}
        <ul>
          {notices.map(notice => {
            const detail = noticeDetail(notice)
            return (
              <li key={notice.id}>
                <button
                  type="button"
                  onClick={() => onOpen(notice)}
                  className={`flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${notice.read ? '' : 'bg-olive-soft/50'}`}
                >
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${notice.read ? 'bg-transparent' : 'bg-olive'}`} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] leading-5 text-ink">{noticeHeadline(notice, userId)}</span>
                    {detail && <span className="mt-0.5 block truncate text-[12px] text-ink-2">{detail}</span>}
                    <span className="mt-0.5 block text-[11px] text-ink-3">{noticeAge(notice.at)}</span>
                  </span>
                  <span className="shrink-0 pt-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-olive">
                    {noticeAction(notice)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
