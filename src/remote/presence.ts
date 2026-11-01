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
    config: {
      broadcast: { self: false },
      presence: { key: initial.user.id, enabled: true },
    },
  })
  let latest = initial
  let ready = false
  let trackedAt = 0
  let lastKey = ''
  const places = new Map<string, PresencePayload>()
  const heard = new Map<string, number>()

  const readPresence = () => {
    const state = channel.presenceState<PresencePayload>()
    const people: PresencePayload[] = []
    for (const group of Object.values(state)) {
      const current = group[group.length - 1]
      if (current?.user?.id) people.push(current)
    }
    return people
  }

  const remember = (person: PresencePayload) => {
    if (!person?.user?.id) return
    places.set(person.user.id, person)
    heard.set(person.user.id, Date.now())
  }

  const publish = () => {
    const now = Date.now()
    const byId = new Map<string, PresencePayload>()
    for (const person of readPresence()) {
      byId.set(person.user.id, person)
      heard.set(person.user.id, now)
    }
    for (const [id, place] of places) {
      if (now - (heard.get(id) ?? 0) > 12000) {
        places.delete(id)
        heard.delete(id)
        continue
      }
      const known = byId.get(id)
      byId.set(id, known ? { ...known, ...place, user: known.user } : place)
    }
    const list = [...byId.values()]
    const key = list.map(person => `${person.user.id}:${person.gridX}:${person.gridY}:${person.status}`).sort().join('|')
    if (key === lastKey) return
    lastKey = key
    onSync(list)
  }

  const announce = (forceTrack: boolean) => {
    if (!ready) return
    void channel.send({ type: 'broadcast', event: 'move', payload: latest })
    const now = Date.now()
    if (!forceTrack && now - trackedAt < 400) return
    trackedAt = now
    void channel.track(latest)
  }

  channel.on('presence', { event: 'sync' }, publish)
  channel.on('broadcast', { event: 'move' }, ({ payload }: { payload?: PresencePayload }) => {
    if (!payload?.user?.id || payload.user.id === initial.user.id) return
    remember(payload)
    publish()
  })
  channel.subscribe(status => {
    if (status === 'SUBSCRIBED') {
      ready = true
      announce(true)
    }
  })
  const pulse = setInterval(() => {
    if (!ready) return
    void channel.send({ type: 'broadcast', event: 'move', payload: latest })
    void channel.track(latest)
  }, 4000)
  return {
    update(payload) {
      latest = payload
      announce(false)
    },
    leave() {
      clearInterval(pulse)
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
