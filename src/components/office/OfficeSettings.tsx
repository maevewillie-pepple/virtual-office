import React, { useState } from 'react'
import type { Office, Membership, User } from '../../types'
import { OFFICE_DESIGNS, layoutOfOffice } from '../../data/officeMap'
import { Copy, Check, LogOut } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Tabs from '../ui/Tabs'
import { Field, TextInput } from '../ui/Field'
import Badge from '../ui/Badge'

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

const ROLE_TONE = { owner: 'clay', admin: 'olive', member: 'muted' } as const

export default function OfficeSettings({
  isOpen, onClose, office, memberships, currentUser, onRename, onLeave
}: OfficeSettingsProps) {
  const [tab, setTab] = useState<SettingsTab>('general')
  const [name, setName] = useState(office.name)
  const [copied, setCopied] = useState(false)
  const isOwner = office.ownerId === currentUser.id

  const copyInvite = () => {
    navigator.clipboard.writeText(`https://sidedesk.app/join/${office.inviteCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Office settings" description="Name, people, and the room chosen for this office." size="md">
      <Tabs
        label="Office settings"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'general', label: 'General' },
          { id: 'members', label: 'Members' },
          { id: 'theme', label: 'Theme' },
        ]}
      />

      {tab === 'general' && (
        <div className="mt-5 space-y-5" role="tabpanel" id="panel-general">
          <Field label="Office name" htmlFor="office-name">
            <div className="flex gap-2">
              <TextInput id="office-name" value={name} onChange={e => setName(e.target.value)} disabled={!isOwner} />
              {isOwner && (
                <Button variant="secondary" onClick={() => { onRename(name); onClose() }}>Save</Button>
              )}
            </div>
          </Field>

          <Field label="Invite link" hint="Anyone with this link can join from the dashboard.">
            <div className="flex gap-2">
              <div className="flex h-11 min-w-0 flex-1 items-center truncate rounded-[10px] border border-border bg-muted px-3 text-[14px] text-ink-2">
                sidedesk.app/join/{office.inviteCode}
              </div>
              <Button
                variant={copied ? 'selected' : 'secondary'}
                onClick={copyInvite}
                icon={copied ? <Check size={16} strokeWidth={2} /> : <Copy size={16} strokeWidth={1.75} />}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </Field>

          <div className="border-t border-border pt-4">
            <Button
              variant="destructive"
              icon={<LogOut size={16} strokeWidth={1.75} />}
              onClick={() => { if (window.confirm('Leave this office?')) onLeave() }}
            >
              Leave office
            </Button>
          </div>
        </div>
      )}

      {tab === 'members' && (
        <div className="mt-4 max-h-64 space-y-1 overflow-y-auto" role="tabpanel" id="panel-members">
          {memberships.map(membership => (
            <div key={membership.userId} className="flex items-center justify-between rounded-[10px] px-2 py-2 hover:bg-muted">
              <p className="text-[15px] text-ink">
                {membership.userId === currentUser.id ? 'You' : membership.userId.replace('demo_', 'Member ')}
              </p>
              <Badge tone={ROLE_TONE[membership.role]}>{membership.role}</Badge>
            </div>
          ))}
        </div>
      )}

      {tab === 'theme' && (
        <div className="mt-5 rounded-[14px] border border-border p-4" role="tabpanel" id="panel-theme">
          {(() => {
            const room = OFFICE_DESIGNS.find(design => design.id === layoutOfOffice(office))
            return (
              <>
                <p className="text-[16px] font-medium text-ink">{room?.emoji} {room?.name}</p>
                <p className="mt-1 text-[14px] leading-6 text-ink-2">{room?.desc}</p>
                <p className="mt-3 text-[14px] text-ink-2">This room was chosen when the office was created.</p>
              </>
            )
          })()}
        </div>
      )}
    </Modal>
  )
}
