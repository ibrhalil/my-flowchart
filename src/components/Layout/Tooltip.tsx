import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { isTooltipFocusOpenSuppressed } from './tooltipFocus'

interface TooltipProps {
  label: string
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
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

  // Tooltip'in neden açıldığı: fare üzerinde mi, klavye odağında mı. Kapatma kuralı buna bağlıdır.
  const sourceRef = useRef<'hover' | 'focus' | null>(null)

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    sourceRef.current = null
    setOpen(false)
  }, [])

  const showOnHover = useCallback(
    (e: React.PointerEvent) => {
      // Dokunmatikte sahte hover kalıcı takılır; tooltip yalnızca fare/kalem için.
      if (e.pointerType === 'touch') return
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        sourceRef.current = 'hover'
        setOpen(true)
      }, delay)
    },
    [delay],
  )

  // Açıkken yalnızca bileşenin kendi olaylarına güvenme: ayrılma olayı kaçsa bile
  // (tam ekran geçişi, devre dışı kalan buton, odak değişimi) tooltip kapanır.
  useEffect(() => {
    if (!open) return
    const onPointerMove = (e: PointerEvent) => {
      if (sourceRef.current !== 'hover') return
      const r = triggerRef.current?.getBoundingClientRect()
      const inside =
        !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
      if (!inside) hide()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide()
    }
    window.addEventListener('pointermove', onPointerMove, true)
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('blur', hide)
    window.addEventListener('scroll', hide, true)
    // Portal hedefi (body / tam ekran öğesi) değişir; eski konumda kalmasın.
    document.addEventListener('fullscreenchange', hide)
    return () => {
      window.removeEventListener('pointermove', onPointerMove, true)
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('blur', hide)
      window.removeEventListener('scroll', hide, true)
      document.removeEventListener('fullscreenchange', hide)
    }
  }, [open, hide])

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
        onPointerEnter={showOnHover}
        onPointerLeave={hide}
        onPointerDown={hide}
        onFocus={(e) => {
          // Programatik odak geri dönüşü tooltip'i faresiz açıp takılı bırakır (bkz. tooltipFocus).
          if (isTooltipFocusOpenSuppressed()) return
          // Fare tıklamasıyla gelen odak klavye odağı değildir; yalnızca klavye için aç.
          if (!e.target.matches(':focus-visible')) return
          sourceRef.current = 'focus'
          setOpen(true)
        }}
        onBlur={hide}
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
              className="pointer-events-none z-[100] whitespace-nowrap rounded-md bg-text px-2 py-1 text-2xs font-medium text-bg-surface shadow-md ring-1 ring-border"
            >
              {label}
            </span>,
            // Tam ekran açıkken portal, tam ekran alt ağacına giderek
            // üst katmanın (top layer) üzerinde görünebilir.
            document.fullscreenElement ?? document.body,
          )
        : null}
    </>
  )
}
