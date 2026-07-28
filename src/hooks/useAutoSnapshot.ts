import { useEffect, useRef } from 'react'

import { useDiagramStore } from '../store/diagramStore'
import { useSettingsStore } from '../store/settingsStore'

/**
 * Otomatik snapshot (geçmişe kayıt) hook.
 *
 * Tetikleyiciler (yalnızca autoSaveEnabled=true iken):
 *   - Ayarlanan idle süresi (autoSaveIdleMs) sonrası
 *   - Window blur: sekme/penceme odağı kaybında
 *   - visibilitychange: sekme gizlenince
 *
 * saveSnapshot zaten diff'li olduğundan, tekrarlı çağrı güvenli.
 */
export function useAutoSnapshot(): void {
  const code = useDiagramStore((s) => s.code)
  const title = useDiagramStore((s) => s.title)
  const saveSnapshot = useDiagramStore((s) => s.saveSnapshot)

  const autoSaveEnabled = useSettingsStore((s) => s.autoSaveEnabled)
  const autoSaveIdleMs = useSettingsStore((s) => s.autoSaveIdleMs)

  const saveRef = useRef(saveSnapshot)
  saveRef.current = saveSnapshot

  // Idle tetikleyici
  useEffect(() => {
    if (!autoSaveEnabled) return
    const t = setTimeout(() => {
      saveRef.current()
    }, autoSaveIdleMs)
    return () => clearTimeout(t)
  }, [code, title, autoSaveEnabled, autoSaveIdleMs])

  // Window blur + visibilitychange tetikleyicileri
  useEffect(() => {
    if (!autoSaveEnabled) return
    const onBlur = () => saveRef.current()
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') saveRef.current()
    }
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [autoSaveEnabled])
}
