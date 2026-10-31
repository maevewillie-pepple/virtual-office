import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Card({
  children, className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`rounded-[14px] border border-border bg-surface p-5 ${className}`}>{children}</div>
}

export function InteractiveCard({
  children, className = '', ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`rounded-[14px] border border-border bg-surface p-5 text-left transition-colors hover:border-olive/50 hover:bg-olive-soft/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
