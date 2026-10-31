import React, { useState, useEffect } from 'react'
import type { User, FocusDuration, CarriedItem } from '../../types'
import { carriedLabel, isBook } from '../../game/barista/carry'
import { Timer, Coffee, Music, Smile, X, Pause, Play, History, Package, Home } from 'lucide-react'

interface BottomToolbarProps {
  currentUser: User
  focusSession: { duration: FocusDuration; topic?: string; endsAt: string; paused: boolean; pausedAt?: string } | null
  onBreak: boolean
  onStartFocus: (duration: FocusDuration, topic?: string, shareTopic?: boolean) => void
  onEndFocus: () => void
  onPauseFocus: () => void
  onResumeFocus: () => void
  onToggleBreak: () => void
  onOpenMusic: () => void
  musicOpen?: boolean
  onOpenProfile: () => void
  onReaction: (emoji: string) => void
  onOpenFocusHistory: () => void
  carriedItem?: CarriedItem | null
  onDropItem?: () => void
  onUseItem?: (action: 'drink' | 'read') => void
  focusSignal?: number
}

type Panel = 'focus' | 'reactions' | null

const REACTION_EMOJIS = ['👋', '❤️', '👏', '😂', '🎉', '🔥', '☕', '🤔']
const FOCUS_PRESETS: FocusDuration[] = [25, 50, 90]

