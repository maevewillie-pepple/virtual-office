import { useState } from 'react'
import type { Desk, User } from '../../types'
import { Monitor, Timer, RotateCcw } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

interface DeskModalProps {
  desk: Desk | null
  currentUser: User
  isOpen: boolean
  onClose: () => void
  onClaim: (deskId: string) => void
  onRelease: (deskId: string) => void
  onStartFocus: () => void
  onSit: () => void
  onKnock: () => void
  onLeaveNote: (text: string) => void
  note?: string
}

export default function DeskModal({
  desk, currentUser, isOpen, onClose, onClaim, onRelease, onStartFocus, onSit, onKnock, onLeaveNote, note,
}: DeskModalProps) {
  const [draft, setDraft] = useState('')
  if (!desk) return null

  const isMyDesk = desk.ownerId === currentUser.id
  const isOwnedByOther = !desk.isAvailable && !isMyDesk

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Desk ${desk.label}`} size="sm">
      <div className="space-y-3">
        {/* Status indicator */}
        <div className={`
          flex items-center gap-3 p-3 rounded-lg border
          ${desk.isAvailable ? 'bg-success-soft border-success/20' :
            isMyDesk ? 'bg-olive-soft border-olive/20' :
            'bg-muted border-border'}
        `}>
          <Monitor size={20} strokeWidth={1.75} className={
            desk.isAvailable ? 'text-success' : isMyDesk ? 'text-olive' : 'text-ink-3'
          } />
          <div>
            <p className={`type-label text-[13px]
              ${desk.isAvailable ? 'text-success' : isMyDesk ? 'text-olive' : 'text-ink-2'}`}>
              {desk.isAvailable ? 'Available' : isMyDesk ? 'Your desk' : 'Occupied'}
            </p>
            {desk.ownerName && (
              <p className="type-small text-ink-2 mt-0.5">
                {isMyDesk ? 'This is your claimed desk' : `Claimed by ${desk.ownerName}`}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {desk.isAvailable && (
            <>
              <Button className="w-full" onClick={() => { onClaim(desk.id); onClose() }}>
                Claim This Desk
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => { onSit(); onClose() }}>
                Sit down
              </Button>
            </>
          )}

          {isMyDesk && (
            <>
              <Button variant="secondary" className="w-full" onClick={() => { onSit(); onClose() }}>
                Sit down
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                icon={<Timer size={14} strokeWidth={1.75} />}
                onClick={onStartFocus}
              >
                Start Focus Session
              </Button>
              <Button
                variant="ghost"
                className="w-full text-ink-2"
                icon={<RotateCcw size={14} strokeWidth={1.75} />}
                onClick={() => { onRelease(desk.id); onClose() }}
              >
                Release Desk
              </Button>
            </>
          )}

          {isOwnedByOther && (
            <>
              <p className="text-center type-body text-ink-2 py-1">
                Claimed by {desk.ownerName}
              </p>
              <Button variant="secondary" className="w-full" onClick={() => { onKnock(); onClose() }}>
                Knock
              </Button>
              <form
                className="flex gap-2"
                onSubmit={e => {
                  e.preventDefault()
                  const text = draft.trim()
                  if (!text) return
                  onLeaveNote(text)
                  setDraft('')
                  onClose()
                }}
              >
                <input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder={note ? `Note: ${note}` : 'Leave a note'}
                  maxLength={80}
                  className="flex-1 px-2 py-1.5 rounded-md border border-border bg-canvas text-[12px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                />
                <Button type="submit" variant="secondary">Leave</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
