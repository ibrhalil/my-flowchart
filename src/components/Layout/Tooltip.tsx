import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  label: string
  children: ReactNode
  /** Tooltip'in çıkacağı yön. Default: top */
  side?: 'top' | 'bottom' | 'left' | 'right'
  /** Hover gecikmesi (ms). Default: 0 (anında) */
  delay?: number
  className?: string
}

type Side = NonNullable<TooltipProps['side']>

const GAP = 6
const VIEWPORT_MARGIN = 8

export function Tooltip({ label, children, side = 'top', delay = 0, className }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLSpanElement | null>(null)
  const tipRef = useRef<HTMLSpanElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setOpen(true), delay)
  }, [delay])

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpen(false)
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const tip = tipRef.current
    if (!trigger || !tip) return

    const tr = trigger.getBoundingClientRect()
    const pr = tip.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    let chosen: Side = side
    if (side === 'top' && tr.top < pr.height + GAP) chosen = 'bottom'
    else if (side === 'bottom' && vh - tr.bottom < pr.height + GAP) chosen = 'top'
    else if (side === 'left' && tr.left < pr.width + GAP) chosen = 'right'
    else if (side === 'right' && vw - tr.right < pr.width + GAP) chosen = 'left'

    let top: number
    let left: number
    switch (chosen) {
      case 'top':
        top = tr.top - pr.height - GAP
        left = tr.left + tr.width / 2 - pr.width / 2
        break
      case 'bottom':
        top = tr.bottom + GAP
        left = tr.left + tr.width / 2 - pr.width / 2
        break
      case 'left':
        top = tr.top + tr.height / 2 - pr.height / 2
        left = tr.left - pr.width - GAP
        break
      case 'right':
        top = tr.top + tr.height / 2 - pr.height / 2
        left = tr.right + GAP
        break
    }

    left = Math.min(Math.max(left, VIEWPORT_MARGIN), vw - pr.width - VIEWPORT_MARGIN)
    top = Math.min(Math.max(top, VIEWPORT_MARGIN), vh - pr.height - VIEWPORT_MARGIN)

    setCoords({ top, left })
  }, [open, side, label])

  return (
    <>
      <span
        ref={triggerRef}
        className={`relative inline-flex ${className ?? ''}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>
      {open
        ? createPortal(
            <span
              ref={tipRef}
              role="tooltip"
              style={{
                position: 'fixed',
                top: coords ? coords.top : -9999,
                left: coords ? coords.left : -9999,
              }}
              className="pointer-events-none z-[100] whitespace-nowrap rounded-md bg-text px-2 py-1 text-[11px] font-medium text-bg-surface shadow-md ring-1 ring-border"
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </>
  )
}
