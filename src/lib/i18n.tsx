import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'

import type { Locale } from '../types/project'
import {
  dictionaries,
  translate,
  setRuntimeLocale,
  type TranslationKey,
  type DictionaryLocale,
} from './i18nRuntime'

const LOCALE_STORAGE_KEY = 'my-flowchart-locale'

interface I18nContextValue {
  locale: Locale
  dict: DictionaryLocale
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'tr'
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === 'en' || stored === 'tr') return stored
    return 'tr'
  })

  useEffect(() => {
    setRuntimeLocale(locale)
    document.documentElement.setAttribute('lang', locale)
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setRuntimeLocale(next)
    setLocaleState(next)
    localStorage.setItem(LOCALE_STORAGE_KEY, next)
  }, [])

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  )

  const value: I18nContextValue = { locale, dict: dictionaries[locale], t, setLocale }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return ctx
}
