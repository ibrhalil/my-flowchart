import type { HistoryEntry } from '../../types/project'

const KEY = 'mermaid-studio:history:v1'
const MAX_ENTRIES = 50

export interface HistoryUpdate {
  entries: HistoryEntry[]
  /** Kalıcı depoya yazma başarılı mı? */
  ok: boolean
}

function isValidEntry(e: unknown): boolean {
  return (
    !!e &&
    typeof e === 'object' &&
    typeof (e as HistoryEntry).id === 'string' &&
    typeof (e as HistoryEntry).code === 'string' &&
    typeof (e as HistoryEntry).savedAt === 'number'
  )
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isValidEntry)
      .map((e) => {
        const entry = e as HistoryEntry
        return {
          ...entry,
          title: typeof entry.title === 'string' ? entry.title : '',
        }
      })
  } catch {
    return []
  }
}

function persist(entries: HistoryEntry[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
    return true
  } catch {
    // Depolama dolu olabilir; çağıran taraf hata durumunu bilir.
    return false
  }
}

export function pushHistory(entry: HistoryEntry): HistoryUpdate {
  // Aynı belgeyi (kod + başlık) tekrar kaydetme; açıklama değişimi yeni sürümdür.
  const next = [
    entry,
    ...loadHistory().filter((e) => e.code !== entry.code || e.title !== entry.title),
  ].slice(0, MAX_ENTRIES)
  return { entries: next, ok: persist(next) }
}

export function removeHistory(id: string): HistoryUpdate {
  const next = loadHistory().filter((e) => e.id !== id)
  return { entries: next, ok: persist(next) }
}

export function clearHistory(): boolean {
  return persist([])
}
