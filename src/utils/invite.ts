export function inviteCodeFromPath(pathname = window.location.pathname): string | null {
  const match = pathname.match(/^\/join\/([^/]+)\/?$/i)
  if (!match) return null
  try {
    const code = decodeURIComponent(match[1]).trim()
    return code || null
  } catch {
    return match[1].trim() || null
  }
}

export function inviteCodeFromInput(value: string): string {
  const trimmed = value.trim()
  const embedded = trimmed.match(/\/join\/([^/?#\s]+)/i)
  const raw = embedded?.[1] ?? trimmed
  try {
    return decodeURIComponent(raw).trim()
  } catch {
    return raw.trim()
  }
}

export function inviteLink(code: string): string {
  return `${window.location.origin}/join/${encodeURIComponent(code)}`
}

export function inviteLabel(code: string): string {
  return `${window.location.host}/join/${code}`
}
