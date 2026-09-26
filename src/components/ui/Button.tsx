import { forwardRef, type Ref } from 'react'
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
    'bg-primary text-on-primary shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50',
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
  /** Tetikleyici <button>'a iletilir (ör. Escape sonrası odağı geri döndürmek için). */
  ref?: Ref<HTMLButtonElement>
}

export type IconButtonProps = IconButtonOwnProps &
  Omit<ButtonProps, keyof IconButtonOwnProps>

export function IconButton({
  label,
  side = 'bottom',
  className = '',
  children,
  ref,
  ...rest
}: IconButtonProps) {
  return (
    <Tooltip label={label} side={side}>
      {/* aria-label: tooltip görsel bir ek; erişilebilir ad düğmenin kendisinde olmalı.
          Boyutlar cihaz duyarlıdır: küçük ekranda 32px/16px ikon, sm ve
          üzerinde 36px/18px ikon. İkon boyutu sarmalayıcıdaki CSS ile
          belirlenir; lucide size özniteliğini CSS ezer. */}
      <Button
        ref={ref}
        aria-label={label}
        className={`h-8! w-8! px-0! sm:h-9! sm:w-9! [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-[18px] sm:[&_svg]:w-[18px] ${className}`}
        {...rest}
      >
        {children}
      </Button>
    </Tooltip>
  )
}
