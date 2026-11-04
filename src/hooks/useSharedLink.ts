import { useEffect } from 'react'

import { rt } from '../lib/i18nRuntime'
import { decodeShare, isShareHash } from '../services/share/shareLink'
import { useDiagramStore } from '../store/diagramStore'

/** Adres `#s=…` içeriyorsa paylaşılan diyagramı açar (sayfa açılışında ve aynı sekmede bağlantı değişince). */
export function useSharedLink(): void {
  useEffect(() => {
    const openFromHash = async () => {
      const { hash, pathname, search } = window.location
      if (!isShareHash(hash)) return
      // Yenilemede ya da geri tuşunda tekrar yüklenip çalışmanı ezmesin.
      window.history.replaceState(null, '', pathname + search)
      const store = useDiagramStore.getState()
      try {
        const shared = await decodeShare(hash)
        store.loadProject({
          code: shared.code,
          title: shared.title || undefined,
          description: shared.description,
          backupCurrent: true,
          notice: rt('share.opened'),
        })
      } catch {
        store.setToast(rt('share.invalid'))
      }
    }
    void openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [])
}
