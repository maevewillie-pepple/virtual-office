import type { CarriedItem, OnlineUser, PresenceStatus, User } from '../types'
import { isUuid, supabase } from './client'

export interface PresencePayload {
  user: User
  gridX: number
  gridY: number
  status: PresenceStatus
  seated: boolean
  onBreak: boolean
  carried: CarriedItem | null
  focusEndsAt: string | null
  focusTopic: string | null
  focusPaused: boolean
}

export interface PresenceRoom {
  update: (payload: PresencePayload) => void
  leave: () => void
}

export function joinPresence(officeId: string, initial: PresencePayload, onSync: (people: PresencePayload[]) => void): PresenceRoom {
  const client = supabase()
  if (!client || !isUuid(officeId)) {
    return { update: () => {}, leave: () => {} }
  }
  const channel = client.channel(`presence:${officeId}`, {
    config: { presence: { key: initial.user.id } },
  })
  let latest = initial
  let ready = false
  const publish = () => {
    const state = channel.presenceState<PresencePayload>()
    const people: PresencePayload[] = []
    for (const group of Object.values(state)) {
      const current = group[0]
      if (current?.user?.id) people.push(current)
    }
    onSync(people)
  }
  channel.on('presence', { event: 'sync' }, publish)
  channel.subscribe(status => {
    if (status === 'SUBSCRIBED') {
      ready = true
      void channel.track(latest)
    }
  })
  return {
    update(payload) {
      latest = payload
      if (ready) void channel.track(payload)
    },
    leave() {
      void channel.untrack()
      void client.removeChannel(channel)
    },
  }
}

export function presenceToOnline(person: PresencePayload, mine: boolean): OnlineUser {
  return {
    user: { ...person.user, status: person.status },
    position: { gridX: person.gridX, gridY: person.gridY, x: person.gridX * 48, y: person.gridY * 48 },
    isCurrentUser: mine,
    seated: person.seated,
    coffeeBreak: person.onBreak ? { userId: person.user.id, startedAt: '' } : undefined,
    focusSession: person.focusEndsAt ? {
      userId: person.user.id,
      duration: 0,
      startedAt: '',
      endsAt: person.focusEndsAt,
      paused: person.focusPaused,
    } : undefined,
    carriedItem: person.carried ?? undefined,
  }
}
