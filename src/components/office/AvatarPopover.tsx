import React, { useState } from 'react'
import type { OnlineUser } from '../../types'
import { MessageSquare, Hand, Coffee, Bell, Gift, Timer, Music } from 'lucide-react'
import Modal from '../ui/Modal'
import AvatarSprite from '../ui/AvatarSprite'

interface AvatarPopoverProps {
  user: OnlineUser | null
  isOpen: boolean
  onClose: () => void
  onChat: (userId: string) => void
  onWave: (userId: string) => void
  onCoffeeInvite: (userId: string) => void
  onNudge: (userId: string) => void
  onGiveItem: (userId: string) => void
  onFocusInvite: (userId: string) => void
  onShareMusic: (userId: string, kind: 'playlist' | 'jam' | 'link', link?: string) => string | null
  canGive?: boolean
  canSharePlaylist?: boolean
  canShareJam?: boolean
}

const STATUS_LABEL: Record<string, string> = {
  online: 'Online', focusing: 'Focusing', on_break: 'On Break', away: 'Away', offline: 'Offline',
}
const STATUS_DOT: Record<string, string> = {
  online: 'bg-success', focusing: 'bg-clay', on_break: 'bg-warning', away: 'bg-ink-3', offline: 'bg-border',
}

export default function AvatarPopover({
  user, isOpen, onClose, onChat, onWave, onCoffeeInvite, onNudge, onGiveItem, onFocusInvite, onShareMusic, canGive,
  canSharePlaylist, canShareJam,
}: AvatarPopoverProps) {
  const [sharing, setSharing] = useState(false)
  const [link, setLink] = useState('')
  const [shareError, setShareError] = useState('')
  if (!user) return null

  const close = () => {
    setSharing(false)
    setLink('')
    setShareError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={close} size="sm">
      <div className="flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-muted">
            <AvatarSprite config={user.user.avatar} status={user.user.status} name={user.user.name} size={80} />
          </div>
          <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-surface ${STATUS_DOT[user.user.status]}`} />
        </div>

        <div className="text-center">
          <h3 className="type-h3 text-ink">{user.user.name}</h3>
          <p className="type-small text-ink-2 mt-1">
            {user.focusSession ? 'In focus mode' :
              user.coffeeBreak ? 'On coffee break' :
              user.user.statusMessage || STATUS_LABEL[user.user.status]}
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-center">
          <div>
            <p className="type-small text-ink-3">Member since</p>
            <p className="type-small text-ink font-medium">{new Date(user.user.joinedAt).toLocaleDateString()}</p>
          </div>
          {user.deskId && (
            <div>
              <p className="type-small text-ink-3">Desk</p>
              <p className="type-small text-ink font-medium">{user.deskId.replace('desk_', 'D')}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <ActionBtn icon={<MessageSquare size={16} strokeWidth={1.75} />} label="Chat" onClick={() => { onChat(user.user.id); close() }} />
          <ActionBtn icon={<Hand size={16} strokeWidth={1.75} />} label="Wave" onClick={() => { onWave(user.user.id); close() }} />
          <ActionBtn icon={<Bell size={16} strokeWidth={1.75} />} label="Nudge" onClick={() => { onNudge(user.user.id); close() }} disabled={user.user.status === 'focusing'} />
          <ActionBtn icon={<Coffee size={16} strokeWidth={1.75} />} label="Coffee" onClick={() => { onCoffeeInvite(user.user.id); close() }} disabled={user.user.status === 'focusing'} />
          <ActionBtn icon={<Gift size={16} strokeWidth={1.75} />} label="Give" onClick={() => { onGiveItem(user.user.id); close() }} disabled={!canGive || user.user.status === 'focusing'} />
          <ActionBtn icon={<Timer size={16} strokeWidth={1.75} />} label="Focus" onClick={() => { onFocusInvite(user.user.id); close() }} disabled={user.user.status === 'focusing'} />
          <ActionBtn icon={<Music size={16} strokeWidth={1.75} />} label="Music" onClick={() => setSharing(v => !v)} />
        </div>
        {sharing && (
          <div className="w-full space-y-2 rounded-lg border border-border bg-canvas p-3">
            <p className="text-[12px] leading-5 text-ink-2">Share a link. Nothing starts playing for {user.user.name.split(' ')[0]}.</p>
            <button
              type="button"
              disabled={!canSharePlaylist}
              onClick={() => { onShareMusic(user.user.id, 'playlist'); close() }}
              className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-left text-[12px] text-ink hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Share office playlist
            </button>
            <button
              type="button"
              disabled={!canShareJam}
              onClick={() => { onShareMusic(user.user.id, 'jam'); close() }}
              className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-left text-[12px] text-ink hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send Jam invitation
            </button>
            <input
              value={link}
              onChange={e => { setLink(e.target.value); setShareError('') }}
              placeholder="Paste a Spotify track or playlist link"
              className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-[12px] text-ink outline-none focus:border-olive"
            />
            {shareError && <p className="text-[12px] text-error">{shareError}</p>}
            <button
              type="button"
              onClick={() => {
                const error = onShareMusic(user.user.id, 'link', link)
                if (error) setShareError(error)
                else close()
              }}
              className="w-full rounded-md border border-ink bg-ink px-2 py-1.5 text-[12px] text-surface"
            >
              Share this link
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

function ActionBtn({ icon, label, onClick, disabled }: {
  icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border text-[12px] transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-focus
        ${disabled
          ? 'border-border text-ink-3 cursor-not-allowed opacity-40'
          : 'border-border text-ink-2 hover:bg-muted hover:text-ink hover:border-border-strong'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
