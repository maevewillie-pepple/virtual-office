import { useState, type ReactNode } from 'react'
import { ArrowLeft, Settings, Timer } from 'lucide-react'
import Button, { IconButton } from '../ui/Button'
import Tabs from '../ui/Tabs'
import SegmentedControl from '../ui/SegmentedControl'
import { Field, TextInput } from '../ui/Field'
import { Card, InteractiveCard } from '../ui/Card'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'

const SWATCHES = [
  ['Canvas', '#F7F5EF'],
  ['Surface', '#FFFEFA'],
  ['Muted', '#EEEBE2'],
  ['Ink', '#30352F'],
  ['Ink 2', '#666B60'],
  ['Olive', '#66765C'],
  ['Olive soft', '#E5EADD'],
  ['Clay', '#BA8C75'],
  ['Border', '#D9D6CD'],
  ['Success', '#4A7C59'],
  ['Warning', '#9A6F3A'],
  ['Error', '#B44A3F'],
] as const

export default function DesignSystemScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'general' | 'members'>('general')
  const [mode, setMode] = useState<'week' | 'month'>('week')
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-full bg-canvas text-ink">
      <header className="sticky top-0 z-10 border-b border-border bg-canvas/95">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-6">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[14px] text-ink-2 hover:text-ink">
            <ArrowLeft size={16} /> Back
          </button>
          <p className="font-display text-[13px] font-bold uppercase tracking-[0.16em]">Side desk</p>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="font-mono text-[13px] font-bold uppercase tracking-[0.16em] text-olive">Side desk</p>
        <h1 className="type-display-l mt-3 text-ink">Retro at the door. Clear where you work.</h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-7 text-ink-2">
          Brand, landing, navigation, and primary buttons use the stamp style: Space Mono, a hard outline, and a 2px offset shadow. Forms, tabs, dialogs, the café, and the arcade keep the quieter modern treatment so dense screens stay easy to use. Pixel art stays on avatars, rooms, and games.
        </p>

        <Section title="When to use what">
          <div className="grid gap-3 md:grid-cols-2">
            <Rule title="Button" body="Starts, saves, joins, or leaves. Stamp style everywhere, including inside a modern dialog." />
            <Rule title="Tab" body="Switches panels in the same view, such as General and Members." />
            <Rule title="Segmented control" body="Picks one mode, such as Practice or Two players." />
            <Rule title="Popover" body="A short control near its trigger, such as the focus timer." />
            <Rule title="Dialog" body="Settings, confirmations, and forms that need focus." />
            <Rule title="Pixel art" body="Avatars, office previews, café equipment, and arcade play. Not form labels." />
          </div>
        </Section>

        <Section title="Colour">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SWATCHES.map(([name, hex]) => (
              <div key={name} className="overflow-hidden rounded-[10px] border border-border bg-surface">
                <div className="h-14" style={{ background: hex }} />
                <p className="px-3 py-2 text-[14px]">{name}</p>
                <p className="px-3 pb-2 text-[13px] text-ink-2">{hex}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Type">
          <p className="type-display-l text-ink">Page title</p>
          <p className="type-h2 mt-4 text-ink">Section heading</p>
          <p className="type-h3 mt-3 text-ink">Card title</p>
          <p className="mt-3 max-w-xl text-[16px] leading-7 text-ink-2">Body text stays at 16px in DM Sans. Headings and button labels use Space Mono. Secondary text uses ink that stays readable.</p>
          <p className="mt-4 font-display text-[13px] font-bold uppercase tracking-[0.16em]">Side desk · wordmark</p>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Enter office</Button>
            <Button variant="secondary">Edit avatar</Button>
            <Button variant="ghost">Back</Button>
            <Button variant="destructive">Leave office</Button>
            <Button loading>Saving</Button>
            <Button disabled>Disabled</Button>
            <IconButton label="Settings"><Settings size={16} /></IconButton>
          </div>
        </Section>

        <Section title="Tabs and segmented controls">
          <Tabs label="Example settings" value={tab} onChange={setTab} tabs={[{ id: 'general', label: 'General' }, { id: 'members', label: 'Members' }]} />
          <div className="mt-4">
            <SegmentedControl label="Range" value={mode} onChange={setMode} options={[{ id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }]} />
          </div>
        </Section>

        <Section title="Fields, cards, and badges">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <Field label="Office name" hint="Shown on the dashboard.">
                <TextInput defaultValue="Studio Moth" />
              </Field>
              <div className="mt-3 flex gap-2">
                <Badge tone="olive">Owner</Badge>
                <Badge tone="success">Online</Badge>
                <Badge>Member</Badge>
              </div>
            </Card>
            <InteractiveCard>
              <p className="text-[16px] font-semibold">Create an office</p>
              <p className="mt-1 text-[14px] text-ink-2">Interactive cards are buttons. They show a hover border and a focus ring.</p>
            </InteractiveCard>
          </div>
        </Section>

        <Section title="Dialog and focus panel">
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setOpen(true)}>Open a dialog</Button>
          </div>
          <div className="mt-4 max-w-sm rounded-[14px] border border-border bg-surface p-4 shadow-[0_8px_24px_rgba(48,53,47,0.08)]">
            <div className="flex items-center justify-between">
              <p className="text-[16px] font-medium">Start a focus session</p>
              <Timer size={16} className="text-olive" />
            </div>
            <p className="mt-1 text-[14px] text-ink-2">A popover stays next to the toolbar. It is not a second modal.</p>
          </div>
        </Section>
      </main>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Leave this game?" description="The current run will not be saved." size="sm">
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Keep playing</Button>
          <Button onClick={() => setOpen(false)}>Leave</Button>
        </div>
      </Modal>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="type-h2 border-b border-border pb-2 text-ink">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Rule({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[14px] border border-border bg-surface p-4">
      <p className="text-[16px] font-semibold">{title}</p>
      <p className="mt-1 text-[14px] leading-6 text-ink-2">{body}</p>
    </div>
  )
}
