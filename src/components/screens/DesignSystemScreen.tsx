import React, { useState } from 'react'
import {
  Monitor, Coffee, MessageSquare, Music, Lock, Timer, Settings,
  Plus, ArrowRight, Check, Copy, X, LogOut, UserPlus, Info,
  AlertTriangle, XCircle, CheckCircle, ExternalLink, ChevronUp,
  PanelRightClose, Headphones, Hand, Smile, RotateCcw, Send,
} from 'lucide-react'
import Button, { IconButton } from '../ui/Button'

/* ─── Palette swatch ──────────────────────────────────────────── */
const SWATCHES = [
  { name: 'Canvas',         hex: '#F7F5EF', cls: 'bg-canvas',       text: 'text-ink' },
  { name: 'Surface',        hex: '#FFFEFA', cls: 'bg-surface',       text: 'text-ink' },
  { name: 'Muted',          hex: '#EEEBE2', cls: 'bg-muted',         text: 'text-ink' },
  { name: 'Border',         hex: '#D9D6CD', cls: 'bg-border',        text: 'text-ink' },
  { name: 'Border strong',  hex: '#A9AB9F', cls: 'bg-border-strong', text: 'text-surface' },
  { name: 'Ink',            hex: '#30352F', cls: 'bg-ink',           text: 'text-surface' },
  { name: 'Ink 2',          hex: '#666B60', cls: 'bg-ink-2',         text: 'text-surface' },
  { name: 'Ink 3',          hex: '#A9AB9F', cls: 'bg-ink-3',         text: 'text-surface' },
  { name: 'Olive',          hex: '#66765C', cls: 'bg-olive',         text: 'text-surface' },
  { name: 'Olive soft',     hex: '#E5EADD', cls: 'bg-olive-soft',    text: 'text-ink' },
  { name: 'Clay',           hex: '#BA8C75', cls: 'bg-clay',          text: 'text-surface' },
  { name: 'Clay soft',      hex: '#F2E3D9', cls: 'bg-clay-soft',     text: 'text-ink' },
  { name: 'Success',        hex: '#4A7C59', cls: 'bg-success',       text: 'text-surface' },
  { name: 'Success soft',   hex: '#E2EFE6', cls: 'bg-success-soft',  text: 'text-ink' },
  { name: 'Warning soft',   hex: '#FDF3E0', cls: 'bg-warning-soft',  text: 'text-ink' },
  { name: 'Error',          hex: '#B44A3F', cls: 'bg-error',         text: 'text-surface' },
  { name: 'Error soft',     hex: '#FDECEA', cls: 'bg-error-soft',    text: 'text-ink' },
]

/* ─── Icons list ──────────────────────────────────────────────── */
const ICONS = [
  Monitor, Coffee, MessageSquare, Music, Lock, Timer, Settings,
  Plus, ArrowRight, Check, Copy, X, LogOut, UserPlus, Info,
  AlertTriangle, XCircle, CheckCircle, ExternalLink, ChevronUp,
  PanelRightClose, Headphones, Hand, Smile, RotateCcw, Send,
]

