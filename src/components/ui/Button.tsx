import { forwardRef } from 'react'
import { Tooltip } from '../Layout/Tooltip'

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'danger-soft'
type ButtonSize = 'sm' | 'md'

interface ButtonOwnProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

export type ButtonProps = ButtonOwnProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-8 px-3 text-xs gap-1.5',
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50',
  ghost:
    'border border-border bg-bg-surface text-text-muted transition hover:bg-bg-subtle hover:text-text disabled:cursor-not-allowed disabled:opacity-50',
  danger:
    'text-danger transition hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-40',
  'danger-soft':
    'border border-danger/30 bg-danger-soft text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'ghost', size = 'md', className = '', disabled, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md font-medium ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
})

/* ------------------------------------------------------------------ */
/*  IconButton — icon-only Button with auto Tooltip                    */
/* ------------------------------------------------------------------ */

interface IconButtonOwnProps {
  label: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export type IconButtonProps = IconButtonOwnProps &
  Omit<ButtonProps, keyof IconButtonOwnProps>

export function IconButton({
  label,
  side = 'bottom',
  className = '',
  children,
  ...rest
}: IconButtonProps) {
  return (
    <Tooltip label={label} side={side}>
      <Button className={`h-7! w-7! px-0! ${className}`} {...rest}>
        {children}
      </Button>
    </Tooltip>
  )
}
