import { create } from 'zustand'

import { DEFAULT_TEMPLATE } from '../data/templates'
import type { HistoryEntry, AppTheme } from '../types/project'
import { rt } from '../lib/i18nRuntime'
import { useSettingsStore } from './settingsStore'
import * as draftStorage from '../services/storage/draftStorage'
import * as history from '../services/storage/localHistory'

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
  if (draft?.code) {
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

  setTitle: (title) => set({ title, updatedAt: Date.now(), dirty: true }),
  setDescription: (description) => set({ description, updatedAt: Date.now(), dirty: true }),
  setCode: (code) => set({ code, updatedAt: Date.now(), dirty: true }),

  loadProject: (p) => {
    const patch: Partial<{ theme: AppTheme; pngScale: number }> = {}
    if (p.theme) patch.theme = p.theme
    if (typeof p.pngScale === 'number') patch.pngScale = p.pngScale
    if (Object.keys(patch).length) useSettingsStore.getState().apply(patch)

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
    // Son snapshot ile aynıysa (code + title) tekrar kaydetme
    if (last && last.code === s.code && last.title === s.title) {
      set({ dirty: false })
      return
    }
    const entry: HistoryEntry = {
      id: `h-${Date.now().toString(36)}`,
      title: s.title,
      code: s.code,
      savedAt: Date.now(),
    }
    const next = history.pushHistory(entry)
    set({ history: next, dirty: false, toast: rt('toasts.autosaved') })
  },

  removeHistory: (id) => set({ history: history.removeHistory(id) }),

  clearHistory: () => {
    history.clearHistory()
    set({ history: [], toast: rt('toasts.historyCleared') })
  },

  restoreHistory: (id) => {
    const entry = get().history.find((e) => e.id === id)
    if (!entry) return
    set({
      code: entry.code,
      title: entry.title,
      updatedAt: Date.now(),
      dirty: false,
      toast: rt('preview.restored', { title: entry.title }),
    })
  },
}))

let saveTimer: ReturnType<typeof setTimeout> | null = null
useDiagramStore.subscribe((s) => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const { theme, pngScale } = useSettingsStore.getState()
    draftStorage.saveDraft({
      title: s.title,
      description: s.description,
      code: s.code,
      theme,
      pngScale,
      updatedAt: s.updatedAt,
    })
  }, 800)
})
