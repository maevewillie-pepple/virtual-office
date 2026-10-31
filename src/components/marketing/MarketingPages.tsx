import { useState, type FormEvent, type ReactNode } from 'react'

const fieldCls =
  'w-full border-2 border-ink bg-surface px-3 py-2 text-[14px] text-ink placeholder:text-ink-3 ' +
  'focus:outline-none focus:ring-2 focus:ring-olive'

function Page({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-16">
      <p className="font-mono text-[13px] font-bold uppercase tracking-[0.16em] text-olive">{kicker}</p>
      <h1 className="type-display-l mt-3 font-display text-ink">{title}</h1>
      <div className="mt-8 space-y-5 text-[15px] leading-7 text-ink-2">{children}</div>
    </article>
  )
}

export function AboutPage() {
  return (
    <Page kicker="About" title="A room, not a call.">
      <p>
        Side desk is a cosy pixel workspace. You walk between desks, the café, the bookshelf,
        and the arcade, and the people already in the room stay on screen while you work.
      </p>
      <p>
        The room is yours on this computer. Offices, your avatar, café stats, and notes stay in
        the browser. There is no account server behind the sign-in screen.
      </p>
      <p>
        The look is warm paper, olive, and clay, drawn in a limited pixel palette. Buttons press
        in like little stamps. The office itself is the product. The pages around it are just the front door.
      </p>
    </Page>
  )
}

const FAQS = [
  {
    q: 'Do colleagues on another computer see me move?',
    a: 'No. Presence, chat, and the office layout are stored on this browser. The other people in the room are demo colleagues so the space does not feel empty.',
  },
  {
    q: 'Where do I switch offices or change my avatar?',
    a: 'Open Dashboard from inside the office, or from the homepage after you sign in. From there you can enter another office, make a new one, edit your avatar, change your name, and log out.',
  },
  {
    q: 'What happens if I close the café before taking the drink?',
    a: 'Nothing is added to your hands. A finished drink only appears after you take it.',
  },
  {
    q: 'Is the sign-in a real account?',
    a: 'It remembers your name and avatar on this computer. Logging out clears that profile. It does not delete the office, café stats, arcade scores, or whiteboard notes.',
  },
  {
    q: 'How do I report a problem?',
    a: 'Use the contact form. The note is saved on this computer, because there is no inbox on the other side yet.',
  },
]

export function FaqPage() {
  const [open, setOpen] = useState(0)

  return (
    <Page kicker="FAQs" title="Short answers.">
      <div className="space-y-2">
        {FAQS.map((item, index) => {
          const shown = open === index
          return (
            <div key={item.q} className="border-2 border-ink bg-surface">
              <button
                type="button"
                aria-expanded={shown}
                onClick={() => setOpen(shown ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left font-display text-[14px] font-bold text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                {item.q}
                <span className="font-mono text-[12px] text-olive" aria-hidden>{shown ? '−' : '+'}</span>
              </button>
              {shown && <p className="border-t-2 border-ink px-4 py-3 text-[14px] leading-6 text-ink-2">{item.a}</p>}
            </div>
          )
        })}
      </div>
    </Page>
  )
}

const CONTACT_KEY = 'vo_contact_notes'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('Something broke')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !message.trim()) {
      setError('Add an email and a short description of the issue.')
      return
    }
    const note = {
      name: name.trim(),
      email: email.trim(),
      topic,
      message: message.trim(),
      at: new Date().toISOString(),
    }
    try {
      const raw = localStorage.getItem(CONTACT_KEY)
      const prev = raw ? JSON.parse(raw) as unknown[] : []
      localStorage.setItem(CONTACT_KEY, JSON.stringify([...prev, note]))
    } catch { /* the thank-you still shows; storage can be blocked */ }
    setError('')
    setSent(true)
  }

  if (sent) {
    return (
      <Page kicker="Contact" title="Noted.">
        <p>
          This note is saved on this computer. There is no support inbox yet, so keep a copy if you still need a reply.
        </p>
        <button
          type="button"
          onClick={() => { setSent(false); setMessage(''); setName(''); setEmail('') }}
          className="font-mono text-[11px] font-bold uppercase tracking-wide border-2 border-ink bg-surface px-3 py-2 text-ink shadow-[2px_2px_0_#A9AB9F]"
        >
          Write another
        </button>
      </Page>
    )
  }

  return (
    <Page kicker="Contact" title="Tell us what went wrong.">
      <p>Use this for bugs, a broken room, or anything that got in the way.</p>
      <form onSubmit={submit} className="space-y-4 border-2 border-ink bg-canvas p-4 shadow-[4px_4px_0_#30352F]">
        <label className="block">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink">Name</span>
          <input value={name} onChange={e => setName(e.target.value)} className={`${fieldCls} mt-1.5`} autoComplete="name" />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink">Email</span>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className={`${fieldCls} mt-1.5`} autoComplete="email" />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink">Topic</span>
          <select value={topic} onChange={e => setTopic(e.target.value)} className={`${fieldCls} mt-1.5`}>
            <option>Something broke</option>
            <option>The café</option>
            <option>An office</option>
            <option>My avatar</option>
            <option>Something else</option>
          </select>
        </label>
        <label className="block">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink">What happened</span>
          <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={5} className={`${fieldCls} mt-1.5 resize-y`} />
        </label>
        {error && <p className="text-[13px] text-error">{error}</p>}
        <button
          type="submit"
          className="font-mono text-[12px] font-bold uppercase tracking-wide border-2 border-ink bg-ink px-4 py-2 text-surface shadow-[2px_2px_0_#66765C] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          Send note
        </button>
      </form>
    </Page>
  )
}
