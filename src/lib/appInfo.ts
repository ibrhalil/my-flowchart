export interface AppInfo {
  version: string
  license: string | null
  repositoryUrl: string | null
  commit: string | null
  /** ISO 8601 derleme zamanı */
  builtAt: string
  dependencies: { name: string; version: string }[]
}

// Değer vite.config.ts içindeki `define` ile derleme anında gömülür.
declare const __APP_INFO__: AppInfo

export const APP_INFO: AppInfo = __APP_INFO__
