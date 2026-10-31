import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode, type RefObject } from 'react'
import type { Office, OfficeArtTheme, OfficeMembership, PresenceStatus, User } from '../../types'
import { demoMemberships, demoUsers } from '../../data/mockData'
import { OFFICE_DESIGNS, layoutOfOffice } from '../../data/officeMap'
import { LogIn, MoreHorizontal, Plus, Settings } from 'lucide-react'
import AvatarSprite from '../ui/AvatarSprite'
import { inviteCodeFromInput, inviteLink } from '../../utils/invite'
import {
  drawBookshelf,
  drawChair,
  drawDesk,
  drawLamp,
  drawPlantFlowers,
  drawPlantLarge,
  drawPlantSmall,
  drawSofaH,
  drawWindowH,
} from '../../utils/pixelArt'

interface DashboardScreenProps {
  currentUser: User
  offices: Office[]
  signedIn: boolean
  onEnterOffice: (officeId: string) => void
  onCreateOffice: () => void
  onEditAvatar: () => void
  onUpdateName: (name: string) => void
  onLogout: () => void
  onSignIn: () => void
  onHome: () => void
  lastVisitedId?: string | null
  roles?: Record<string, OfficeMembership>
  onJoinCode?: (code: string) => Promise<string>
  onImport?: () => Promise<void>
}

const STATUS_LABEL: Record<PresenceStatus, string> = {
  online: 'Online',
  focusing: 'Focusing',
  on_break: 'On a break',
  away: 'Away',
  do_not_disturb: 'Do not disturb',
  offline: 'Offline',
}

const STATUS_DOT: Record<PresenceStatus, string> = {
  online: 'bg-success',
  focusing: 'bg-olive',
  on_break: 'bg-clay',
  away: 'bg-warning',
  do_not_disturb: 'bg-error',
  offline: 'bg-ink-3',
}

const ROLE_LABEL: Record<OfficeMembership, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
}

type DrawFn = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void

const ROOM_BACKDROP: Record<OfficeArtTheme, string> = {
  classic: '#E7D7C1',
  library: '#E5EADD',
  loft: '#F3E6DC',
  studio: '#E4EDD8',
  lab: '#E4E7EE',
}

const ROOM_SCENES: Record<OfficeArtTheme, { draw: DrawFn; x: number; y: number; size: number }[]> = {
  classic: [
    { draw: drawDesk, x: 78, y: 18, size: 72 },
    { draw: drawChair, x: 150, y: 28, size: 56 },
    { draw: drawPlantSmall, x: 28, y: 36, size: 48 },
  ],
  library: [
    { draw: drawBookshelf, x: 36, y: 8, size: 72 },
    { draw: drawBookshelf, x: 108, y: 8, size: 72 },
    { draw: drawPlantSmall, x: 184, y: 36, size: 48 },
  ],
  loft: [
    { draw: drawWindowH, x: 28, y: 4, size: 64 },
    { draw: drawSofaH, x: 108, y: 28, size: 80 },
    { draw: drawPlantSmall, x: 196, y: 34, size: 44 },
  ],
  studio: [
    { draw: drawPlantLarge, x: 16, y: 8, size: 72 },
    { draw: drawDesk, x: 96, y: 18, size: 68 },
    { draw: drawPlantFlowers, x: 176, y: 32, size: 52 },
  ],
  lab: [
    { draw: drawDesk, x: 64, y: 16, size: 72 },
    { draw: drawLamp, x: 148, y: 8, size: 56 },
    { draw: drawChair, x: 188, y: 30, size: 48 },
  ],
}

function roleFor(office: Office, userId: string, roles?: Record<string, OfficeMembership>): OfficeMembership {
  if (roles?.[office.id]) return roles[office.id]
  if (office.ownerId === userId) return 'owner'
  return demoMemberships.find(membership => membership.officeId === office.id && membership.userId === userId)?.role ?? 'member'
}

function presentPeople(office: Office, currentUser: User): User[] {
  if (/^[0-9a-f-]{36}$/i.test(office.id)) {
    return currentUser.status === 'offline' ? [] : [currentUser]
  }
  const known = demoMemberships
    .filter(membership => membership.officeId === office.id)
    .map(membership => membership.userId === currentUser.id
      ? currentUser
      : demoUsers.find(user => user.id === membership.userId))
    .filter((user): user is User => !!user)
    .filter(user => user.status === 'online' || user.status === 'focusing')

  if (known.length > 0) return known.slice(0, 4)
  if (office.onlineCount > 0 && office.ownerId === currentUser.id && (currentUser.status === 'online' || currentUser.status === 'focusing')) {
    return [currentUser]
  }
  return []
}

