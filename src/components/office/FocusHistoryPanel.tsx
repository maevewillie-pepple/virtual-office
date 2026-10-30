import React, { useMemo } from 'react'
import type { FocusHistoryEntry } from '../../types'
import { X, Clock, Target } from 'lucide-react'

interface FocusHistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  history: FocusHistoryEntry[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function FocusHistoryPanel({ isOpen, onClose, history }: FocusHistoryPanelProps) {
  const weekData = useMemo(() => {
    const now = new Date()
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      return d
    })
    return days.map(day => {
      const next = new Date(day)
      next.setDate(next.getDate() + 1)
      const dayEntries = history.filter(e => {
        const t = new Date(e.startedAt).getTime()
        return t >= day.getTime() && t < next.getTime()
      })
      const minutes = dayEntries.reduce((sum, e) => sum + e.duration, 0)
      return { label: DAYS[day.getDay()], minutes, isToday: day.toDateString() === now.toDateString() }
    })
  }, [history])

  const maxMinutes = Math.max(...weekData.map(d => d.minutes), 60)
  const totalToday = weekData[6].minutes
  const totalWeek = weekData.reduce((s, d) => s + d.minutes, 0)
  const completedSessions = history.filter(e => e.completed).length

  const recent = [...history].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 10)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(48,53,47,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface shadow-2xl fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="type-h3 text-ink">Focus History</h2>
            <p className="type-small text-ink-3 mt-0.5">Private · only visible to you</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-ink-3 hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Today" value={`${totalToday}m`} />
            <StatCard label="This week" value={`${totalWeek}m`} />
            <StatCard label="Sessions" value={`${completedSessions}`} />
          </div>

          {/* Weekly bar chart */}
          <div>
            <p className="type-label text-ink-2 mb-3">Last 7 days</p>
            <div className="flex items-end gap-1.5 h-20">
              {weekData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex-1 relative flex items-end">
                    <div
                      className={`w-full rounded-t transition-all ${day.isToday ? 'bg-olive' : 'bg-muted'}`}
                      style={{
                        height: day.minutes > 0 ? `${Math.max(4, (day.minutes / maxMinutes) * 100)}%` : '4%',
                        opacity: day.minutes > 0 ? 1 : 0.3,
                      }}
                    />
                  </div>
                  <span className={`text-[9px] font-mono ${day.isToday ? 'text-olive font-bold' : 'text-ink-3'}`}>
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent sessions */}
          <div>
            <p className="type-label text-ink-2 mb-2">Recent sessions</p>
            {recent.length === 0 ? (
              <p className="type-small text-ink-3 py-3 text-center">
                No focus sessions yet. Start your first one below.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {recent.map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-canvas border border-border"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${entry.completed ? 'bg-olive' : 'bg-ink-3'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="type-small text-ink truncate">{entry.topic || 'Deep work'}</p>
                      <p className="text-[10px] text-ink-3 font-mono">
                        {new Date(entry.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {' · '}{entry.duration}m
                        {!entry.completed && ' · interrupted'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-ink-3">
                      <Clock size={11} />
                      <span className="text-[11px] font-mono">{entry.duration}m</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-canvas p-3 text-center">
      <p className="type-label text-ink-3">{label}</p>
      <p className="text-[18px] font-bold text-ink mt-1 font-mono">{value}</p>
    </div>
  )
}
