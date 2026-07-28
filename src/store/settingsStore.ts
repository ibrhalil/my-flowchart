import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
      storage: createJSONStorage(() => localStorage),
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