function RoomPreview({ layout }: { layout: OfficeArtTheme }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = ROOM_BACKDROP[layout]
    ctx.fillRect(0, 0, 260, 104)
    ctx.fillStyle = 'rgba(48,53,47,0.08)'
    ctx.fillRect(0, 92, 260, 12)
    for (const piece of ROOM_SCENES[layout]) piece.draw(ctx, piece.x, piece.y, piece.size)
  }, [layout])

  return (
    <canvas
      ref={ref}
      width={260}
      height={104}
      aria-hidden
      className="h-full w-full object-cover [image-rendering:pixelated]"
    />
  )
}

const stampButton =
  'btn-stamp inline-flex items-center justify-center gap-2 border-2 border-ink font-mono text-[13px] font-bold uppercase tracking-wide ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface ' +
  'disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-ink-2'

function PrimaryButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`${stampButton} h-9 bg-ink px-3.5 text-surface ${className}`}
      style={{ ['--btn-shadow' as string]: '2px 2px 0 #66765C' }}
      {...props}
    />
  )
}

function SecondaryButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`${stampButton} h-9 bg-surface px-3.5 text-ink hover:bg-muted ${className}`}
      style={{ ['--btn-shadow' as string]: '2px 2px 0 #A9AB9F' }}
      {...props}
    />
  )
}

