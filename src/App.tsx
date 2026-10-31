import { useEffect, useState } from 'react'
import type { AvatarConfig, Office, OfficeArtTheme, OfficeMembership, OfficeTheme, User } from './types'
import { demoAvatars, demoOffices } from './data/mockData'
import { isRemoteConfigured, isUuid } from './remote/client'
import { createRemoteOffice, loadMyOffices, restoreSession, saveProfile, signOut, watchSession } from './remote/account'
import { hydratePersonal } from './remote/sync'
import { importLocalOffices, officesWaitingToImport } from './remote/importLocal'

import LandingScreen from './components/screens/LandingScreen'
import AuthScreen from './components/screens/AuthScreen'
import DashboardScreen from './components/screens/DashboardScreen'
import CreateOfficeScreen from './components/screens/CreateOfficeScreen'
import AvatarCreatorScreen from './components/screens/AvatarCreatorScreen'
import OfficeScreen from './components/screens/OfficeScreen'
import SiteFrame, { type MarketingPage } from './components/marketing/SiteFrame'
import { AboutPage, ContactPage, FaqPage } from './components/marketing/MarketingPages'
import DesignSystemScreen from './components/screens/DesignSystemScreen'

type Screen =
  | 'landing'
  | 'about'
  | 'faq'
  | 'contact'
  | 'auth'
  | 'avatar'
  | 'dashboard'
  | 'create_office'
  | 'office'
  | 'design_system'

const CREATED_KEY = 'vo_created_offices'
const ACTIVE_KEY = 'vo_active_office'

