import { create } from 'zustand'

import { DEFAULT_TEMPLATE } from '../data/templates'
import type { HistoryEntry, AppTheme } from '../types/project'
import { rt } from '../lib/i18nRuntime'
import { useSettingsStore } from './settingsStore'
import * as draftStorage from '../services/storage/draftStorage'
import * as history from '../services/storage/localHistory'

/** Taslak (draft) kalıcılık durumu — arayüz göstergesi için */
export type DraftSaveState = 'saved' | 'pending' | 'error'

export interface DiagramState {
  title: string
  description: string
  code: string
  updatedAt: number

  history: HistoryEntry[]
  /** Kullanıcıya gösterilecek kısa süreli bildirim */
  toast: string | null
  /** Kullanıcı düzenlemesi yapıldı mı? (dış yükleme sonrası false; history kararı içindir, persist edilmez) */
  dirty: boolean
  /** Taslağın tarayıcı deposuna yazılma durumu */
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
  }) => void
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
  return {
    title: DEFAULT_TEMPLATE.title,
    description: DEFAULT_TEMPLATE.description,
    code: DEFAULT_TEMPLATE.code,
    updatedAt: Date.now(),
  }
}

const initial = bootstrap()

export const useDiagramStore = create<DiagramState>((set, get) => ({
  title: initial.title,
  description: initial.description,
  code: initial.code,
  updatedAt: initial.updatedAt,
  history: history.loadHistory(),
  toast: null,
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

    // Şablon/içe aktarma gibi dış yüklemeden önce, kullanıcı düzenleme yaptıysa
    // mevcut durumu history'ye kaydet (düzenleme kaybolmasın). Şablonun kendisi
    // history'ye yazılmaz (aşağıda dirty:false).
    if (get().dirty) get().saveSnapshot()

    set({
      code: p.code,
      title: p.title ?? get().title,
      description: p.description ?? get().description,
      updatedAt: Date.now(),
      dirty: false,
      toast: rt('toasts.loaded'),
    })
  },

  setToast: (toast) => set({ toast }),

  refreshHistory: () => set({ history: history.loadHistory() }),

  saveSnapshot: () => {
    const s = get()
    // Sadece kullanıcı düzenlemesi yapılmışsa kaydet (şablon geçişi gibi dış
    // yüklemeler kaydedilmez).
    if (!s.dirty) return
    const last = s.history[0]
    // Son snapshot ile aynıysa (code + title + description) tekrar kaydetme
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
      id: `h-${Date.now().toString(36)}`,
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
    set({ history: res.entries, dirty: false, toast: rt('toasts.autosaved') })
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
    // Geri yükleme mevcut belgeyi ezer; kaydedilmemiş düzenleme varsa
    // önce history'ye checkpoint al.
    if (s.dirty) s.saveSnapshot()
    set({
      code: entry.code,
      title: entry.title,
      // Eski kayıtlarda description yoksa mevcut değeri koru.
      description: entry.description ?? s.description,
      updatedAt: Date.now(),
      dirty: false,
      toast: rt('preview.restored', { title: entry.title }),
    })
  },
}))

/* ------------------------------------------------------------------ */
/*  Taslak (draft) kalıcılığı                                          */
/* ------------------------------------------------------------------ */

let saveTimer: ReturnType<typeof setTimeout> | null = null

function writeDraftNow(): void {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  const s = useDiagramStore.getState()
  const { theme, pngScale } = useSettingsStore.getState()
  const ok = draftStorage.saveDraft({
    title: s.title,
    description: s.description,
    code: s.code,
    theme,
    pngScale,
    updatedAt: s.updatedAt,
  })
  const wasError = s.draftState === 'error'
  useDiagramStore.setState({ draftState: ok ? 'saved' : 'error' })
  if (!ok && !wasError) {
    useDiagramStore.setState({ toast: rt('toasts.saveFailed') })
  }
}

/** Bekleyen taslak kaydını beklemeden hemen yazar (sayfa kapanışı vb.). */
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

// Sekme gizlenince / sayfa kapanınca 800 ms'lik pencereyi beklemeden kaydet.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushDraft)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushDraft()
  })
}
