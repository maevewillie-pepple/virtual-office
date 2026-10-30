import React from 'react'
import type { Office, OnlineUser, User } from '../../types'
import { UserPlus, PanelRightClose, PanelRightOpen, Settings } from 'lucide-react'
import { IconButton } from '../ui/Button'
import AvatarSprite from '../ui/AvatarSprite'

interface OfficeTopNavProps {
  office: Office
  onlineUsers: OnlineUser[]
  currentUser: User
  onInvite: () => void
  onSettings: () => void
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

export default function OfficeTopNav({
  office, onlineUsers, currentUser, onInvite, onSettings, onToggleSidebar, sidebarOpen
}: OfficeTopNavProps) {
  return (
    <nav
      className="flex items-center justify-between px-4 border-b border-border bg-surface flex-shrink-0"
      style={{ height: 52 }}
      aria-label="Office navigation"
    >
      {/* Left: Office name */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-[6px] flex items-center justify-center text-sm bg-muted">
          {office.coverEmoji || '🏢'}
        </div>
        <div>
          <h1 className="text-ink font-semibold text-[13px] leading-none">{office.name}</h1>
          <p className="text-ink-3 text-[11px] mt-0.5 leading-none">Private office</p>
        </div>
      </div>

      {/* Center: Online members */}
      <div className="flex items-center gap-2.5">
        <div className="flex -space-x-2">
          {onlineUsers.slice(0, 5).map(ou => (
            <div
              key={ou.user.id}
              title={ou.isCurrentUser ? 'You' : ou.user.name}
              className="relative w-6 h-6 rounded-full border-2 overflow-hidden"
              style={{ borderColor: '#FFFEFA' }}
            >
              <AvatarSprite config={ou.user.avatar} status={ou.user.status} name={ou.user.name} size={24} />
            </div>
          ))}
          {onlineUsers.length > 5 && (
            <div
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] text-ink-2 font-medium bg-muted"
              style={{ borderColor: '#FFFEFA' }}
            >
              +{onlineUsers.length - 5}
            </div>
          )}
        </div>
        <span className="text-[12px] text-ink-2 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
          {onlineUsers.length} online
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onInvite}
          className="flex items-center gap-1.5 h-8 px-3 rounded-[6px] border border-border bg-surface text-[12px] font-medium text-ink-2
            hover:bg-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <UserPlus size={14} strokeWidth={1.75} />
          <span>Invite</span>
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-pressed={sidebarOpen}
          aria-label={sidebarOpen ? 'Hide chat' : 'Show chat'}
          title={sidebarOpen ? 'Hide chat' : 'Show chat'}
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-[6px] border border-border bg-surface text-[12px] font-medium text-ink-2
            hover:bg-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {sidebarOpen
            ? <PanelRightClose size={16} strokeWidth={1.75} />
            : <PanelRightOpen size={16} strokeWidth={1.75} />
          }
          <span>{sidebarOpen ? 'Hide chat' : 'Show chat'}</span>
        </button>
        <IconButton label="Office settings" onClick={onSettings}>
          <Settings size={16} strokeWidth={1.75} className="text-ink-2" />
        </IconButton>
      </div>
    </nav>
  )
}
