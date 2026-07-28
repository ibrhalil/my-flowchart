import { useEffect } from 'react'

import { useSettingsStore } from '../store/settingsStore'

export function useApplyTheme(): void {
  const theme = useSettingsStore((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    root.style.colorScheme = theme
  }, [theme])
}
