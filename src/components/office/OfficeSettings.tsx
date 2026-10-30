import React, { useState } from 'react'
import type { Office, Membership, User } from '../../types'
import { Copy, Check, LogOut } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

interface OfficeSettingsProps {
  isOpen: boolean
  onClose: () => void
  office: Office
  memberships: Membership[]
  currentUser: User
  onRename: (name: string) => void
  onLeave: () => void
}

type SettingsTab = 'general' | 'members' | 'theme'

const ROLE_STYLE: Record<string, string> = {
  owner: 'bg-clay-soft text-clay border-clay/20',
  admin: 'bg-olive-soft text-olive border-olive/20',
  member: 'bg-muted text-ink-2 border-border',
}

export default function OfficeSettings({
  isOpen, onClose, office, memberships, currentUser, onRename, onLeave
}: OfficeSettingsProps) {
  const [tab, setTab] = useState<SettingsTab>('general')
  const [name, setName] = useState(office.name)
  const [copied, setCopied] = useState(false)
  const isOwner = office.ownerId === currentUser.id

  const copyInvite = () => {
    navigator.clipboard.writeText(`https://virtualoffice.app/join/${office.inviteCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Office Settings" size="md">
      {/* Tab bar */}
      <div className="flex gap-4 mb-5 border-b border-border -mx-5 px-5">
        {(['general', 'members', 'theme'] as SettingsTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2.5 text-[13px] font-medium capitalize transition-colors border-b-2 -mb-px
              focus:outline-none focus-visible:ring-2 focus-visible:ring-focus
              ${tab === t ? 'border-olive text-ink' : 'border-transparent text-ink-2 hover:text-ink'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="space-y-4">
          <div>
            <label className="type-label text-ink-2 block mb-1.5">Office Name</label>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={!isOwner}
                className="flex-1 h-9 bg-canvas border border-border rounded-[6px] px-3 text-[13px] text-ink
                  focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/30 disabled:opacity-50 disabled:bg-muted"
              />
              {isOwner && (
                <Button variant="secondary" size="sm" onClick={() => { onRename(name); onClose() }}>
                  Save
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className="type-label text-ink-2 block mb-1.5">Invite Link</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted border border-border rounded-[6px] px-3 py-2 type-small text-ink-2 font-mono truncate">
                virtualoffice.app/join/{office.inviteCode}
              </div>
              <Button
                variant={copied ? 'selected' : 'secondary'}
                size="sm"
                onClick={copyInvite}
                icon={copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.75} />}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <Button
              variant="destructive"
              size="sm"
              icon={<LogOut size={13} strokeWidth={1.75} />}
              onClick={() => { if (window.confirm('Leave this office?')) onLeave() }}
            >
              Leave Office
            </Button>
          </div>
        </div>
      )}

      {tab === 'members' && (
        <div className="space-y-0.5 max-h-64 overflow-y-auto">
          {memberships.map(m => (
            <div key={m.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
              <div className="type-body text-ink">
                {m.userId === currentUser.id ? 'You' : m.userId.replace('demo_', 'Member ')}
              </div>
              <span className={`type-small px-2 py-0.5 rounded border ${ROLE_STYLE[m.role]}`}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'theme' && (
        <div className="space-y-2">
          {(['cosy_studio', 'creative_loft', 'quiet_library'] as const).map(theme => (
            <button
              key={theme}
              disabled={!isOwner}
              className={`w-full p-3 rounded-lg border text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus
                ${office.theme === theme ? 'border-olive/40 bg-olive-soft' : 'border-border hover:border-border-strong'}
                ${!isOwner ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <p className={`type-label text-[13px] ${office.theme === theme ? 'text-olive' : 'text-ink'}`}>
                {theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              <p className="type-small text-ink-2 mt-0.5">
                {theme === 'cosy_studio' ? 'Warm oak floors, warm lighting' :
                  theme === 'creative_loft' ? 'Industrial, open, bright' :
                  'Quiet, minimal, focused'}
              </p>
            </button>
          ))}
          {!isOwner && <p className="type-small text-ink-3 text-center pt-1">Only the owner can change the theme</p>}
        </div>
      )}
    </Modal>
  )
}
