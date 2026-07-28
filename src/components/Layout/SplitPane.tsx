import { useCallback, useEffect, useRef, useState } from 'react'

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
  const dragging = useRef(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      onMove(e.clientX)
    }
    const up = () => {
      dragging.current = false
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('mouseup', up)
    }
  }, [onMove])

  return (
    <div ref={containerRef} className="flex h-full w-full">
      <div style={{ width: `${leftPct}%` }} className="h-full min-w-0 overflow-hidden">
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={() => {
          dragging.current = true
          document.body.style.userSelect = 'none'
        }}
        className="group relative w-1.5 shrink-0 cursor-col-resize bg-border transition hover:bg-primary"
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>
      <div style={{ width: `${100 - leftPct}%` }} className="h-full min-w-0 overflow-hidden">
        {right}
      </div>
    </div>
  )
}
