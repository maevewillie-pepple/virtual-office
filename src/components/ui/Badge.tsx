import type { ReactNode } from 'react'

const TONES = {
  olive: 'bg-olive-soft text-olive',
  clay: 'bg-clay-soft text-clay',
  muted: 'bg-muted text-ink-2',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
}

export default function Badge({
  children, tone = 'muted',
}: {
  children: ReactNode
  tone?: keyof typeof TONES
}) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[13px] font-medium ${TONES[tone]}`}>{children}</span>
}
