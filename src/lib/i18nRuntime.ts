import { en } from '../data/translations/en'
import { tr } from '../data/translations/tr'
import type { Locale } from '../types/project'

export const dictionaries = { en, tr } as const

export type Dictionary = typeof en
export type DictionaryLocale = (typeof dictionaries)[Locale]

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string | number
    ? `${P}${K}`
    : T[K] extends ReadonlyArray<unknown>
      ? `${P}${K}`
      : T[K] extends object
        ? Leaves<T[K], `${P}${K}.`>
        : never
}[keyof T & string]

export type TranslationKey = Leaves<Dictionary>

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key]
    return value !== undefined ? String(value) : `{${key}}`
  })
}

function lookup(dict: DictionaryLocale, path: string): unknown {
  const parts = path.split('.')
  let cur: unknown = dict
  for (const part of parts) {
    if (cur && typeof cur === 'object' && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return cur
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const value = lookup(dictionaries[locale], key)
  if (typeof value === 'string') return interpolate(value, params)
  return key
}

export const LOCALE_STORAGE_KEY = 'my-flowchart-locale'

/**
 * Tarayıcı dil tercihlerinden (öncelik sırasıyla) desteklenen ilkini seçer;
 * hiçbiri desteklenmiyorsa İngilizce.
 */
export function detectBrowserLocale(): Locale {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const lang of languages) {
    const primary = (lang ?? '').toLowerCase().split('-')[0]
    if (primary === 'tr' || primary === 'en') return primary
  }
  return 'en'
}

/**
 * Kullanıcının kayıtlı dil seçimi varsa o, yoksa tarayıcı dili.
 * Depolama kapalı/engelliyse (gizli mod, çerez engeli) uygulama açılışı düşmesin.
 */
export function readStoredLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === 'en' || stored === 'tr') return stored
  } catch {
    // depolamaya erişilemedi — tarayıcı diline düş
  }
  return detectBrowserLocale()
}

export function storeLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // yazılamadı — dil bu oturum için bellekte geçerli kalır
  }
}

let currentLocale: Locale = typeof window === 'undefined' ? 'en' : readStoredLocale()

export function setRuntimeLocale(locale: Locale): void {
  currentLocale = locale
}

export function getRuntimeLocale(): Locale {
  return currentLocale
}

/** React dışı kod (ör. zustand store) için çeviri. */
export function rt(key: string, params?: Record<string, string | number>): string {
  return translate(currentLocale, key, params)
}
