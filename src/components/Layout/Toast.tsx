import { useEffect, useState } from 'react'

import { useDiagramStore } from '../../store/diagramStore'

export function Toast() {
  const toast = useDiagramStore((s) => s.toast)
  const setToast = useDiagramStore((s) => s.setToast)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!toast) return
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(() => setToast(null), 200)
    }, 3000)
    return () => clearTimeout(t)
  }, [toast, setToast])

  if (!toast) return null

  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-2 z-50 -translate-x-1/2 transition-all duration-200 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}
    >
      <div className="rounded-lg bg-text px-4 py-2 text-sm font-medium text-bg-surface shadow-lg ring-1 ring-border">
        {toast}
      </div>
    </div>
  )
}