export default function BottomToolbar({
  focusSession, onBreak,
  onStartFocus, onEndFocus, onPauseFocus, onResumeFocus, onToggleBreak,
  onOpenMusic, musicOpen = false, onOpenProfile, onReaction, onOpenFocusHistory,
  carriedItem, onDropItem, onUseItem, focusSignal = 0,
}: BottomToolbarProps) {
  const [panel, setPanel] = useState<Panel>(null)
  const [shareTopic, setShareTopic] = useState(true)
  const [timeLeft, setTimeLeft] = useState('')
  const [topic, setTopic] = useState('')
  const [customMin, setCustomMin] = useState('')

  useEffect(() => {
    if (focusSignal) setPanel('focus')
  }, [focusSignal])

  useEffect(() => {
    if (!focusSession || focusSession.paused) return
    const update = () => {
      const diff = Math.max(0, new Date(focusSession.endsAt).getTime() - Date.now())
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`)
      if (diff === 0) onEndFocus()
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [focusSession, onEndFocus])

  // Compute remaining when paused
  const pausedRemaining = focusSession?.paused && focusSession.pausedAt
    ? Math.max(0, new Date(focusSession.endsAt).getTime() - new Date(focusSession.pausedAt).getTime())
    : null

  const pausedLabel = pausedRemaining != null
    ? `${Math.floor(pausedRemaining / 60000)}:${String(Math.floor((pausedRemaining % 60000) / 1000)).padStart(2, '0')}`
    : null

  const handleStartWithCustom = () => {
    const mins = parseInt(customMin, 10)
    if (!isNaN(mins) && mins >= 1 && mins <= 480) {
      onStartFocus(mins, topic.trim() || undefined, shareTopic)
      setPanel(null)
      setTopic('')
      setCustomMin('')
    }
  }

  const panelBase = 'absolute bottom-14 left-1/2 -translate-x-1/2 rounded-xl border border-border bg-surface shadow-lg p-4 fade-in z-40 min-w-[240px]'

  return (
    <>
      {/* Focus panel */}
      {panel === 'focus' && !focusSession && (
        <div className={panelBase} role="dialog" aria-label="Start a focus session">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[16px] font-medium text-ink">Start a focus session</p>
            <button
              type="button"
              onClick={() => setPanel(null)}
              aria-label="Close"
              className="rounded-md p-1 text-ink-3 hover:bg-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>

          {/* Topic input */}
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && topic && e.preventDefault()}
            placeholder="What are you working on?"
            aria-label="Focus topic"
            className="w-full px-3 py-2 mb-3 rounded-[10px] border border-border bg-canvas text-[15px] text-ink placeholder:text-ink-3
              focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            maxLength={60}
          />

          {/* Preset durations */}
          <div className="flex gap-2 mb-2">
            {FOCUS_PRESETS.map(d => (
              <button
                key={d}
                onClick={() => {
                  onStartFocus(d, topic.trim() || undefined, shareTopic)
                  setPanel(null)
                  setTopic('')
                }}
                className="flex-1 py-2 rounded-[10px] border border-border bg-canvas text-[15px] font-medium text-ink
                  hover:bg-olive-soft hover:border-olive/40 hover:text-olive transition-all
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                {d}m
              </button>
            ))}
          </div>

          {/* Custom duration */}
          <div className="flex gap-2">
            <input
              type="number"
              value={customMin}
              onChange={e => setCustomMin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStartWithCustom()}
              placeholder="Custom (min)"
              min={1}
              max={480}
              className="flex-1 px-3 py-2 rounded-[10px] border border-border bg-canvas text-[15px] text-ink placeholder:text-ink-3
                focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
            <button
              onClick={handleStartWithCustom}
              disabled={!customMin || isNaN(parseInt(customMin, 10))}
              className="px-3 py-2 rounded-[10px] bg-olive text-[15px] font-medium text-surface hover:bg-[#55664d] disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              Go
            </button>
          </div>

          <label className="flex items-center gap-2 mt-3 type-small text-ink-2">
            <input
              type="checkbox"
              checked={shareTopic}
              onChange={e => setShareTopic(e.target.checked)}
              className="accent-olive"
            />
            Show the topic to the room
          </label>
          <div className="flex items-center justify-between mt-3">
            <p className="type-small text-ink-3">Arrow keys still work</p>
            <button
              onClick={() => { setPanel(null); onOpenFocusHistory() }}
              className="flex items-center gap-1 text-[11px] text-ink-3 hover:text-ink transition-colors"
            >
              <History size={11} />
              <span>History</span>
            </button>
          </div>
        </div>
      )}

      {/* Reactions panel */}
      {panel === 'reactions' && (
        <div className={panelBase}>
          <div className="grid grid-cols-4 gap-1.5">
            {REACTION_EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => { onReaction(e); setPanel(null) }}
                className="w-10 h-10 rounded-[6px] hover:bg-muted text-lg flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                aria-label={e}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-xl border border-border bg-surface shadow-lg fade-in"
        role="toolbar"
        aria-label="Office toolbar"
      >
        {/* Focus */}
        {focusSession ? (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-olive-soft border border-olive/30 text-[12px] font-medium text-olive">
              <Timer size={14} strokeWidth={1.75} />
              <span className="font-mono">{focusSession.paused ? pausedLabel : timeLeft}</span>
              {focusSession.topic && (
                <span className="hidden sm:inline text-olive/70 truncate max-w-[80px]">· {focusSession.topic}</span>
              )}
            </div>
            {/* Pause/Resume */}
            <button
              onClick={focusSession.paused ? onResumeFocus : onPauseFocus}
              className="p-1.5 rounded-lg bg-olive-soft border border-olive/30 text-olive hover:bg-olive/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              aria-label={focusSession.paused ? 'Resume focus' : 'Pause focus'}
            >
              {focusSession.paused ? <Play size={12} strokeWidth={2} /> : <Pause size={12} strokeWidth={2} />}
            </button>
            {/* End */}
            <button
              onClick={onEndFocus}
              className="p-1.5 rounded-lg bg-olive-soft border border-olive/30 text-olive/60 hover:text-olive hover:bg-olive/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              aria-label="End focus session"
            >
              <X size={12} strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <ToolBtn
            icon={<Timer size={16} strokeWidth={1.75} />}
            label="Focus"
            active={panel === 'focus'}
            onClick={() => setPanel(p => p === 'focus' ? null : 'focus')}
          />
        )}

        <div className="w-px h-5 bg-border mx-1" />

        {/* Coffee break */}
        <ToolBtn
          icon={<Coffee size={16} strokeWidth={1.75} />}
          label={onBreak ? 'End Break' : 'Break'}
          active={onBreak}
          activeClass="text-clay"
          onClick={onToggleBreak}
        />

        {/* Music */}
        <ToolBtn icon={<Music size={16} strokeWidth={1.75} />} label="Music" active={musicOpen} onClick={onOpenMusic} />

        {/* Reactions */}
        <ToolBtn
          icon={<Smile size={16} strokeWidth={1.75} />}
          label="React"
          active={panel === 'reactions'}
          onClick={() => setPanel(p => p === 'reactions' ? null : 'reactions')}
        />

        {/* Carried item — contextual, only shows when holding something */}
        {carriedItem && (
          <>
            <div className="w-px h-5 bg-border mx-1" />
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted text-[12px] font-medium text-ink-2">
                <Package size={14} strokeWidth={1.75} />
                <span className="hidden sm:inline">{carriedLabel(carriedItem)}</span>
              </div>
              <button
                onClick={() => onUseItem?.(isBook(carriedItem) ? 'read' : 'drink')}
                className="px-2 py-1.5 rounded-lg text-[12px] text-ink-2 hover:text-ink hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                {isBook(carriedItem) ? 'Read' : 'Drink'}
              </button>
              <button
                onClick={onDropItem}
                className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                aria-label="Drop item"
                title="Drop item"
              >
                <X size={12} strokeWidth={1.75} />
              </button>
            </div>
          </>
        )}

        <div className="w-px h-5 bg-border mx-1" />

        {/* Profile */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          aria-label="Open dashboard"
          title="Dashboard"
        >
          <Home size={16} strokeWidth={1.75} className="text-ink-2" />
          <span className="text-[14px] text-ink-2">Dashboard</span>
        </button>
      </div>
    </>
  )
}

interface ToolBtnProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  activeClass?: string
}

function ToolBtn({ icon, label, active, onClick, activeClass = 'text-olive' }: ToolBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-[14px] font-medium transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-focus
        ${active
          ? `bg-olive-soft ${activeClass}`
          : 'text-ink-2 hover:text-ink hover:bg-muted'}`}
      aria-pressed={active}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