/* ─── Section wrapper ────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="type-h2 text-ink mb-6 pb-3 border-b border-border">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-3">
      <span className="type-small text-ink-3 w-28 shrink-0">{label}</span>
      <div className="flex items-center gap-3 flex-wrap">{children}</div>
    </div>
  )
}

export default function DesignSystemScreen() {
  const [checked, setChecked] = useState(false)

  return (
    <div className="min-h-screen bg-canvas py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-14 pb-8 border-b border-border">
          <p className="type-label text-ink-3 uppercase tracking-widest mb-3">Virtual Office</p>
          <h1 className="type-display-l font-display text-ink mb-4">Warm Editorial</h1>
          <p className="type-body-lg text-ink-2">Design system · Tokens, typography, components and patterns.</p>
        </header>

        {/* Colours */}
        <Section title="Colours">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {SWATCHES.map(s => (
              <div key={s.name} className="rounded-lg overflow-hidden border border-border">
                <div className={`h-14 ${s.cls}`} />
                <div className="bg-surface px-2 py-1.5">
                  <p className="type-label text-ink text-[11px]">{s.name}</p>
                  <p className="type-small text-ink-3 font-mono">{s.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <div className="space-y-5">
            <div>
              <p className="type-small text-ink-3 mb-1">Display XL · Space Mono 48/56 700</p>
              <p className="type-display-xl font-display text-ink">The office</p>
            </div>
            <div>
              <p className="type-small text-ink-3 mb-1">Display L · Space Mono 34/42 700</p>
              <p className="type-display-l font-display text-ink">Your cosy corner</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="type-small text-ink-3 mb-1">H1 · DM Sans 30/38 600</p>
                <p className="type-h1 text-ink">Your offices</p>
              </div>
              <div>
                <p className="type-small text-ink-3 mb-1">H2 · DM Sans 24/32 600</p>
                <p className="type-h2 text-ink">Create your office</p>
              </div>
              <div>
                <p className="type-small text-ink-3 mb-1">H3 · DM Sans 18/26 600</p>
                <p className="type-h3 text-ink">Name your office</p>
              </div>
              <div>
                <p className="type-small text-ink-3 mb-1">Body large · 16/25</p>
                <p className="type-body-lg text-ink-2">A persistent virtual office for remote teams.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="type-small text-ink-3 mb-1">Body · 14/22</p>
                <p className="type-body text-ink">Office chat and messages</p>
              </div>
              <div>
                <p className="type-small text-ink-3 mb-1">Small · 12/18</p>
                <p className="type-small text-ink-2">Member since 08/01/2024</p>
              </div>
              <div>
                <p className="type-small text-ink-3 mb-1">Label · 12/16 500</p>
                <p className="type-label text-ink">Office name *</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Buttons">
          <Row label="Primary">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="Secondary">
            <Button variant="secondary" size="sm">Small</Button>
            <Button variant="secondary">Default</Button>
            <Button variant="secondary" size="lg">Large</Button>
          </Row>
          <Row label="Ghost">
            <Button variant="ghost" size="sm">Small</Button>
            <Button variant="ghost">Default</Button>
            <Button variant="ghost" size="lg">Large</Button>
          </Row>
          <Row label="Selected">
            <Button variant="selected"><Check size={14} strokeWidth={2} /> Selected</Button>
          </Row>
          <Row label="Destructive">
            <Button variant="destructive" icon={<LogOut size={14} strokeWidth={1.75} />}>Leave Office</Button>
          </Row>
          <Row label="With icons">
            <Button icon={<Plus size={14} strokeWidth={1.75} />}>Create</Button>
            <Button variant="secondary" iconRight={<ArrowRight size={14} strokeWidth={1.75} />}>Next</Button>
            <Button loading>Loading…</Button>
          </Row>
          <Row label="Disabled">
            <Button disabled>Disabled</Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </Row>
          <Row label="Icon only">
            <IconButton label="Settings"><Settings size={16} strokeWidth={1.75} /></IconButton>
            <IconButton label="Close" variant="secondary"><X size={16} strokeWidth={1.75} /></IconButton>
          </Row>
        </Section>

        {/* Form controls */}
        <Section title="Form controls">
          <div className="space-y-4 max-w-sm">
            <div>
              <label className="type-label text-ink-2 block mb-1.5">Text input</label>
              <input
                placeholder="e.g. Studio Moth"
                className="w-full h-10 bg-canvas border border-border px-3 text-[14px] text-ink
                  placeholder-ink-3 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/30"
              />
            </div>
            <div>
              <label className="type-label text-ink-2 block mb-1.5">Textarea</label>
              <textarea
                placeholder="What's this office for?"
                rows={2}
                className="w-full bg-canvas border border-border px-3 py-2 text-[14px] text-ink
                  placeholder-ink-3 resize-none focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/30"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                role="checkbox"
                aria-checked={checked}
                onClick={() => setChecked(c => !c)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-focus
                  ${checked ? 'bg-olive border-olive' : 'bg-surface border-border hover:border-border-strong'}`}
              >
                {checked && <Check size={10} strokeWidth={3} className="text-surface" />}
              </button>
              <label className="type-body text-ink cursor-pointer" onClick={() => setChecked(c => !c)}>
                Private · Invite only
              </label>
            </div>
          </div>
        </Section>

        {/* Cards & Panels */}
        <Section title="Cards &amp; Panels">
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg mb-3">🦋</div>
              <h3 className="type-label text-ink text-[14px] font-semibold mb-0.5">Studio Moth</h3>
              <p className="type-small text-ink-2 mb-3">Our cosy little corner for making things</p>
              <div className="flex items-center justify-between">
                <span className="type-small text-ink-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" /> 4 online
                </span>
                <Button variant="secondary" size="sm">Enter</Button>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-olive-soft bg-olive-soft">
              <p className="type-label text-olive mb-1">Selected state</p>
              <p className="type-small text-olive/80">Active card with olive-soft background</p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="p-4 rounded-lg border border-border bg-surface mb-4">
            <p className="type-label text-ink-2 mb-3 uppercase tracking-wider text-[11px]">Status indicators</p>
            <div className="flex flex-wrap gap-4">
              {[
                { dot: 'bg-success', label: 'Online' },
                { dot: 'bg-clay',    label: 'Focusing' },
                { dot: 'bg-warning', label: 'On Break' },
                { dot: 'bg-ink-3',   label: 'Away' },
                { dot: 'bg-border',  label: 'Offline' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className="type-small text-ink-2">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="type-small text-olive border border-olive/30 px-2 py-0.5 bg-olive-soft">Owner</span>
            <span className="type-small text-clay border border-clay/20 px-2 py-0.5 bg-clay-soft">Admin</span>
            <span className="type-small text-ink-2 border border-border px-2 py-0.5 bg-muted">Member</span>
            <span className="type-small text-success border border-success/20 px-2 py-0.5 bg-success-soft">Active</span>
            <span className="type-small text-error border border-error/20 px-2 py-0.5 bg-error-soft">Error</span>
          </div>
        </Section>

        {/* Chat messages */}
        <Section title="Chat messages">
          <div className="bg-surface border border-border rounded-xl p-4 space-y-4 max-w-sm">
            {/* Received */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-full bg-muted" />
                <span className="type-small font-medium text-ink">Mia Chen</span>
                <span className="type-small text-ink-3">18:15</span>
              </div>
              <div className="rounded-xl rounded-bl-sm bg-muted border border-border px-3 py-2 text-[13px] text-ink max-w-[80%]">
                On my way! Anyone grabbing coffee?
              </div>
              <div className="flex gap-1 mt-1">
                <span className="text-[12px] bg-muted border border-border rounded-full px-2 py-0.5 flex items-center gap-1">
                  ☕ <span className="type-small text-ink-3">2</span>
                </span>
              </div>
            </div>
            {/* Sent */}
            <div className="flex flex-col items-end">
              <div className="rounded-xl rounded-br-sm bg-olive-soft border border-olive/20 px-3 py-2 text-[13px] text-ink max-w-[80%]">
                Just finished a focus session — heading there now!
              </div>
              <p className="type-small text-ink-3 mt-0.5">18:16</p>
            </div>
            {/* System */}
            <div className="rounded-xl bg-clay-soft border border-clay/20 px-3 py-1.5 text-[12px] text-clay italic text-center">
              Rowan joined the lounge
            </div>
          </div>
        </Section>

        {/* Icons */}
        <Section title="Icons">
          <p className="type-small text-ink-3 mb-4">lucide-react · 18px default · strokeWidth 1.75</p>
          <div className="grid grid-cols-8 sm:grid-cols-12 gap-3">
            {ICONS.map((Icon, i) => (
              <div key={i} className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface border border-border text-ink-2 hover:bg-muted hover:text-ink transition-colors">
                <Icon size={18} strokeWidth={1.75} />
              </div>
            ))}
          </div>
        </Section>

        {/* Focus timer example */}
        <Section title="Toolbar &amp; Focus timer">
          <div className="inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-xl border border-border bg-surface shadow-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-olive-soft border border-olive/30 text-[12px] font-medium text-olive">
              <Timer size={14} strokeWidth={1.75} />
              <span>24:58</span>
              <X size={12} strokeWidth={1.75} className="text-olive/60" />
            </div>
            <div className="w-px h-5 bg-border mx-1" />
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-ink-2 hover:text-ink hover:bg-muted transition-colors">
              <Coffee size={16} strokeWidth={1.75} /> <span>Break</span>
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-ink-2 hover:text-ink hover:bg-muted transition-colors">
              <Music size={16} strokeWidth={1.75} /> <span>Music</span>
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-ink-2 hover:text-ink hover:bg-muted transition-colors">
              <Smile size={16} strokeWidth={1.75} /> <span>React</span>
            </button>
          </div>
        </Section>

        {/* Empty state */}
        <Section title="Empty states">
          <div className="flex flex-col items-center py-12 text-center border border-dashed border-border rounded-xl bg-surface">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare size={20} strokeWidth={1.75} className="text-ink-3" />
            </div>
            <p className="type-body text-ink mb-1">No messages yet</p>
            <p className="type-small text-ink-2 max-w-xs">Say hello to your team – they're waiting in the office.</p>
          </div>
        </Section>

        <footer className="pt-8 border-t border-border text-center">
          <p className="type-small text-ink-3">Virtual Office · Warm Editorial Design System · 2026</p>
        </footer>
      </div>
    </div>
  )
}
