import { create } from 'zustand'

import { DEFAULT_TEMPLATE } from '../data/templates'
import type { HistoryEntry, AppTheme } from '../types/project'
import { rt, getRuntimeLocale } from '../lib/i18nRuntime'
import { useSettingsStore } from './settingsStore'
import * as draftStorage from '../services/storage/draftStorage'
import * as history from '../services/storage/localHistory'
import { consumeErasedMark, eraseAppStorage, markErased } from '../services/storage/appStorage'

export type DraftSaveState = 'saved' | 'pending' | 'error'

export interface DiagramState {
  title: string
  description: string
  code: string
  updatedAt: number

  history: HistoryEntry[]
  toast: string | null
  /** Kullanıcı düzenlemesi yapıldı mı? Dış yüklemeden sonra false; history kararı içindir, persist edilmez. */
  dirty: boolean
  draftState: DraftSaveState

  setTitle: (t: string) => void
  setDescription: (d: string) => void
  setCode: (c: string) => void
  /** Dış import/şablon yükleme. theme/pngScale verilirse ayarlara da yansıtılır. */
  loadProject: (p: {
    code: string
    title?: string
    description?: string
    theme?: AppTheme
    pngScale?: number
    /** Mevcut belge kaydedilmemiş olarak işaretlenmese de (örn. açılışta) geçmişe yedeklenir. */
    backupCurrent?: boolean
    /** Başarılı yüklemede `Yüklendi` yerine gösterilecek bildirim. */
    notice?: string
  }) => void
  /** Boş bir belge açar; kaydedilmemiş düzenleme önce geçmişe alınır. */
  newDocument: () => void
  setToast: (t: string | null) => void

  refreshHistory: () => void
  saveSnapshot: () => void
  removeHistory: (id: string) => void
  clearHistory: () => void
  restoreHistory: (id: string) => void
}

function bootstrap(): Pick<DiagramState, 'title' | 'description' | 'code' | 'updatedAt'> {
  const draft = draftStorage.loadDraft()
  // Boş bir belge de geçerli bir taslaktır (kullanıcı editörü bilerek boşaltmış olabilir).
  if (draft && typeof draft.code === 'string') {
    return {
      title: draft.title ?? rt('defaultTitle'),
      description: draft.description ?? '',
      code: draft.code,
      updatedAt: draft.updatedAt ?? Date.now(),
    }
  }
  const en = getRuntimeLocale() === 'en'
  return {
    title: (en && DEFAULT_TEMPLATE.titleEn) || DEFAULT_TEMPLATE.title,
    description: (en && DEFAULT_TEMPLATE.descriptionEn) || DEFAULT_TEMPLATE.description,
    code: (en && DEFAULT_TEMPLATE.codeEn) || DEFAULT_TEMPLATE.code,
    updatedAt: Date.now(),
  }
}

const initial = bootstrap()

// Veri silinirken bekleyen taslak/anlık kayıt yazmaları, silinen veriyi geri yazmasın.
let writesBlocked = false

