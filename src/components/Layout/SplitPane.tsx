import { useCallback, useRef, useState } from 'react'

interface SplitPaneProps {
  left: React.ReactNode
  right: React.ReactNode
  /** Sol panelin başlangıç yüzdesi */
  initialLeft?: number
  minLeft?: number
  maxLeft?: number
}

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

  const onMove = useCallback(
    (clientX: number) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const pct = ((clientX - rect.left) / rect.width) * 100
      setLeftPct(Math.min(maxLeft, Math.max(minLeft, pct)))
    },
    [minLeft, maxLeft],
  )

  // Pointer Events: fare + dokunmatik + kalem tek API altında.
  // Ayraç üzerine pointer capture alınır, böylece sürükleme ayracın dışına çıksa
  // bile takip edilir ve sayfa kaydırması `touch-action: none` ile engellenir.
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

  return (
    <div ref={containerRef} className="flex h-full w-full">
      <div style={{ width: `${leftPct}%` }} className="h-full min-w-0 overflow-hidden">
        {left}
      </div>
      <div
        ref={separatorRef}
        role="separator"
        aria-orientation="vertical"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="group relative w-1.5 shrink-0 cursor-col-resize bg-border transition hover:bg-primary"
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
