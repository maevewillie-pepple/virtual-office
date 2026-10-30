import React, { useState } from 'react'
import type { AvatarConfig, User } from './types'
import { demoAvatars } from './data/mockData'

import LandingScreen from './components/screens/LandingScreen'
import AuthScreen from './components/screens/AuthScreen'
import DashboardScreen from './components/screens/DashboardScreen'
import CreateOfficeScreen from './components/screens/CreateOfficeScreen'
import AvatarCreatorScreen from './components/screens/AvatarCreatorScreen'
import OfficeScreen from './components/screens/OfficeScreen'
import DesignSystemScreen from './components/screens/DesignSystemScreen'
import StudioScene from './experiments/studio3d/StudioScene'
import Studio3DSelector from './experiments/studio3d/Studio3DSelector'

type Screen =
  | 'landing'
  | 'auth'
  | 'avatar'
  | 'dashboard'
  | 'create_office'
  | 'office'
  | 'design_system'
  | 'studio_3d'
  | 'studio_3d_offices'

function loadPersistedUser(): User | null {
  try {
    const raw = localStorage.getItem('vo_user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function savePersistedUser(user: User) {
  try { localStorage.setItem('vo_user', JSON.stringify(user)) } catch {}
}

export default function App() {
  const savedUser = loadPersistedUser()
  const [screen, setScreen] = useState<Screen>(savedUser ? 'dashboard' : 'landing')
  const [authIntent, setAuthIntent] = useState<'office' | 'dashboard'>('dashboard')
  const [currentUser, setCurrentUser] = useState<User | null>(savedUser)

  const handleAuth = (name: string, email: string) => {
    const user: User = {
      id: 'demo_current', name, email,
      avatar: demoAvatars[0], status: 'online',
      joinedAt: new Date().toISOString(),
    }
    setCurrentUser(user)
    savePersistedUser(user)
    setScreen('avatar')
  }

  const handleAvatarSave = (config: AvatarConfig, name: string) => {
    if (!currentUser) return
    const updated = { ...currentUser, avatar: config, name }
    setCurrentUser(updated)
    savePersistedUser(updated)
    setScreen(authIntent === 'office' ? 'create_office' : 'dashboard')
  }

  const user = currentUser ?? {
    id: 'demo_current', name: 'You', email: 'you@example.com',
    avatar: demoAvatars[0], status: 'online' as const,
    joinedAt: new Date().toISOString(),
  }

  const DEMO_SCREENS: [Screen, string, string][] = [
    ['landing',       '🏠', 'Landing'],
    ['auth',          '🔐', 'Auth'],
    ['avatar',        '🎨', 'Avatar'],
    ['dashboard',     '📋', 'Dashboard'],
    ['create_office', '✚',  'Create'],
    ['office',        '🏢', 'Office'],
    ['design_system', '🎨', 'Design'],
    ['studio_3d',          '🏛️', '3D v1'],
    ['studio_3d_offices',  '🌐', '5 Offices'],
  ]

  return (
    <div className="w-screen h-screen overflow-hidden bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-3 focus:py-1 focus:bg-olive focus:text-surface focus:rounded focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      <main id="main-content" className="w-full h-full pt-[40px]">
        {screen === 'landing' && (
          <div className="overflow-auto h-full">
            <LandingScreen
              onCreateOffice={() => { setAuthIntent('office'); setScreen('auth') }}
              onJoinOffice={() => setScreen('auth')}
              onSignIn={() => setScreen('auth')}
            />
          </div>
        )}
        {screen === 'auth' && (
          <AuthScreen onAuth={handleAuth} onBack={() => setScreen('landing')} />
        )}
        {screen === 'avatar' && (
          <div className="overflow-auto h-full">
            <AvatarCreatorScreen
              initial={user.avatar}
              onSave={handleAvatarSave}
              onBack={() => setScreen('auth')}
            />
          </div>
        )}
        {screen === 'dashboard' && (
          <div className="overflow-auto h-full">
            <DashboardScreen
              currentUser={user}
              onEnterOffice={() => setScreen('office')}
              onCreateOffice={() => setScreen('create_office')}
              onJoinOffice={() => {}}
            />
          </div>
        )}
        {screen === 'create_office' && (
          <div className="overflow-auto h-full">
            <CreateOfficeScreen
              onCreated={() => setScreen('office')}
              onBack={() => setScreen('dashboard')}
            />
          </div>
        )}
        {screen === 'office' && <OfficeScreen />}
        {screen === 'studio_3d' && <StudioScene />}
        {screen === 'studio_3d_offices' && <Studio3DSelector />}
        {screen === 'design_system' && (
          <div className="overflow-auto h-full">
            <DesignSystemScreen />
          </div>
        )}
      </main>

      {/* Demo navigation strip */}
      <nav
        className="fixed top-0 left-0 right-0 z-[90] flex justify-center pointer-events-auto border-b border-border bg-surface/95"
        style={{ backdropFilter: 'blur(8px)' }}
        aria-label="Demo screen navigation"
      >
        <div className="flex gap-0.5 px-2 py-1.5">
          {DEMO_SCREENS.map(([s, icon, label]) => (
            <button
              key={s}
              onClick={() => setScreen(s)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium transition-all
                focus:outline-none focus-visible:ring-1 focus-visible:ring-olive
                ${screen === s
                  ? 'text-olive border-b-2 border-olive'
                  : 'text-ink-3 hover:text-ink'}
              `}
              aria-current={screen === s ? 'page' : undefined}
              title={label}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