const newHistoryId = () => `h-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

/** Boş belge ya da hiç dokunulmamış varsayılan şablon yedeklenmeye değmez (geçmiş gereksiz dolmasın). */
function isWorthBackingUp(s: DiagramState): boolean {
  const code = s.code.trim()
  if (!code) return false
  return code !== DEFAULT_TEMPLATE.code.trim() && code !== (DEFAULT_TEMPLATE.codeEn ?? '').trim()
}

/** Kaydedilmemiş düzenlemeyi geçmişe alır; yazma başarısızsa true döner. */
function backupDirtyState(get: () => DiagramState): boolean {
  if (!get().dirty) return false
  get().saveSnapshot()
  return get().dirty
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  title: initial.title,
  description: initial.description,
  code: initial.code,
  updatedAt: initial.updatedAt,
  history: history.loadHistory(),
  toast: consumeErasedMark() ? rt('toasts.dataErased') : null,
  dirty: false,
  draftState: 'saved',

  setTitle: (title) => set({ title, updatedAt: Date.now(), dirty: true }),
  setDescription: (description) => set({ description, updatedAt: Date.now(), dirty: true }),
  setCode: (code) => set({ code, updatedAt: Date.now(), dirty: true }),

  loadProject: (p) => {
    const patch: Partial<{ theme: AppTheme; pngScale: number }> = {}
    if (p.theme) patch.theme = p.theme
    if (typeof p.pngScale === 'number') patch.pngScale = p.pngScale
    if (Object.keys(patch).length) {
      try {
        useSettingsStore.getState().apply(patch)
      } catch {
        // Ayar kalıcı olarak yazılamadı; belge yüklemesi yine de devam etsin.
      }
    }

    // Kullanıcı düzenlemesi kaybolmasın diye mevcut durum önce geçmişe alınır.
    if (p.backupCurrent && isWorthBackingUp(get())) set({ dirty: true })
    const backupFailed = backupDirtyState(get)

    // Yeni belge, önceki belgenin başlığını/açıklamasını miras almaz.
    set({
      code: p.code,
      title: p.title ?? rt('defaultTitle'),
      description: p.description ?? '',
      updatedAt: Date.now(),
      dirty: false,
      toast: backupFailed ? rt('toasts.loadedNotBackedUp') : (p.notice ?? rt('toasts.loaded')),
    })
  },

  newDocument: () => {
    const backupFailed = backupDirtyState(get)
    set({
      code: '',
      title: rt('defaultTitle'),
      description: '',
      updatedAt: Date.now(),
      dirty: false,
      toast: rt(backupFailed ? 'toasts.loadedNotBackedUp' : 'toasts.created'),
    })
  },

  setToast: (toast) => set({ toast }),

  refreshHistory: () => set({ history: history.loadHistory() }),

  saveSnapshot: () => {
    const s = get()
    if (!s.dirty || writesBlocked) return
    const last = s.history[0]
    if (
      last &&
      last.code === s.code &&
      last.title === s.title &&
      (last.description ?? '') === s.description
    ) {
      set({ dirty: false })
      return
    }
    const entry: HistoryEntry = {
      id: newHistoryId(),
      title: s.title,
      description: s.description,
      code: s.code,
      savedAt: Date.now(),
    }
    const res = history.pushHistory(entry)
    if (!res.ok) {
      // Kalıcı yazma başarısız: dirty kalsın, kullanıcı uyarılsın.
      set({ toast: rt('toasts.saveFailed') })
      return
    }
    set({ history: res.entries, dirty: false })
  },

  removeHistory: (id) => {
    const res = history.removeHistory(id)
    set({
      history: res.entries,
      ...(res.ok ? {} : { toast: rt('toasts.saveFailed') }),
    })
  },

  clearHistory: () => {
    const ok = history.clearHistory()
    set({
      history: [],
      toast: ok ? rt('toasts.historyCleared') : rt('toasts.saveFailed'),
    })
  },

  restoreHistory: (id) => {
    const s = get()
    const entry = s.history.find((e) => e.id === id)
    if (!entry) return
    const backupFailed = backupDirtyState(get)
    set({
      code: entry.code,
      title: entry.title,
      // Eski kayıtlarda description yoksa mevcut değeri koru.
      description: entry.description ?? s.description,
      updatedAt: Date.now(),
      dirty: false,
      toast: backupFailed
        ? rt('toasts.loadedNotBackedUp')
        : rt('preview.restored', { title: entry.title }),
    })
  },
}))

let saveTimer: ReturnType<typeof setTimeout> | null = null

// Bu sekmenin depoda bildiği son taslak zamanı; daha yeni bir kayıt başka sekmeden gelmiştir.
let knownDraftUpdatedAt = initial.updatedAt

/** Başka sekmenin yazdığı taslağı, üzerine yazmadan önce geçmişe alır (veri kaybı olmasın). */
function backupOtherTabDraft(current: DiagramState): void {
  const other = draftStorage.loadDraft()
  if (!other || typeof other.code !== 'string') return
  if (typeof other.updatedAt !== 'number' || other.updatedAt <= knownDraftUpdatedAt) return
  const same =
    other.code === current.code &&
    (other.title ?? '') === current.title &&
    (other.description ?? '') === current.description
  if (same) return
  const res = history.pushHistory({
    id: newHistoryId(),
    title: other.title ?? '',
    description: other.description ?? '',
    code: other.code,
    savedAt: other.updatedAt,
  })
  if (res.ok) {
    useDiagramStore.setState({ history: res.entries, toast: rt('toasts.otherTabBackedUp') })
  }
}

/** Bekleyen taslak kaydını iptal eder ve sonraki tüm depolama yazmalarını durdurur. */
export function blockStorageWrites(): void {
  writesBlocked = true
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
}

/** Tarayıcıdaki tüm uygulama verisini siler. Başarılıysa çağıran sayfayı yenilemelidir. */
export function eraseAllData(): boolean {
  blockStorageWrites()
  const ok = eraseAppStorage()
  if (ok) markErased()
  else writesBlocked = false
  return ok
}

function writeDraftNow(): void {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  if (writesBlocked) return
  const s = useDiagramStore.getState()
  backupOtherTabDraft(s)
  const ok = draftStorage.saveDraft({
    title: s.title,
    description: s.description,
    code: s.code,
    updatedAt: s.updatedAt,
  })
  if (ok) knownDraftUpdatedAt = s.updatedAt
  const wasError = s.draftState === 'error'
  useDiagramStore.setState({ draftState: ok ? 'saved' : 'error' })
  if (!ok && !wasError) {
    useDiagramStore.setState({ toast: rt('toasts.saveFailed') })
  }
}

export function flushDraft(): void {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
    writeDraftNow()
  }
}

// Yalnızca belge alanları değiştiğinde taslak kaydını planla; toast/history
// gibi arayüz güncellemeleri zamanlayıcıyı sıfırlamasın.
useDiagramStore.subscribe((s, prev) => {
  if (
    s.code === prev.code &&
    s.title === prev.title &&
    s.description === prev.description &&
    s.updatedAt === prev.updatedAt
  ) {
    return
  }
  if (useDiagramStore.getState().draftState !== 'error') {
    useDiagramStore.setState({ draftState: 'pending' })
  }
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(writeDraftNow, 800)
})

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushDraft)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushDraft()
  })
}
