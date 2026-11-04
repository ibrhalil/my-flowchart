import { useCallback, useRef, useState } from 'react'

import { useTranslation } from '../../lib/i18n'

interface SplitPaneProps {
  left: React.ReactNode
  right: React.ReactNode
  initialLeft?: number
  minLeft?: number
  maxLeft?: number
}

const MIN_LEFT_PX = 260
// Önizleme araç çubuğunun (8 buton) taşmadan sığması için gereken genişlik.
const MIN_RIGHT_PX = 360

export function SplitPane({
  left,
  right,
  initialLeft = 45,
  minLeft = 20,
  maxLeft = 80,
}: SplitPaneProps) {
  const [leftPct, setLeftPct] = useState(initialLeft)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const separatorRef = useRef<HTMLDivElement | null>(null)
  const { t } = useTranslation()

  const clampPct = useCallback(
    (pct: number): number => {
      const el = containerRef.current
      let lo = minLeft
      let hi = maxLeft
      if (el) {
        const w = el.getBoundingClientRect().width
        if (w > 0) {
          lo = Math.max(lo, (MIN_LEFT_PX / w) * 100)
          hi = Math.min(hi, ((w - MIN_RIGHT_PX) / w) * 100)
          if (hi < lo) {
            // Panel çok dar: yüzde sınırlarına geri dön
            lo = minLeft
            hi = maxLeft
          }
        }
      }
      return Math.min(hi, Math.max(lo, pct))
    },
    [minLeft, maxLeft],
  )

  const onMove = useCallback(
    (clientX: number) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const pct = ((clientX - rect.left) / rect.width) * 100
      setLeftPct(clampPct(pct))
    },
    [clampPct],
  )

  // Ayraçta pointer capture: sürükleme ayracın dışına çıksa da izlenir; `touch-action: none` sayfa kaydırmasını engeller.
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const sep = separatorRef.current
      if (!sep) return
      sep.setPointerCapture(e.pointerId)
      document.body.style.userSelect = 'none'
    },
    [],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.buttons === 0) return
      onMove(e.clientX)
    },
    [onMove],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const sep = separatorRef.current
      if (sep && sep.hasPointerCapture(e.pointerId)) {
        sep.releasePointerCapture(e.pointerId)
      }
      document.body.style.userSelect = ''
    },
    [],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 5 : 2
      let next: number | null = null
      if (e.key === 'ArrowLeft') next = leftPct - step
      else if (e.key === 'ArrowRight') next = leftPct + step
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = 100
      if (next === null) return
      e.preventDefault()
      setLeftPct(clampPct(next))
    },
    [leftPct, clampPct],
  )

  const pctValue = Math.round(leftPct)

  return (
    <div ref={containerRef} className="flex h-full w-full">
      <div style={{ width: `${leftPct}%` }} className="h-full min-w-0 overflow-hidden">
        {left}
      </div>
      <div
        ref={separatorRef}
        role="separator"
        aria-orientation="vertical"
        aria-label={t('layout.splitter')}
        aria-valuenow={pctValue}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="group relative w-1.5 shrink-0 cursor-col-resize bg-border transition hover:bg-primary focus-visible:bg-primary"
        style={{ touchAction: 'none' }}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>
      <div style={{ width: `${100 - leftPct}%` }} className="h-full min-w-0 overflow-hidden">
        {right}
      </div>
    </div>
  )
}
