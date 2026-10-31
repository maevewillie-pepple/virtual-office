import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { User } from '../../types'
import { signIn, signUp } from '../../remote/account'
import Button from '../ui/Button'

interface AuthScreenProps {
  configured: boolean
  onAuthenticated: (user: User, mode: 'signin' | 'signup') => void
  onLocalAuth: (name: string, email: string) => void
  onDemo?: () => void
  notice?: string
  onBack: () => void
}

type Mode = 'signin' | 'signup'

export default function AuthScreen({ configured, onAuthenticated, onLocalAuth, onDemo, notice, onBack }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setError('')
    if (!configured) {
      onLocalAuth(name || email.split('@')[0], email)
      return
    }
    if (password.length < 6) {
      setError('Use at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const user = mode === 'signup'
        ? await signUp(name || email.split('@')[0], email, password)
        : await signIn(email, password)
      onAuthenticated(user, mode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full h-10 bg-canvas border border-border px-3 text-[14px] text-ink
    placeholder-ink-3 transition-colors focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/30`

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas">
      <div className="w-full max-w-sm fade-in">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-ink-2 hover:text-ink transition-colors mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <ArrowLeft size={14} strokeWidth={1.75} /> Back
        </button>

        <div className="bg-surface rounded-xl border border-border p-6">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="" width={96} height={92} className="mx-auto mb-2.5 h-24 w-24 object-contain [image-rendering:pixelated]" />
            <h1 className="type-h3 text-ink">Side desk</h1>
            {notice && <p className="mt-3 text-[13px] leading-5 text-ink-2">{notice}</p>}
          </div>

          <div className="flex gap-1 mb-5 bg-muted p-1">
            {(['signin', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-1.5 text-[12px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus
                  ${mode === m ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink'}`}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="type-label text-ink-2 block mb-1.5" htmlFor="auth-name">Display name</label>
                <input
                  id="auth-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputCls}
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="type-label text-ink-2 block mb-1.5" htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputCls}
                autoComplete="email"
              />
            </div>
            {configured && (
              <div>
                <label className="type-label text-ink-2 block mb-1.5" htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className={inputCls}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
              </div>
            )}

            {error && <p className="text-[13px] leading-5 text-error" role="alert">{error}</p>}

            <Button
              type="submit"
              disabled={!email || (configured && password.length < 6)}
              loading={loading}
              className="w-full mt-1"
              size="default"
            >
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          {onDemo && (
            <Button type="button" variant="secondary" className="w-full mt-3" onClick={onDemo}>
              Demo sign in
            </Button>
          )}

          <p className="text-center type-small text-ink-3 mt-5">
            {configured
              ? 'Your session stays on this browser until you sign out.'
              : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local to share offices. Until then, sign-in stays on this browser.'}
          </p>
        </div>
      </div>
    </div>
  )
}
