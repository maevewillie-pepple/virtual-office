import { useEffect, useRef, useState } from 'react'
import type { Office, OnlineUser, User } from '../../types'
import { UserPlus, MessageSquare, Home, Settings, Bell, ListTodo, Menu, X } from 'lucide-react'
import { IconButton } from '../ui/Button'
import AvatarSprite from '../ui/AvatarSprite'

interface OfficeTopNavProps {
  office: Office
  onlineUsers: OnlineUser[]
  currentUser: User
  onInvite: () => void
  onSettings: () => void
  onDashboard?: () => void
  onOpenTasks: () => void
  onToggleNotices: () => void
  noticesOpen: boolean
  unreadCount: number
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

const actionBtn =
  'flex items-center gap-1.5 h-8 px-3 rounded-[6px] border border-border bg-surface text-[12px] font-medium text-ink-2 hover:bg-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus'

const iconBtn =
  'relative flex h-8 w-8 items-center justify-center rounded-[6px] border border-border bg-surface text-ink-2 hover:bg-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus'

const menuItem =
  'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[14px] text-ink hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus'

export default function OfficeTopNav({
  office, onlineUsers, currentUser, onInvite, onSettings, onDashboard,
  onOpenTasks, onToggleNotices, noticesOpen, unreadCount, onToggleSidebar, sidebarOpen,
}: OfficeTopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const onPointer = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (menuRef.current?.contains(target)) return
      if (target instanceof Element && target.closest('[data-office-menu]')) return
      setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  const openNotices = () => {
    closeMenu()
    onToggleNotices()
  }

  const run = (action: () => void) => {
    closeMenu()
    action()
  }

  const bellLabel = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'

  return (
    <nav
      className="relative flex h-[52px] flex-shrink-0 items-center justify-between border-b border-border bg-surface px-3 md:px-4"
      aria-label="Office navigation"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="hidden items-center gap-2.5 md:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-muted text-sm">
            {office.coverEmoji || '🏢'}
          </div>
          <div>
            <h1 className="text-[13px] font-semibold leading-none text-ink">{office.name}</h1>
            <p className="mt-0.5 text-[11px] leading-none text-ink-3">Private office</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 md:hidden">
          <img
            src="/logo.png"
            alt="Side desk"
            width={32}
            height={32}
            className="h-8 w-8 object-contain [image-rendering:pixelated]"
          />
          <span className="flex items-center gap-1.5 text-[13px] text-ink-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" />
            {onlineUsers.length} online
          </span>
        </div>
      </div>

      <div className="hidden items-center gap-2.5 md:flex">
        <div className="flex -space-x-2">
          {onlineUsers.slice(0, 5).map(ou => (
            <div
              key={ou.user.id}
              title={ou.isCurrentUser ? 'You' : ou.user.name}
              className="relative h-6 w-6 overflow-hidden rounded-full border-2"
              style={{ borderColor: '#FFFEFA' }}
            >
              <AvatarSprite config={ou.user.avatar} status={ou.user.status} name={ou.user.name} size={24} />
            </div>
          ))}
          {onlineUsers.length > 5 && (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 bg-muted text-[10px] font-medium text-ink-2"
              style={{ borderColor: '#FFFEFA' }}
            >
              +{onlineUsers.length - 5}
            </div>
          )}
        </div>
        <span className="flex items-center gap-1.5 text-[12px] text-ink-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" />
          {onlineUsers.length} online
        </span>
      </div>

      <div className="hidden items-center gap-1 md:flex">
        <button type="button" onClick={onInvite} className={actionBtn}>
          <UserPlus size={14} strokeWidth={1.75} />
          <span>Invite</span>
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-pressed={sidebarOpen}
          aria-label={sidebarOpen ? 'Hide chat' : 'Show chat'}
          title={sidebarOpen ? 'Hide chat' : 'Show chat'}
          className={`${actionBtn} px-2.5`}
        >
          <MessageSquare size={16} strokeWidth={1.75} />
          <span>{sidebarOpen ? 'Hide chat' : 'Show chat'}</span>
        </button>
        <button type="button" onClick={onOpenTasks} className={`${actionBtn} px-2.5`}>
          <ListTodo size={15} strokeWidth={1.75} />
          <span>Tasks</span>
        </button>
        <button
          type="button"
          data-notices-toggle
          onClick={onToggleNotices}
          aria-expanded={noticesOpen}
          aria-label={bellLabel}
          title="Notifications"
          className={`${actionBtn} relative px-2.5`}
        >
          <Bell size={15} strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-olive px-1 text-[10px] font-semibold text-surface">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        {onDashboard && (
          <button
            type="button"
            onClick={onDashboard}
            title={`${currentUser.name}'s dashboard`}
            className={actionBtn}
          >
            <Home size={15} strokeWidth={1.75} />
            Dashboard
          </button>
        )}
        <IconButton label="Office settings" onClick={onSettings}>
          <Settings size={16} strokeWidth={1.75} className="text-ink-2" />
        </IconButton>
      </div>

      <div className="flex items-center gap-1.5 md:hidden">
        <button
          type="button"
          data-notices-toggle
          onClick={openNotices}
          aria-expanded={noticesOpen}
          aria-label={bellLabel}
          title="Notifications"
          className={iconBtn}
        >
          <Bell size={16} strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-olive px-1 text-[10px] font-semibold text-surface">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setMenuOpen(open => {
              const next = !open
              if (next && noticesOpen) onToggleNotices()
              return next
            })
          }}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          data-office-menu
          className={iconBtn}
        >
          {menuOpen ? <X size={16} strokeWidth={1.75} /> : <Menu size={16} strokeWidth={1.75} />}
        </button>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Office menu"
          className="absolute right-2 top-[46px] z-[90] w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-lg md:hidden"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-[13px] font-semibold text-ink">{office.name}</p>
            <p className="text-[12px] text-ink-3">Private office</p>
          </div>
          <button type="button" role="menuitem" className={menuItem} onClick={() => run(onToggleSidebar)}>
            <MessageSquare size={16} strokeWidth={1.75} />
            {sidebarOpen ? 'Hide chat' : 'Show chat'}
          </button>
          <button type="button" role="menuitem" className={menuItem} onClick={() => run(onInvite)}>
            <UserPlus size={16} strokeWidth={1.75} />
            Invite
          </button>
          <button type="button" role="menuitem" className={menuItem} onClick={() => run(onOpenTasks)}>
            <ListTodo size={16} strokeWidth={1.75} />
            Tasks
          </button>
          {onDashboard && (
            <button type="button" role="menuitem" className={menuItem} onClick={() => run(onDashboard)}>
              <Home size={16} strokeWidth={1.75} />
              Dashboard
            </button>
          )}
          <button type="button" role="menuitem" className={menuItem} onClick={() => run(onSettings)}>
            <Settings size={16} strokeWidth={1.75} />
            Settings
          </button>
        </div>
      )}
    </nav>
  )
}