export default function DashboardScreen({
  currentUser, offices, signedIn, onEnterOffice, onCreateOffice,
  onEditAvatar, onUpdateName, onLogout, onSignIn, onHome, lastVisitedId,
  roles, onJoinCode, onImport,
}: DashboardScreenProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [joining, setJoining] = useState(false)
  const [importing, setImporting] = useState(false)
  const [menuOfficeId, setMenuOfficeId] = useState<string | null>(null)
  const [details, setDetails] = useState<Office | null>(null)
  const [code, setCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [name, setName] = useState(currentUser.name)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const joinButtonRef = useRef<HTMLButtonElement>(null)
  const joinInputRef = useRef<HTMLInputElement>(null)
  const settingsNameRef = useRef<HTMLInputElement>(null)
  const joinTitleId = useId()
  const settingsTitleId = useId()
  const detailsTitleId = useId()

  const lastVisited = offices.find(office => office.id === lastVisitedId) ?? null

  useEffect(() => { setName(currentUser.name) }, [currentUser.name])

  useEffect(() => {
    if (!profileOpen) return
    const close = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [profileOpen])

  useEffect(() => {
    if (!menuOfficeId) return
    const close = () => setMenuOfficeId(null)
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOfficeId])

  useDialog(joinOpen, () => setJoinOpen(false), joinInputRef)
  useDialog(settingsOpen, () => setSettingsOpen(false), settingsNameRef)

  const join = async () => {
    const trimmed = inviteCodeFromInput(code)
    if (!trimmed) {
      setJoinError('Enter an invite code.')
      return
    }
    if (onJoinCode) {
      setJoining(true)
      setJoinError('')
      try {
        const id = await onJoinCode(trimmed)
        setJoinOpen(false)
        setCode('')
        onEnterOffice(id)
      } catch (error) {
        setJoinError(error instanceof Error ? error.message : 'No office uses that code.')
      } finally {
        setJoining(false)
      }
      return
    }
    const match = offices.find(office => office.inviteCode.toUpperCase() === trimmed.toUpperCase())
    if (!match) {
      setJoinError('No office uses that code.')
      return
    }
    setJoinError('')
    setJoinOpen(false)
    setCode('')
    onEnterOffice(match.id)
  }

  const copyInvite = async (office: Office) => {
    try {
      await navigator.clipboard.writeText(inviteLink(office.inviteCode))
      setCopiedId(office.id)
      window.setTimeout(() => setCopiedId(current => current === office.id ? null : current), 2000)
    } catch {
      setCopiedId(null)
    }
  }

  const saveName = () => {
    const next = name.trim()
    if (!next) return
    onUpdateName(next)
    setSettingsOpen(false)
  }

  return (
    <div className="min-h-full bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-border bg-canvas/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between gap-4 px-5 sm:px-8">
          <button
            type="button"
            onClick={onHome}
            className="flex items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <img src="/logo.png" alt="" width={48} height={44} className="h-12 w-12 object-contain [image-rendering:pixelated]" />
            <span className="font-display text-[13px] font-bold uppercase tracking-[0.18em]">Side desk</span>
          </button>

          <div className="relative flex items-center gap-2" ref={profileRef}>
            <button
              type="button"
              aria-label="Profile settings"
              onClick={() => { setProfileOpen(false); setSettingsOpen(true) }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <Settings size={18} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label={`${currentUser.name}, open profile menu`}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              onClick={() => setProfileOpen(open => !open)}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-olive-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <AvatarSprite config={currentUser.avatar} status={currentUser.status} name="" size={40} />
            </button>
            {profileOpen && (
              <div role="menu" aria-label="Profile" className="absolute right-0 top-12 z-30 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-[0_12px_32px_rgba(48,53,47,0.08)]">
                <div className="px-2.5 py-2">
                  <p className="truncate text-[14px] font-medium">{currentUser.name}</p>
                  <p className="truncate text-[12px] text-ink-3">{signedIn ? currentUser.email : 'Not signed in'}</p>
                </div>
                <MenuItem onClick={() => { setProfileOpen(false); onEditAvatar() }}>Edit avatar</MenuItem>
                <MenuItem onClick={() => { setProfileOpen(false); setSettingsOpen(true) }}>Profile settings</MenuItem>
                {signedIn ? (
                  <MenuItem onClick={() => { setProfileOpen(false); onLogout() }} tone="danger">Log out</MenuItem>
                ) : (
                  <MenuItem onClick={() => { setProfileOpen(false); onSignIn() }}>Sign in</MenuItem>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 sm:py-10">
        <div className="max-w-xl">
          <h1 className="type-display-l text-ink">Your workspace</h1>
          <p className="mt-3 text-[16px] leading-6 text-ink-2">Pick up where you left off.</p>
          {lastVisited && (
            <button
              type="button"
              onClick={() => onEnterOffice(lastVisited.id)}
              className="mt-3 text-[13px] text-olive underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              Last visited · {lastVisited.name}
            </button>
          )}
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:gap-8">
          <section aria-labelledby="avatar-heading">
            <h2 id="avatar-heading" className="text-[18px] font-semibold leading-6">Your avatar</h2>
            <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
            <div
              className="mx-auto flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border border-olive-dim"
              style={{
                backgroundColor: '#E5EADD',
                backgroundImage: 'radial-gradient(#D4DBC9 1.25px, transparent 1.25px)',
                backgroundSize: '14px 14px',
              }}
            >
              <AvatarSprite
                config={currentUser.avatar}
                status={currentUser.status}
                name=""
                size={96}
                className="h-40 w-40"
                style={{ width: 160, height: 160 }}
              />
            </div>
            <p className="mt-4 text-center text-[18px] font-semibold leading-6">{currentUser.name}</p>
            <p className="mt-1 flex items-center justify-center gap-2 text-[13px] text-ink-2">
              <span className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[currentUser.status]}`} aria-hidden />
              {STATUS_LABEL[currentUser.status]}
            </p>
            <PrimaryButton className="mt-5 w-full" onClick={onEditAvatar}>Edit avatar</PrimaryButton>
            </div>
          </section>

          <section aria-labelledby="offices-heading">
            <h2 id="offices-heading" className="text-[18px] font-semibold leading-6">Your offices</h2>
            {onImport && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-border bg-surface px-4 py-3">
                <p className="text-[14px] leading-5 text-ink">Bring this browser’s offices and room notes into your account. Nothing is deleted from this browser.</p>
                <SecondaryButton disabled={importing} onClick={() => { setImporting(true); void onImport().finally(() => setImporting(false)) }}>
                  {importing ? 'Importing' : 'Import'}
                </SecondaryButton>
              </div>
            )}
            {offices.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
                <div className="mx-auto h-28 w-56 overflow-hidden rounded-xl">
                  <RoomPreview layout="classic" />
                </div>
                <h3 className="type-h1 mt-5 text-ink">Your next workspace starts here.</h3>
                <p className="mx-auto mt-2 max-w-sm text-[14px] leading-6 text-ink-2">Create a space or join your friends to get started.</p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {offices.map(office => (
                  <OfficeCard
                    key={office.id}
                    office={office}
                    role={roleFor(office, currentUser.id, roles)}
                    people={presentPeople(office, currentUser)}
                    menuOpen={menuOfficeId === office.id}
                    copied={copiedId === office.id}
                    onToggleMenu={() => setMenuOfficeId(current => current === office.id ? null : office.id)}
                    onEnter={() => onEnterOffice(office.id)}
                    onDetails={() => { setMenuOfficeId(null); setDetails(office) }}
                    onCopy={() => { setMenuOfficeId(null); void copyInvite(office) }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCreateOffice}
            className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5 text-left transition-colors hover:border-olive/50 hover:bg-olive-soft/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive-soft text-olive">
              <Plus size={18} strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-[15px] font-semibold">Create an office</span>
              <span className="mt-0.5 block text-[13px] leading-5 text-ink-2">Start a new shared workspace.</span>
            </span>
          </button>
          <button
            type="button"
            ref={joinButtonRef}
            onClick={() => { setJoinError(''); setJoinOpen(true) }}
            className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5 text-left transition-colors hover:border-olive/50 hover:bg-olive-soft/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive-soft text-olive">
              <LogIn size={18} strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-[15px] font-semibold">Join an office</span>
              <span className="mt-0.5 block text-[13px] leading-5 text-ink-2">Have an invite code? Join your people.</span>
            </span>
          </button>
        </div>
      </main>

      {settingsOpen && (
        <Dialog titleId={settingsTitleId} title="Profile settings" onClose={() => setSettingsOpen(false)}>
          <p className="text-[13px] leading-5 text-ink-2">Your name is what people see in the office.</p>
          <label className="mt-4 block">
            <span className="text-[13px] font-medium">Display name</span>
            <input
              ref={settingsNameRef}
              value={name}
              onChange={event => setName(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-canvas px-3 text-[14px] text-ink focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/30"
            />
          </label>
          <p className="mt-3 text-[13px] text-ink-2">{signedIn ? currentUser.email : 'Sign in to keep this profile on this computer.'}</p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {signedIn ? (
              <button type="button" onClick={onLogout} className="text-[13px] text-error hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                Log out
              </button>
            ) : (
              <button type="button" onClick={onSignIn} className="text-[13px] text-olive hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                Sign in
              </button>
            )}
            <div className="flex gap-2">
              <SecondaryButton onClick={onEditAvatar}>Edit avatar</SecondaryButton>
              <PrimaryButton onClick={saveName} disabled={!name.trim()}>Save name</PrimaryButton>
            </div>
          </div>
        </Dialog>
      )}

      {joinOpen && (
        <Dialog titleId={joinTitleId} title="Join an office" onClose={() => setJoinOpen(false)}>
          <p className="text-[13px] leading-5 text-ink-2">Paste the code from an invite.</p>
          <label className="mt-4 block">
            <span className="text-[13px] font-medium">Invite code</span>
            <input
              ref={joinInputRef}
              value={code}
              onChange={event => { setCode(event.target.value.replace(/\s+/g, '')); setJoinError('') }}
              onKeyDown={event => { if (event.key === 'Enter') join() }}
              placeholder="XXXX-XXXX"
              autoCapitalize="characters"
              spellCheck={false}
              aria-invalid={!!joinError}
              aria-describedby={joinError ? 'join-error' : undefined}
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-canvas px-3 font-mono text-[14px] uppercase text-ink placeholder:text-ink-3 focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/30"
            />
          </label>
          {joinError && <p id="join-error" role="alert" className="mt-2 text-[13px] text-error">{joinError}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <SecondaryButton onClick={() => setJoinOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={() => { void join() }} disabled={joining}>Join</PrimaryButton>
          </div>
        </Dialog>
      )}

      {details && (
        <Dialog titleId={detailsTitleId} title={details.name} onClose={() => setDetails(null)}>
          <OfficeDetails
            office={details}
            role={roleFor(details, currentUser.id, roles)}
            copied={copiedId === details.id}
            onCopy={() => void copyInvite(details)}
            onEnter={() => onEnterOffice(details.id)}
          />
        </Dialog>
      )}
    </div>
  )
}

function OfficeCard({
  office, role, people, menuOpen, copied, onToggleMenu, onEnter, onDetails, onCopy,
}: {
  office: Office
  role: OfficeMembership
  people: User[]
  menuOpen: boolean
  copied: boolean
  onToggleMenu: () => void
  onEnter: () => void
  onDetails: () => void
  onCopy: () => void
}) {
  const layout = layoutOfOffice(office)
  const design = OFFICE_DESIGNS.find(item => item.id === layout)
  const canInvite = role === 'owner' || role === 'admin'
  const menuId = `office-menu-${office.id}`

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-surface transition-colors hover:border-olive/40 motion-safe:hover:shadow-[0_10px_28px_rgba(48,53,47,0.06)]">
      <div className="h-28 overflow-hidden rounded-t-2xl border-b border-border">
        <RoomPreview layout={layout} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[16px] font-semibold leading-6">{office.name}</h3>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${role === 'member' ? 'bg-muted text-ink-2' : 'bg-olive-soft text-olive'}`}>
            {ROLE_LABEL[role]}
          </span>
        </div>
        <p className="mt-1 text-[13px] leading-5 text-ink-2">{office.description}</p>
        <p className="mt-2 text-[12px] text-ink-3">{design?.name ?? 'Office'}</p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            {people.length > 0 && (
              <div className="mb-2 flex -space-x-1.5" aria-hidden>
                {people.map(person => (
                  <span key={person.id} title={person.name} className="inline-flex h-8 w-8 items-start justify-center overflow-hidden rounded-full border-2 border-surface bg-olive-soft">
                    <AvatarSprite config={person.avatar} status={person.status} name="" size={56} style={{ width: 56, height: 56, marginTop: -4 }} />
                  </span>
                ))}
              </div>
            )}
            <p className="flex items-center gap-1.5 text-[12px] text-ink-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
              <span>{office.onlineCount} online · {office.memberCount} members</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                type="button"
                aria-label={`${office.name} actions`}
                aria-expanded={menuOpen}
                aria-controls={menuId}
                onMouseDown={event => event.stopPropagation()}
                onClick={onToggleMenu}
                className="flex h-9 w-9 items-center justify-center rounded-md text-ink-2 hover:bg-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <MoreHorizontal size={16} strokeWidth={1.75} />
              </button>
              {menuOpen && (
                <div id={menuId} role="menu" className="absolute bottom-11 right-0 z-10 w-44 rounded-xl border border-border bg-surface p-1 shadow-[0_12px_32px_rgba(48,53,47,0.08)]" onMouseDown={event => event.stopPropagation()}>
                  <MenuItem onClick={onDetails}>Office details</MenuItem>
                  {canInvite && <MenuItem onClick={onCopy}>{copied ? 'Copied' : 'Copy invite link'}</MenuItem>}
                </div>
              )}
            </div>
            <PrimaryButton onClick={onEnter} aria-label={`Enter ${office.name}`}>Enter</PrimaryButton>
          </div>
        </div>
      </div>
    </article>
  )
}

function OfficeDetails({
  office, role, copied, onCopy, onEnter,
}: {
  office: Office
  role: OfficeMembership
  copied: boolean
  onCopy: () => void
  onEnter: () => void
}) {
  const layout = layoutOfOffice(office)
  const design = OFFICE_DESIGNS.find(item => item.id === layout)
  const canInvite = role === 'owner' || role === 'admin'
  return (
    <div>
      <p className="text-[13px] text-ink-3">{design?.name} · {ROLE_LABEL[role]}</p>
      <p className="mt-2 text-[14px] leading-6 text-ink-2">{office.description}</p>
      <p className="mt-3 text-[13px] text-ink-2">{office.onlineCount} online · {office.memberCount} members</p>
      {canInvite && (
        <div className="mt-4 rounded-lg bg-muted px-3 py-2">
          <p className="text-[12px] text-ink-3">Invite code</p>
          <p className="font-mono text-[14px] tracking-wide">{office.inviteCode}</p>
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        {canInvite && <SecondaryButton onClick={onCopy}>{copied ? 'Copied' : 'Copy invite link'}</SecondaryButton>}
        <PrimaryButton onClick={onEnter}>Enter office</PrimaryButton>
      </div>
    </div>
  )
}

function MenuItem({
  children, onClick, tone = 'default',
}: {
  children: ReactNode
  onClick: () => void
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`block w-full rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${tone === 'danger' ? 'text-error' : 'text-ink'}`}
    >
      {children}
    </button>
  )
}

function Dialog({
  titleId, title, onClose, children,
}: {
  titleId: string
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/25 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-[0_16px_40px_rgba(48,53,47,0.12)]"
        onMouseDown={event => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-[18px] font-semibold leading-6">{title}</h2>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  )
}

function useDialog(open: boolean, onClose: () => void, focusRef: RefObject<HTMLElement | null>) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const frame = window.requestAnimationFrame(() => focusRef.current?.focus())
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [open, focusRef])
}
