import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Button from '../ui/Button'

interface AuthScreenProps {
  onAuth: (name: string, email: string) => void
  onBack: () => void
  inviteCode?: string
}

type Mode = 'signin' | 'signup'

export default function AuthScreen({ onAuth, onBack, inviteCode }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>(inviteCode ? 'signup' : 'signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    onAuth(name || email.split('@')[0], email)
  }

  const handleGoogle = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    onAuth('Demo User', 'demo@example.com')
  }

  const inputCls = `w-full h-10 bg-canvas border border-border px-3 text-[14px] text-ink
    placeholder-ink-3 transition-colors focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/30`

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas">
      <div className="w-full max-w-sm fade-in">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-ink-2 hover:text-ink transition-colors mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <ArrowLeft size={14} strokeWidth={1.75} /> Back
        </button>

        <div className="bg-surface rounded-xl border border-border p-6">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="text-3xl mb-2.5">🦋</div>
            <h1 className="type-h3 text-ink">Virtual Office</h1>
            {inviteCode && (
              <div className="mt-3 px-3 py-1.5 rounded-md bg-olive-soft border border-olive/20 inline-block">
                <p className="type-small text-olive">Invited to join · {inviteCode}</p>
              </div>
            )}
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 mb-5 bg-muted p-1">
            {(['signin', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 text-[12px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus
                  ${mode === m ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink'}`}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-10 border border-border bg-surface text-ink text-[13px] font-medium mb-4
              hover:bg-muted transition-colors flex items-center justify-center gap-2
              focus:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google (Demo)
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="type-small text-ink-3">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="type-label text-ink-2 block mb-1.5">Display name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputCls}
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="type-label text-ink-2 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputCls}
                autoComplete="email"
              />
            </div>

            <Button
              type="submit"
              disabled={!email}
              loading={loading}
              className="w-full mt-1"
              size="default"
            >
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="text-center type-small text-ink-3 mt-5">Demo · No real auth</p>
        </div>
      </div>
    </div>
  )
}
