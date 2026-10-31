import { useState, type ReactNode } from 'react'

export type MarketingPage = 'home' | 'about' | 'faq' | 'contact'

const LINKS: { id: MarketingPage; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'faq', label: 'FAQs' },
  { id: 'contact', label: 'Contact' },
]

interface SiteFrameProps {
  page: MarketingPage
  signedIn: boolean
  onNavigate: (page: MarketingPage) => void
  onSignIn: () => void
  onDashboard: () => void
  onOpenDesign: () => void
  children: ReactNode
}

function NavLink({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`border-2 px-2.5 py-1.5 font-mono text-[13px] font-bold uppercase tracking-wide transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-focus
        ${active
          ? 'border-ink bg-olive-soft text-ink shadow-[2px_2px_0_#30352F]'
          : 'border-transparent text-ink-2 hover:border-ink hover:text-ink'}`}
    >
      {label}
    </button>
  )
}

const stampAction =
  'btn-stamp border-2 border-ink bg-ink px-3 py-1.5 font-mono text-[13px] font-bold uppercase tracking-wide text-surface ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus'

export default function SiteFrame({
  page, signedIn, onNavigate, onSignIn, onDashboard, onOpenDesign, children,
}: SiteFrameProps) {
  const [open, setOpen] = useState(false)

  const go = (next: MarketingPage) => {
    setOpen(false)
    onNavigate(next)
  }

  return (
    <div className="flex min-h-full flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b-2 border-ink bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => go('home')}
            className="flex items-center gap-2 text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <img src="/logo.png" alt="" width={40} height={38} className="h-10 w-10 object-contain [image-rendering:pixelated]" />
            <span className="font-display text-[13px] font-bold uppercase tracking-[0.18em]">Side desk</span>
          </button>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Homepage">
            {LINKS.map(link => (
              <NavLink
                key={link.id}
                label={link.label}
                active={page === link.id}
                onClick={() => go(link.id)}
              />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-stamp border-2 border-ink bg-surface px-2.5 py-1.5 font-mono text-[13px] font-bold uppercase tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-focus md:hidden"
              style={{ ['--btn-shadow' as string]: '2px 2px 0 #30352F' }}
              aria-expanded={open}
              aria-controls="home-menu"
              onClick={() => setOpen(v => !v)}
            >
              {open ? 'Close' : 'Menu'}
            </button>
            {signedIn ? (
              <button
                type="button"
                onClick={onDashboard}
                className={stampAction}
                style={{ ['--btn-shadow' as string]: '2px 2px 0 #66765C' }}
              >
                Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className={stampAction}
                style={{ ['--btn-shadow' as string]: '2px 2px 0 #66765C' }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {open && (
          <nav id="home-menu" className="flex flex-col gap-1 border-t-2 border-ink px-4 py-3 md:hidden" aria-label="Homepage">
            {LINKS.map(link => (
              <NavLink
                key={link.id}
                label={link.label}
                active={page === link.id}
                onClick={() => go(link.id)}
              />
            ))}
          </nav>
        )}
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t-2 border-ink bg-ink text-surface">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:flex-row md:items-start md:justify-between md:px-6">
          <div>
            <p className="flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.18em]">
              <img src="/logo.png" alt="" width={36} height={34} className="h-9 w-9 object-contain [image-rendering:pixelated]" />
              Side desk
            </p>
            <p className="mt-2 max-w-xs text-[13px] leading-5 text-[#E5EADD]">
              A small pixel room for working beside other people.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
            <button type="button" onClick={() => go('home')} className="font-mono text-[13px] font-bold uppercase tracking-wide text-[#E5EADD] hover:text-surface">Home</button>
            {LINKS.map(link => (
              <button
                key={link.id}
                type="button"
                onClick={() => go(link.id)}
                className="font-mono text-[13px] font-bold uppercase tracking-wide text-[#E5EADD] hover:text-surface"
              >
                {link.label}
              </button>
            ))}
            <button type="button" onClick={onOpenDesign} className="font-mono text-[13px] font-bold uppercase tracking-wide text-[#E5EADD] hover:text-surface">Design system</button>
          </nav>
        </div>
        <div className="border-t border-[#4A5246] px-4 py-3 md:px-6">
          <p className="mx-auto max-w-5xl font-mono text-[13px] uppercase tracking-wide text-[#C5C8BC]">
            © 2026 Side desk
          </p>
        </div>
      </footer>
    </div>
  )
}
