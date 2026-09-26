import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'

import type { AppTheme } from '../types/project'

export interface SettingsState {
  theme: AppTheme
  pngScale: number
  editorFontSize: number
  autoSaveEnabled: boolean
  autoSaveIdleMs: number

  setTheme: (t: AppTheme) => void
  setPngScale: (s: number) => void
  setEditorFontSize: (s: number) => void
  setAutoSaveEnabled: (e: boolean) => void
  setAutoSaveIdleMs: (ms: number) => void
  apply: (patch: Partial<SettingsPatch>) => void
  resetSettings: () => void
}

type SettingsPatch = Pick<
  SettingsState,
  'theme' | 'pngScale' | 'editorFontSize' | 'autoSaveEnabled' | 'autoSaveIdleMs'
>

export const DEFAULT_SETTINGS: SettingsPatch = {
  theme:
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
  pngScale: 2,
  editorFontSize: 13,
  autoSaveEnabled: true,
  autoSaveIdleMs: 5000,
}

/** Kalıcı depoya erişilemediğinde (kota/gizli mod) store işlemleri düşmesin. */
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      // yazılamadı — bellek içi durum geçerli kalır
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      // yoksay
    }
  },
}

/** Depodan gelen bozuk/eski değerleri doğrulayıp filtreler. */
function mergeValidated(persisted: unknown, current: SettingsPatch): SettingsPatch {
  const p = (persisted ?? {}) as Partial<Record<keyof SettingsPatch, unknown>>
  const num = (v: unknown, min: number, max: number, fallback: number): number =>
    typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : fallback
  return {
    theme: p.theme === 'dark' || p.theme === 'light' ? p.theme : current.theme,
    pngScale: num(p.pngScale, 1, 4, current.pngScale),
    editorFontSize: num(p.editorFontSize, 10, 24, current.editorFontSize),
    autoSaveEnabled:
      typeof p.autoSaveEnabled === 'boolean' ? p.autoSaveEnabled : current.autoSaveEnabled,
    autoSaveIdleMs: num(p.autoSaveIdleMs, 1000, 300000, current.autoSaveIdleMs),
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTheme: (theme) => set({ theme }),
      setPngScale: (pngScale) => set({ pngScale }),
      setEditorFontSize: (editorFontSize) => set({ editorFontSize }),
      setAutoSaveEnabled: (autoSaveEnabled) => set({ autoSaveEnabled }),
      setAutoSaveIdleMs: (autoSaveIdleMs) => set({ autoSaveIdleMs }),
      apply: (patch) => set(patch),
      resetSettings: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'my-flowchart-settings',
      storage: createJSONStorage(() => safeLocalStorage),
      merge: (persisted, current) => ({
        ...current,
        ...mergeValidated(persisted, current),
      }),
      partialize: (s) => ({
        theme: s.theme,
        pngScale: s.pngScale,
        editorFontSize: s.editorFontSize,
        autoSaveEnabled: s.autoSaveEnabled,
        autoSaveIdleMs: s.autoSaveIdleMs,
      }),
    },
  ),
)
