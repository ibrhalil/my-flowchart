import { useEffect, useState } from 'react'

import { encodeShare, type SharedProject } from '../services/share/shareLink'

/**
 * Paylaşım bağlantısını arka planda önceden hesaplar. Tıklamada hazır olması gerekir:
 * Safari, `await` sonrasında yapılan paylaş/kopyala çağrısını kullanıcı jesti saymaz.
 * Belge değiştiği anda eski bağlantı geçersiz sayılır (null döner).
 */
export function useShareUrl({ title, description, code }: SharedProject): string | null {
  const key = `${title}\u0000${description}\u0000${code}`
  const [cached, setCached] = useState<{ key: string; url: string } | null>(null)

  useEffect(() => {
    if (!code.trim()) return
    let cancelled = false
    const timer = setTimeout(() => {
      encodeShare({ title, description, code }).then(
        (url) => {
          if (!cancelled) setCached({ key, url })
        },
        () => {
          // Hazır bağlantı yoksa tıklamada anlık hesaplanır.
        },
      )
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [key, title, description, code])

  return code.trim() && cached?.key === key ? cached.url : null
}
