import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'selected'
type Size = 'sm' | 'default' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
}

const SHADOW: Record<Variant, string> = {
  primary: '2px 2px 0 #66765C',
  secondary: '2px 2px 0 #A9AB9F',
  ghost: 'none',
  destructive: '2px 2px 0 #B44A3F',
  selected: '2px 2px 0 #66765C',
}

const BASE =
  'btn-stamp inline-flex items-center justify-center gap-2 font-mono font-bold uppercase tracking-wide ' +
  'transition-transform duration-75 ease-out focus:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface ' +
  'disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-ink-2 select-none'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-surface border-2 border-ink',
  secondary: 'bg-surface border-2 border-ink text-ink hover:bg-muted',
  ghost: 'bg-transparent text-ink hover:bg-muted border-2 border-transparent',
  destructive: 'bg-error-soft border-2 border-error text-error',
  selected: 'bg-olive-soft border-2 border-olive text-olive',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  default: 'h-9 px-4 text-[13px]',
  lg: 'h-11 px-5 text-[14px]',
}

export default function Button({
  variant = 'primary',
  size = 'default',
  loading = false,
  icon,
  iconRight,
  children,
  disabled,
  className = '',
  style,
  type = 'button',
  ...props
}: ButtonProps) {
  const off = disabled || loading
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={off}
      style={{ ['--btn-shadow' as string]: off ? 'none' : SHADOW[variant], ...style }}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  size?: Size
  variant?: Extract<Variant, 'primary' | 'secondary' | 'ghost'>
}

export function IconButton({
  label,
  size = 'default',
  variant = 'ghost',
  className = '',
  children,
  disabled,
  type = 'button',
  style,
  ...props
}: IconButtonProps) {
  const sizeMap: Record<Size, string> = {
    sm: 'h-8 w-8',
    default: 'h-9 w-9',
    lg: 'h-11 w-11',
  }
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`${BASE} ${VARIANTS[variant]} ${sizeMap[size]} ${className}`}
      style={{ ['--btn-shadow' as string]: disabled ? 'none' : SHADOW[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
