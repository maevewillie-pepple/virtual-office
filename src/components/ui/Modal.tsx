import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const WIDTHS = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-3xl' }

export default function Modal({ isOpen, onClose, title, description, children, size = 'md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!isOpen) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const panel = panelRef.current
    const focusable = () => panel?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    window.requestAnimationFrame(() => focusable()?.[0]?.focus())
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closeRef.current()
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const items = [...(focusable() ?? [])]
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center sm:p-6"
      onMouseDown={event => { if (event.target === event.currentTarget) closeRef.current() }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[calc(100vh-1.5rem)] w-full ${WIDTHS[size]} flex-col overflow-hidden rounded-[16px] border border-border bg-surface shadow-[0_16px_40px_rgba(48,53,47,0.14)]`}
      >
        {title && (
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-[18px] font-semibold leading-6 text-ink">{title}</h2>
              {description && <p className="mt-1 text-[14px] leading-5 text-ink-2">{description}</p>}
            </div>
            <button
              type="button"
              onClick={() => closeRef.current()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-ink-2 hover:bg-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              aria-label="Close"
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          </div>
        )}
        <div className="min-h-0 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
