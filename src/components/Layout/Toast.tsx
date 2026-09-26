import { useEffect, useState } from 'react'

import { useDiagramStore } from '../../store/diagramStore'

export function Toast() {
  const toast = useDiagramStore((s) => s.toast)
  const setToast = useDiagramStore((s) => s.setToast)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!toast) return
    setVisible(true)
    // İki zamanlayıcıyı da temizle: yeni toast eski çıkış animasyonunun
    // içine düşerse eski zamanlayıcı yeni bildirimi silmesin.
    const hide = setTimeout(() => setVisible(false), 3000)
    const clear = setTimeout(() => setToast(null), 3200)
    return () => {
      clearTimeout(hide)
      clearTimeout(clear)
    }
  }, [toast, setToast])

  if (!toast) return null

  return (
    <div
      role="status"
      aria-live="polite"
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
