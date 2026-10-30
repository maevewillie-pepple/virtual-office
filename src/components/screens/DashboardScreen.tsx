import React, { useState } from 'react'
import type { Office, User } from '../../types'
import { demoOffices } from '../../data/mockData'
import { Plus, LogIn } from 'lucide-react'
import Button from '../ui/Button'

interface DashboardScreenProps {
  currentUser: User
  onEnterOffice: (officeId: string) => void
  onCreateOffice: () => void
  onJoinOffice: () => void
}

export default function DashboardScreen({
  currentUser, onEnterOffice, onCreateOffice, onJoinOffice
}: DashboardScreenProps) {
  const [offices] = useState<Office[]>(demoOffices)

  return (
    <div className="min-h-screen bg-canvas">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">🦋</span>
          <span className="text-ink font-semibold text-[14px]">Virtual Office</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="type-small text-ink-3">{currentUser.email}</span>
          <div className="w-7 h-7 rounded-full bg-olive-soft border border-olive/30 flex items-center justify-center text-olive text-[12px] font-semibold">
            {currentUser.name[0]}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-10 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="type-h2 text-ink">Your offices</h1>
            <p className="type-body text-ink-2 mt-1">Welcome back, {currentUser.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onJoinOffice}>
              Join
            </Button>
            <Button size="sm" onClick={onCreateOffice} icon={<Plus size={14} strokeWidth={1.75} />}>
              Create
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {offices.map(office => (
            <OfficeCard
              key={office.id}
              office={office}
              isOwner={office.ownerId === currentUser.id}
              onEnter={() => onEnterOffice(office.id)}
            />
          ))}
          {/* Empty create card */}
          <button
            onClick={onCreateOffice}
            className="p-5 rounded-lg border border-dashed border-border hover:border-olive/40 hover:bg-olive-soft/40 transition-all text-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <div className="text-2xl mb-2 text-ink-3 group-hover:text-olive transition-colors">+</div>
            <p className="type-small text-ink-3 group-hover:text-ink-2 transition-colors">Create new office</p>
          </button>
        </div>

        {/* Quick join */}
        <div className="mt-8 p-4 rounded-lg border border-border bg-surface">
          <p className="type-label text-ink mb-3">Join with invite code</p>
          <div className="flex gap-2">
            <input
              placeholder="XXXX-XXXX"
              className="flex-1 h-9 bg-canvas border border-border px-3 text-[13px] text-ink placeholder-ink-3 font-mono
                focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/30 uppercase"
              maxLength={9}
            />
            <Button variant="secondary" size="default" onClick={onJoinOffice} icon={<LogIn size={14} strokeWidth={1.75} />}>
              Join
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

function OfficeCard({
  office, isOwner, onEnter
}: { office: Office; isOwner: boolean; onEnter: () => void }) {
  return (
    <div className="p-5 rounded-lg border border-border bg-surface hover:border-olive/30 transition-all fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-muted">
          {office.coverEmoji || '🏢'}
        </div>
        {isOwner && (
          <span className="type-small text-olive border border-olive/30 px-1.5 py-0.5 bg-olive-soft">
            Owner
          </span>
        )}
      </div>

      <h3 className="type-label text-ink mb-0.5 text-[14px] font-semibold">{office.name}</h3>
      <p className="type-small text-ink-2 mb-4 leading-relaxed line-clamp-2">{office.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft"
            aria-label="Online members"
          />
          <span className="type-small text-ink-2">{office.onlineCount} online · {office.memberCount} total</span>
        </div>
        <Button variant="secondary" size="sm" onClick={onEnter}>
          Enter
        </Button>
      </div>
    </div>
  )
}
