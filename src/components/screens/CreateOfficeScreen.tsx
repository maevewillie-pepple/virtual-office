import React, { useState } from 'react'
import { ArrowLeft, Check, Copy, ArrowRight } from 'lucide-react'
import { OFFICE_DESIGNS, type OfficeDesignId } from '../../data/officeMap'
import type { OfficeTheme } from '../../types'
import Button from '../ui/Button'

function themeFor(layout: OfficeDesignId): OfficeTheme {
  if (layout === 'library') return 'quiet_library'
  if (layout === 'loft') return 'creative_loft'
  return 'cosy_studio'
}

interface CreateOfficeScreenProps {
  onCreated: (draft: { name: string; description: string; theme: string; layout: OfficeDesignId; inviteCode: string }) => void | Promise<void>
  onBack: () => void
}

type Step = 1 | 2 | 3 | 4

const inputCls = `w-full h-10 bg-canvas border border-border px-3 text-[14px] text-ink
  placeholder-ink-3 transition-colors focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/30`

export default function CreateOfficeScreen({ onCreated, onBack }: CreateOfficeScreenProps) {
  const [step, setStep] = useState<Step>(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [layout, setLayout] = useState<OfficeDesignId>('classic')
  const [inviteCode] = useState(() =>
    Math.random().toString(36).slice(2, 6).toUpperCase() + '-' +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  )
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const copyLink = () => {
    navigator.clipboard.writeText(`https://sidedesk.app/join/${inviteCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const STEP_LABELS = ['Name', 'Layout', 'Privacy', 'Invite']

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas">
      <div className="w-full max-w-md fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13px] text-ink-2 hover:text-ink transition-colors mb-5 mx-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ArrowLeft size={14} strokeWidth={1.75} /> Back
          </button>
          <h1 className="type-h2 text-ink">Create your office</h1>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {STEP_LABELS.map((label, i) => {
              const s = (i + 1) as Step
              const done = step > s
              const active = step === s
              return (
                <React.Fragment key={label}>
                  <div className={`flex items-center gap-1.5 text-[12px] font-medium ${active ? 'text-ink' : done ? 'text-olive' : 'text-ink-3'}`}>
                    <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center border transition-colors
                      ${active ? 'bg-ink text-surface border-ink' :
                        done ? 'bg-olive-soft text-olive border-olive/40' :
                        'border-border text-ink-3'}`}>
                      {done ? <Check size={10} strokeWidth={2.5} /> : s}
                    </span>
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                  {i < 3 && <div className={`h-px w-5 ${done ? 'bg-olive/40' : 'bg-border'}`} />}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="type-h3 text-ink">Name your office</h2>
              <div>
                <label className="type-label text-ink-2 block mb-1.5">Office name *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Studio Moth, The Lab, Quiet Corner"
                  className={inputCls}
                  maxLength={40}
                />
              </div>
              <div>
                <label className="type-label text-ink-2 block mb-1.5">Description <span className="text-ink-3">(optional)</span></label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What's this office for?"
                  rows={2}
                  className={`${inputCls} h-auto py-2 resize-none`}
                  maxLength={120}
                />
              </div>
              <Button className="w-full" disabled={!name.trim()} icon={<ArrowRight size={14} strokeWidth={1.75} />} onClick={() => setStep(2)}>
                Next
              </Button>
            </div>
          )}

          {/* Step 2: Layout */}
          {step === 2 && (
            <div className="space-y-3">
              <h2 className="type-h3 text-ink">Choose a room</h2>
              <p className="type-small text-ink-2">This is the room the office opens in.</p>
              {OFFICE_DESIGNS.map(room => (
                <button
                  key={room.id}
                  onClick={() => setLayout(room.id)}
                  className={`w-full p-3.5 rounded-lg border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus
                    ${layout === room.id ? 'border-olive/40 bg-olive-soft' : 'border-border hover:border-border-strong'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{room.emoji}</span>
                    <div className="flex-1">
                      <p className={`type-label text-[13px] ${layout === room.id ? 'text-olive' : 'text-ink'}`}>
                        {room.name}
                      </p>
                      <p className="type-small text-ink-2 mt-0.5">{room.desc}</p>
                    </div>
                    {layout === room.id && <Check size={14} strokeWidth={2} className="text-olive flex-shrink-0" />}
                  </div>
                </button>
              ))}
              <div className="flex gap-2 pt-1">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(3)}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 3: Privacy */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="type-h3 text-ink">Privacy settings</h2>
              <div className="p-4 rounded-lg border border-olive/30 bg-olive-soft">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔒</span>
                  <div className="flex-1">
                    <p className="type-label text-ink">Private · Invite only</p>
                    <p className="type-small text-ink-2 mt-0.5">Only people with your invite link can join</p>
                  </div>
                  <span className="type-small text-olive border border-olive/30 px-2 py-0.5 bg-surface">Active</span>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border opacity-40 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌍</span>
                  <div>
                    <p className="type-label text-ink-2">Public directory (coming soon)</p>
                    <p className="type-small text-ink-3 mt-0.5">Anyone can discover and request to join</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(4)}>Create Office</Button>
              </div>
            </div>
          )}

          {/* Step 4: Invite */}
          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="text-4xl mb-1">🎉</div>
              <h2 className="type-h2 text-ink">{name} is ready!</h2>
              <p className="type-body text-ink-2">Share this link to invite your team</p>
              <div className="bg-muted border border-border rounded-lg p-3 text-left">
                <p className="type-small text-ink-3 mb-1">Invite link</p>
                <p className="type-small text-ink font-mono truncate">
                  sidedesk.app/join/{inviteCode}
                </p>
              </div>
              <Button
                variant={copied ? 'selected' : 'secondary'}
                className="w-full"
                onClick={copyLink}
                icon={copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.75} />}
              >
                {copied ? 'Copied!' : 'Copy invite link'}
              </Button>
              {error && <p className="text-[13px] leading-5 text-error" role="alert">{error}</p>}
              <Button className="w-full" loading={saving} onClick={() => {
                setSaving(true)
                setError('')
                Promise.resolve(onCreated({ name, description, theme: themeFor(layout), layout, inviteCode }))
                  .catch(err => setError(err instanceof Error ? err.message : 'Could not create the office.'))
                  .finally(() => setSaving(false))
              }} icon={<ArrowRight size={14} strokeWidth={1.75} />}>
                Enter Your Office
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