function loadPersistedUser(): User | null {
  try {
    const raw = localStorage.getItem('vo_user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function savePersistedUser(user: User) {
  try { localStorage.setItem('vo_user', JSON.stringify(user)) } catch {}
}

function loadCreatedOffices(): Office[] {
  try {
    const raw = localStorage.getItem(CREATED_KEY)
    const parsed = raw ? JSON.parse(raw) as Office[] : []
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function loadActiveOfficeId(): string {
  try { return localStorage.getItem(ACTIVE_KEY) || demoOffices[0].id } catch { return demoOffices[0].id }
}

function loadLastVisitedId(): string | null {
  try { return localStorage.getItem(ACTIVE_KEY) } catch { return null }
}

const MARKETING: Record<MarketingPage, Screen> = {
  home: 'landing',
  about: 'about',
  faq: 'faq',
  contact: 'contact',
}

function marketingPage(screen: Screen): MarketingPage | null {
  if (screen === 'landing') return 'home'
  if (screen === 'about' || screen === 'faq' || screen === 'contact') return screen
  return null
}

export default function App() {
  const remote = isRemoteConfigured()
  const savedUser = remote ? null : loadPersistedUser()
  const [ready, setReady] = useState(!remote)
  const [screen, setScreen] = useState<Screen>(savedUser ? 'dashboard' : 'landing')
  const [authIntent, setAuthIntent] = useState<'office' | 'dashboard'>('dashboard')
  const [avatarBack, setAvatarBack] = useState<Screen>('auth')
  const [currentUser, setCurrentUser] = useState<User | null>(savedUser)
  const [createdOffices, setCreatedOffices] = useState<Office[]>(remote ? [] : loadCreatedOffices)
  const [roles, setRoles] = useState<Record<string, OfficeMembership>>({})
  const [importReady, setImportReady] = useState(false)
  const [activeOfficeId, setActiveOfficeId] = useState(remote ? (loadLastVisitedId() ?? '') : loadActiveOfficeId)

  const offices = remote
    ? createdOffices
    : [...demoOffices, ...createdOffices.filter(office => !demoOffices.some(demo => demo.id === office.id))]
  const activeOffice = offices.find(office => office.id === activeOfficeId) ?? (remote ? undefined : offices[0])

  const rememberOffices = (records: { office: Office; role: OfficeMembership }[]) => {
    setCreatedOffices(records.map(item => item.office))
    setRoles(Object.fromEntries(records.map(item => [item.office.id, item.role])))
  }

  useEffect(() => {
    if (!remote) return
    let alive = true
    restoreSession()
      .then(async result => {
        if (!alive) return
        if (result) {
          setCurrentUser(result.user)
          rememberOffices(result.offices)
          setImportReady(officesWaitingToImport().length > 0)
          setScreen('dashboard')
          await hydratePersonal(result.user.id)
        }
        if (alive) setReady(true)
      })
      .catch(() => { if (alive) setReady(true) })
    const stop = watchSession(user => {
      if (!alive || user) return
      setCurrentUser(null)
      setCreatedOffices([])
      setRoles({})
      setScreen('landing')
    })
    return () => { alive = false; stop() }
  }, [remote])

  const handleAuth = (name: string, email: string) => {
    const user: User = {
      id: 'demo_current', name, email,
      avatar: currentUser?.avatar ?? demoAvatars[0], status: 'online',
      joinedAt: currentUser?.joinedAt ?? new Date().toISOString(),
    }
    setCurrentUser(user)
    savePersistedUser(user)
    setAvatarBack('auth')
    setScreen('avatar')
  }

  const handleAuthenticated = (user: User, mode: 'signin' | 'signup') => {
    setCurrentUser(user)
    setImportReady(officesWaitingToImport().length > 0)
    void hydratePersonal(user.id)
    void loadMyOffices().then(rememberOffices).catch(() => {})
    setAvatarBack('auth')
    setScreen(mode === 'signup' ? 'avatar' : 'dashboard')
  }

  const handleAvatarSave = (config: AvatarConfig, name: string) => {
    if (!currentUser) return
    const updated = { ...currentUser, avatar: config, name }
    setCurrentUser(updated)
    if (remote && isUuid(updated.id)) void saveProfile(updated)
    else savePersistedUser(updated)
    setScreen(authIntent === 'office' ? 'create_office' : 'dashboard')
  }

  const enterOffice = (officeId: string) => {
    setActiveOfficeId(officeId)
    try { localStorage.setItem(ACTIVE_KEY, officeId) } catch {}
    setScreen('office')
  }

  const handleCreate = async (draft: { name: string; description: string; theme: string; layout: OfficeArtTheme; inviteCode: string }) => {
    const layout: OfficeArtTheme = draft.layout
    const theme: OfficeTheme = layout === 'library' ? 'quiet_library' : layout === 'loft' ? 'creative_loft' : 'cosy_studio'
    const coverEmoji = layout === 'library' ? '📚' : layout === 'loft' ? '🪟' : layout === 'studio' ? '🌿' : layout === 'lab' ? '⚗️' : '🏢'
    if (remote && currentUser && isUuid(currentUser.id)) {
      const record = await createRemoteOffice({
        name: draft.name.trim() || 'New office',
        description: draft.description.trim() || 'A new room',
        theme,
        layout,
        inviteCode: draft.inviteCode,
        coverEmoji,
      })
      setCreatedOffices(prev => [...prev.filter(item => item.id !== record.office.id), record.office])
      setRoles(prev => ({ ...prev, [record.office.id]: record.role }))
      enterOffice(record.office.id)
      return
    }
    const office: Office = {
      id: `office_${Date.now()}`,
      name: draft.name.trim() || 'New office',
      description: draft.description.trim() || 'A new room',
      theme,
      layout,
      ownerId: currentUser?.id ?? 'demo_current',
      inviteCode: draft.inviteCode,
      createdAt: new Date().toISOString().slice(0, 10),
      memberCount: 1,
      onlineCount: 1,
      coverEmoji,
    }
    const next = [...createdOffices, office]
    setCreatedOffices(next)
    try { localStorage.setItem(CREATED_KEY, JSON.stringify(next)) } catch {}
    enterOffice(office.id)
  }

  const handleJoin = async (code: string) => {
    const { joinRemoteOffice } = await import('./remote/account')
    const record = await joinRemoteOffice(code)
    setCreatedOffices(prev => prev.some(item => item.id === record.office.id) ? prev : [...prev, record.office])
    setRoles(prev => ({ ...prev, [record.office.id]: record.role }))
    return record.office.id
  }

  const handleImport = async () => {
    await importLocalOffices()
    rememberOffices(await loadMyOffices())
    setImportReady(false)
  }

  const handleLogout = () => {
    if (remote) void signOut()
    else {
      try { localStorage.removeItem('vo_user') } catch {}
    }
    setCurrentUser(null)
    if (remote) {
      setCreatedOffices([])
      setRoles({})
    }
    setScreen('landing')
  }

  const updateName = (name: string) => {
    if (remote && currentUser && isUuid(currentUser.id)) {
      const updated = { ...currentUser, name }
      setCurrentUser(updated)
      void saveProfile(updated)
      return
    }
    const base = currentUser ?? {
      id: 'demo_current', name, email: 'you@example.com',
      avatar: demoAvatars[0], status: 'online' as const,
      joinedAt: new Date().toISOString(),
    }
    const updated = { ...base, name }
    setCurrentUser(updated)
    savePersistedUser(updated)
  }

  const user = currentUser ?? {
    id: 'demo_current', name: 'You', email: 'you@example.com',
    avatar: demoAvatars[0], status: 'online' as const,
    joinedAt: new Date().toISOString(),
  }

  const page = marketingPage(screen)
  const openAvatar = (back: Screen) => {
    setAvatarBack(back)
    setAuthIntent('dashboard')
    setScreen('avatar')
  }

  if (remote && !ready) {
    return (
      <div className="grid h-screen place-items-center bg-canvas text-ink">
        <p className="font-mono text-[13px] font-bold uppercase tracking-[0.16em]">Opening your desk</p>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-3 focus:py-1 focus:bg-olive focus:text-surface focus:rounded focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      <main id="main-content" className={`w-full h-full ${page ? 'overflow-auto' : 'overflow-hidden'}`}>
        {page && (
          <SiteFrame
            page={page}
            signedIn={!!currentUser}
            onNavigate={next => setScreen(MARKETING[next])}
            onSignIn={() => { setAuthIntent('dashboard'); setScreen('auth') }}
            onDashboard={() => setScreen('dashboard')}
            onOpenDesign={() => setScreen('design_system')}
          >
            {page === 'home' && (
              <LandingScreen
                onCreateOffice={() => { setAuthIntent('office'); setScreen('auth') }}
              />
            )}
            {page === 'about' && <AboutPage />}
            {page === 'faq' && <FaqPage />}
            {page === 'contact' && <ContactPage />}
          </SiteFrame>
        )}
        {screen === 'auth' && (
          <AuthScreen
            configured={remote}
            onAuthenticated={handleAuthenticated}
            onLocalAuth={handleAuth}
            onBack={() => setScreen('landing')}
          />
        )}
        {screen === 'avatar' && (
          <div className="overflow-auto h-full">
            <AvatarCreatorScreen
              initial={user.avatar}
              onSave={handleAvatarSave}
              onBack={() => setScreen(avatarBack)}
            />
          </div>
        )}
        {screen === 'dashboard' && (
          <div className="overflow-auto h-full">
            <DashboardScreen
              currentUser={user}
              offices={offices}
              signedIn={!!currentUser}
              onEnterOffice={enterOffice}
              onCreateOffice={() => setScreen('create_office')}
              onEditAvatar={() => openAvatar('dashboard')}
              onUpdateName={updateName}
              onLogout={handleLogout}
              onSignIn={() => { setAuthIntent('dashboard'); setScreen('auth') }}
              onHome={() => setScreen('landing')}
              lastVisitedId={loadLastVisitedId()}
              roles={roles}
              onJoinCode={remote ? handleJoin : undefined}
              onImport={importReady ? handleImport : undefined}
            />
          </div>
        )}
        {screen === 'create_office' && (
          <div className="overflow-auto h-full">
            <CreateOfficeScreen
              onCreated={handleCreate}
              onBack={() => setScreen('dashboard')}
            />
          </div>
        )}
        {screen === 'design_system' && (
          <div className="h-full overflow-auto">
            <DesignSystemScreen onBack={() => setScreen('landing')} />
          </div>
        )}
        {screen === 'office' && activeOffice && (
          <OfficeScreen
            key={activeOffice.id}
            office={activeOffice}
            account={user}
            membershipRole={roles[activeOffice.id] ?? (activeOffice.ownerId === user.id ? 'owner' : 'member')}
            onOpenDashboard={() => setScreen('dashboard')}
            onOfficeUpdated={office => {
              setCreatedOffices(prev => prev.map(item => item.id === office.id ? { ...item, ...office } : item))
            }}
          />
        )}
      </main>
    </div>
  )
}
