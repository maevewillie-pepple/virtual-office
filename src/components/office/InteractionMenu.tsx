import React, { useEffect, useRef, useState } from 'react'
import type { InteractableObject } from '../../types'
import ArcadeShell from './arcade/ArcadeShell'
import type { ArcadePlayer } from './arcade/Scoreboard'

interface Note {
  id: string
  text: string
  kind: 'note' | 'link'
}

interface InteractionMenuProps {
  object: InteractableObject
  designId: string
  officeId: string
  player: ArcadePlayer
  players: ArcadePlayer[]
  isOwner: boolean
  onClose: () => void
  onStartDebate: () => void
  onShare: (text: string) => void
}

type View = 'menu' | 'whiteboard' | 'snake' | 'memory' | 'pool' | 'server'

export default function InteractionMenu({ object, designId, officeId, player, players, isOwner, onClose, onStartDebate, onShare }: InteractionMenuProps) {
  const [view, setView] = useState<View>(object.type === 'use_whiteboard' ? 'whiteboard' : 'menu')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    rootRef.current?.focus()
  }, [view])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (object.type === 'use_arcade' || object.type === 'play_pool' || object.type === 'play_game') return
        e.preventDefault()
        e.stopPropagation()
        if (view !== 'menu' && object.type !== 'use_whiteboard') setView('menu')
        else onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [view, object.type, onClose])

  if (object.type === 'use_arcade' || object.type === 'play_pool' || object.type === 'play_game') {
    return (
      <ArcadeShell
        officeId={officeId}
        player={player}
        players={players}
        isOwner={isOwner}
        start={object.type === 'play_pool' ? 'pool' : 'launcher'}
        onClose={onClose}
        onShare={onShare}
      />
    )
  }

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-label={object.label}
      className="absolute bottom-24 left-4 z-40 w-[min(100%-2rem,340px)] rounded-xl border border-border bg-surface shadow-2xl outline-none"
      onClick={e => e.stopPropagation()}
    >
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <p className="type-label text-ink">{object.label}</p>
          <p className="type-small text-ink-3">Escape to close</p>
        </div>
        <button
          onClick={onClose}
          className="px-2 py-1 text-[12px] text-ink-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          Close
        </button>
      </header>
      <div className="p-4">
        {view === 'menu' && object.type === 'use_meeting' && (
          <div className="flex flex-col gap-2">
            <MenuButton onClick={onStartDebate}>Start a debate</MenuButton>
            <MenuButton onClick={() => setView('whiteboard')}>Use whiteboard</MenuButton>
          </div>
        )}
        {view === 'menu' && object.type === 'use_server' && (
          <ServerStatus />
        )}
        {view === 'whiteboard' && (
          <Whiteboard designId={designId} boardId={object.id} />
        )}
      </div>
    </div>
  )
}

function MenuButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-lg border border-border bg-canvas text-[13px] text-ink hover:bg-olive-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      {children}
    </button>
  )
}

function Whiteboard({ designId, boardId }: { designId: string; boardId: string }) {
  const key = `vo_board_${designId}_${boardId}`
  const [notes, setNotes] = useState<Note[]>(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
  })
  const [text, setText] = useState('')
  const [link, setLink] = useState('')

  const save = (next: Note[]) => {
    setNotes(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* ignore */ }
  }

  return (
    <div className="space-y-3">
      <ul className="max-h-36 overflow-auto space-y-1.5">
        {notes.length === 0 && <li className="type-small text-ink-3">Nothing on the board yet.</li>}
        {notes.map(note => (
          <li key={note.id} className="flex items-start justify-between gap-2 rounded-md bg-canvas px-2 py-1.5">
            {note.kind === 'link'
              ? <a href={note.text} target="_blank" rel="noreferrer" className="type-small text-olive break-all">{note.text}</a>
              : <span className="type-small text-ink">{note.text}</span>}
            <button
              className="text-[11px] text-ink-3 hover:text-ink"
              onClick={() => save(notes.filter(n => n.id !== note.id))}
              aria-label="Remove note"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={e => {
          e.preventDefault()
          const value = text.trim()
          if (!value) return
          save([...notes, { id: `n_${Date.now()}`, text: value, kind: 'note' }])
          setText('')
        }}
      >
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Sticky note"
          maxLength={80}
          className="flex-1 px-2 py-1.5 rounded-md border border-border bg-canvas text-[12px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        />
        <button className="px-2 text-[12px] text-ink" type="submit">Add</button>
      </form>
      <form
        className="flex gap-2"
        onSubmit={e => {
          e.preventDefault()
          const value = link.trim()
          if (!value) return
          save([...notes, { id: `l_${Date.now()}`, text: value, kind: 'link' }])
          setLink('')
        }}
      >
        <input
          value={link}
          onChange={e => setLink(e.target.value)}
          placeholder="https://…"
          className="flex-1 px-2 py-1.5 rounded-md border border-border bg-canvas text-[12px] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        />
        <button className="px-2 text-[12px] text-ink" type="submit">Link</button>
      </form>
    </div>
  )
}

function ServerStatus() {
  return (
    <div className="rounded-lg bg-canvas border border-border p-3 font-mono text-[12px] text-ink space-y-1">
      <p>RACKS · 4 online</p>
      <p>TEMP · 22°C nominal</p>
      <p>JOBS · nightly backup finished</p>
      <p className="text-ink-3">This is a fictional status board.</p>
    </div>
  )
}
