import { useEffect } from 'react'

import { useDiagramStore } from '../store/diagramStore'
import { useSettingsStore } from '../store/settingsStore'

/**
 * Idle süresi sonrası, pencere blur'unda ve sekme gizlenince geçmişe snapshot alır.
 * Belge store aboneliğiyle izlenir; bileşen aboneliği App'i her tuş vuruşunda render ettirirdi.
 */
export function useAutoSnapshot(): void {
  const autoSaveEnabled = useSettingsStore((s) => s.autoSaveEnabled)
  const autoSaveIdleMs = useSettingsStore((s) => s.autoSaveIdleMs)

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
