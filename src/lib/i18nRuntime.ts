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

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'tr'
  const stored = window.localStorage.getItem('my-flowchart-locale')
  return stored === 'en' || stored === 'tr' ? stored : 'tr'
}

let currentLocale: Locale = readStoredLocale()

export function setRuntimeLocale(locale: Locale): void {
  currentLocale = locale
}

/** React dışı kod (ör. zustand store) için çeviri. */
export function rt(key: string, params?: Record<string, string | number>): string {
  return translate(currentLocale, key, params)
}
