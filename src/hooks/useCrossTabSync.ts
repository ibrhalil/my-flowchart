import { useEffect } from 'react'

import { blockStorageWrites, useDiagramStore } from '../store/diagramStore'
import { SETTINGS_STORAGE_KEY, useSettingsStore } from '../store/settingsStore'
import { HISTORY_KEY } from '../services/storage/localHistory'
import { DRAFT_KEY } from '../services/storage/draftStorage'

/** Başka bir sekme geçmişi ya da ayarları değiştirince görünümü günceller; veri silinirse sekmeyi yeniler. */
export function useCrossTabSync(): void {
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      // Başka sekmede "tüm verileri sil" çalıştı: bu sekme eski belgeyi geri yazmasın.
      if (e.key === null || (e.key === DRAFT_KEY && e.oldValue !== null && e.newValue === null)) {
        blockStorageWrites()
        window.location.reload()
        return
      }
      // key === null: depo tamamen temizlendi.
      if (e.key === null || e.key === HISTORY_KEY) useDiagramStore.getState().refreshHistory()
      if (e.key === null || e.key === SETTINGS_STORAGE_KEY) void useSettingsStore.persist.rehydrate()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
}
