import { useEffect } from 'react'

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
 *
 * Belge alanları bileşen yerine store aboneliğiyle izlenir; aksi halde
 * App her tuş vuruşunda yeniden render olurdu.
 */
export function useAutoSnapshot(): void {
  const autoSaveEnabled = useSettingsStore((s) => s.autoSaveEnabled)
  const autoSaveIdleMs = useSettingsStore((s) => s.autoSaveIdleMs)

  // Idle tetikleyici: belge her değiştiğinde sayaç yeniden başlar.
  useEffect(() => {
    if (!autoSaveEnabled) return
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(() => useDiagramStore.getState().saveSnapshot(), autoSaveIdleMs)
    }
    schedule()
    const unsubscribe = useDiagramStore.subscribe((s, prev) => {
      if (s.code !== prev.code || s.title !== prev.title || s.description !== prev.description) {
        schedule()
      }
    })
    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [autoSaveEnabled, autoSaveIdleMs])

  // Window blur + visibilitychange tetikleyicileri
  useEffect(() => {
    if (!autoSaveEnabled) return
    const save = () => useDiagramStore.getState().saveSnapshot()
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') save()
    }
    window.addEventListener('blur', save)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('blur', save)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [autoSaveEnabled])
}
