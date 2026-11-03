import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'

import type { Locale } from '../types/project'
import {
  dictionaries,
  translate,
  setRuntimeLocale,
  readStoredLocale,
  storeLocale,
  type TranslationKey,
  type DictionaryLocale,
} from './i18nRuntime'

interface I18nContextValue {
  locale: Locale
  dict: DictionaryLocale
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    typeof window === 'undefined' ? 'en' : readStoredLocale(),
  )

  useEffect(() => {
    setRuntimeLocale(locale)
    document.documentElement.setAttribute('lang', locale)
    document.title = `${dictionaries[locale].appTitle} — ${dictionaries[locale].appSubtitle}`
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setRuntimeLocale(next)
    setLocaleState(next)
    storeLocale(next)
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
