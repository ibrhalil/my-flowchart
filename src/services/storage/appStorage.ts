// Aynı alan adını paylaşan başka şeylere dokunmamak için `localStorage.clear()` yerine yalnızca bu uygulamanın anahtarları silinir.
const APP_KEY_PREFIXES = ['mermaid-studio:', 'my-flowchart-']

const ERASED_FLAG = 'my-flowchart-erased'

/** Uygulamanın tarayıcıda sakladığı tüm veriyi siler. Depoya erişilemezse false döner. */
export function eraseAppStorage(): boolean {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key && APP_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) keys.push(key)
    }
    keys.forEach((key) => localStorage.removeItem(key))
    return true
  } catch {
    return false
  }
}

/** Yenileme sonrası "silindi" bildirimi için tek seferlik işaret (sekme kapanınca kendiliğinden gider). */
export function markErased(): void {
  try {
    sessionStorage.setItem(ERASED_FLAG, '1')
  } catch {
    // bildirim gösterilemez ama silme zaten yapıldı
  }
}

export function consumeErasedMark(): boolean {
  try {
    const marked = sessionStorage.getItem(ERASED_FLAG) === '1'
    if (marked) sessionStorage.removeItem(ERASED_FLAG)
    return marked
  } catch {
    return false
  }
}
