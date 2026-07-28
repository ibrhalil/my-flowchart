import type { HistoryEntry } from '../../types/project'

const KEY = 'mermaid-studio:history:v1'
const MAX_ENTRIES = 50

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (e): e is HistoryEntry =>
        e &&
        typeof e.id === 'string' &&
        typeof e.code === 'string' &&
        typeof e.savedAt === 'number',
    )
  } catch {
    return []
  }
}

function persist(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {
    // Depolama dolu olabilir; sessizce yutalım
  }
}

export function pushHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...loadHistory().filter((e) => e.code !== entry.code)].slice(0, MAX_ENTRIES)
  persist(next)
  return next
}

export function removeHistory(id: string): HistoryEntry[] {
  const next = loadHistory().filter((e) => e.id !== id)
  persist(next)
  return next
}

export function clearHistory(): void {
  persist([])
}
