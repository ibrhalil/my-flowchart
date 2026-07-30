import mermaid from 'mermaid'

import type { AppTheme } from '../types/project'
import { rt } from '../lib/i18nRuntime'

let initialized: AppTheme | null = null
let renderCounter = 0

// Diyagram teması artık kullanıcı tarafından seçilmiyor; uygulama temasını takip eder.
const APP_THEME_TO_MERMAID: Record<AppTheme, 'default' | 'dark'> = {
  light: 'default',
  dark: 'dark',
}

function baseConfig(theme: AppTheme) {
  return {
    startOnLoad: false,
    securityLevel: 'strict' as const,
    theme: APP_THEME_TO_MERMAID[theme],
    look: 'classic' as const,
    suppressErrorRendering: true,
    // htmlLabels:false -> etiketler <foreignObject> yerine <text> olarak üretilir.
    // Bu, SVG'nin <img> üzerinden canvas'a çizildiğinde canvas'in
    // kirlenmesini (taint -> toBlob SecurityError) önler; PNG export çalışır.
    flowchart: { useMaxWidth: false, htmlLabels: false, curve: 'basis' as const },
    sequence: { useMaxWidth: false },
    gantt: { useMaxWidth: false },
    pie: { useMaxWidth: false },
  }
}

function genId(): string {
  renderCounter += 1
  return `mmd-${Date.now().toString(36)}-${renderCounter}`
}

function applyTheme(theme: AppTheme) {
  mermaid.initialize(baseConfig(theme))
  initialized = theme
}

export function configureMermaid(theme: AppTheme) {
  if (initialized !== theme) applyTheme(theme)
}

function cleanupMermaidTempElements() {
  const body = document.body
  if (!body) return
  body.querySelectorAll('div[id^="dmmd-"]').forEach((el) => el.remove())
}

export async function renderMermaid(code: string, theme: AppTheme): Promise<string> {
  configureMermaid(theme)

  const trimmed = code.trim()
  if (!trimmed) {
    throw new Error(rt('preview.emptySource'))
  }

  cleanupMermaidTempElements()

  // Mermaid render hata fırlatırsa yakalayıp yukarı iletelim
  const { svg } = await mermaid.render(genId(), trimmed)

  const parser = new DOMParser()
  const doc = parser.parseFromString(svg, 'image/svg+xml')
  const svgEl = doc.documentElement as unknown as SVGSVGElement
  if (!svgEl || svgEl.nodeName.toLowerCase() !== 'svg') {
    throw new Error(rt('preview.svgParseError'))
  }
  svgEl.setAttribute('aria-label', rt('preview.mermaidAriaLabel'))

  // svgEl üzerindeki aria-label değişikliğinin serialize edilmiş svg'ye yansıması için
  // documentElement'i tekrar string'e çeviriyoruz.
  return new XMLSerializer().serializeToString(svgEl)
}

export function parseError(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return rt('preview.unknownRenderError')
}
