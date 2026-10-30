import React, { useState, useEffect, useCallback } from 'react'
import { X, Users, Timer, Zap } from 'lucide-react'

interface DebateSession {
  topic: string
  durationMin: number
  startedAt: number
  participants: string[]
}

interface MeetingDebatePanelProps {
  isOpen: boolean
  onClose: () => void
  currentUserName: string
  onJoin: (topic: string, durationMin: number) => void
  onLeave: () => void
  activeSession: DebateSession | null
}

const DURATIONS = [5, 10, 15]

export default function MeetingDebatePanel({
  isOpen, onClose, currentUserName, onJoin, onLeave, activeSession,
}: MeetingDebatePanelProps) {
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState(10)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!activeSession) return
    const update = () => {
      const elapsed = (Date.now() - activeSession.startedAt) / 1000
      const total = activeSession.durationMin * 60
      const remaining = Math.max(0, total - elapsed)
      const m = Math.floor(remaining / 60)
      const s = Math.floor(remaining % 60)
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [activeSession])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const isParticipant = activeSession?.participants.includes(currentUserName) ?? false

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(48,53,47,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-2xl fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-olive" />
            <h2 className="type-h3 text-ink">Whiteboard Debate</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-ink-3 hover:text-ink transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {activeSession ? (
            <>
              {/* Active debate */}
              <div className="rounded-lg border border-olive/30 bg-olive-soft px-4 py-3">
                <p className="type-small text-olive/70 mb-1">Current topic</p>
                <p className="type-body font-semibold text-olive">{activeSession.topic}</p>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-canvas">
                  <Timer size={14} className="text-ink-3" />
                  <span className="font-mono text-[14px] text-ink font-bold">{timeLeft}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-ink-3" />
                  <span className="type-small text-ink-2">{activeSession.participants.length} in debate</span>
                </div>
              </div>

              {/* Participants */}
              {activeSession.participants.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeSession.participants.map(name => (
                    <span
                      key={name}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium border
                        ${name === currentUserName
                          ? 'border-olive/40 bg-olive-soft text-olive'
                          : 'border-border bg-canvas text-ink-2'}`}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}

              {/* Join / Leave */}
              {isParticipant ? (
                <button
                  onClick={() => { onLeave(); onClose(); }}
                  className="w-full py-2.5 rounded-lg border border-border bg-canvas text-[13px] font-medium text-ink-2
                    hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  Leave debate
                </button>
              ) : (
                <button
                  onClick={() => { onJoin(activeSession.topic, activeSession.durationMin); onClose(); }}
                  className="w-full py-2.5 rounded-lg border border-olive/40 bg-olive-soft text-[13px] font-medium text-olive
                    hover:bg-olive/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  Join debate ⚡
                </button>
              )}
            </>
          ) : (
            <>
              {/* Start a new debate */}
              <p className="type-small text-ink-3">Set a topic for the whiteboard and start a timed discussion.</p>

              <div>
                <label className="type-label text-ink-2 mb-1.5 block">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="What should we debate?"
                  maxLength={80}
                  className="w-full px-3 py-2 rounded-[6px] border border-border bg-canvas text-[13px] text-ink placeholder:text-ink-3
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  autoFocus
                />
              </div>

              <div>
                <label className="type-label text-ink-2 mb-1.5 block">Duration</label>
                <div className="flex gap-2">
                  {DURATIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-2 rounded-[6px] border text-[13px] font-medium transition-all
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-focus
                        ${duration === d
                          ? 'border-olive/40 bg-olive-soft text-olive'
                          : 'border-border bg-canvas text-ink hover:bg-muted'}`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (topic.trim()) { onJoin(topic.trim(), duration); onClose(); }
                }}
                disabled={!topic.trim()}
                className="w-full py-2.5 rounded-lg border border-olive/40 bg-olive-soft text-[13px] font-medium text-olive
                  hover:bg-olive/20 transition-colors disabled:opacity-40
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Start debate ⚡
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export type { DebateSession }
