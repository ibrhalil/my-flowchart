import type { Mermaid } from 'mermaid'

import type { AppTheme } from '../types/project'
import { rt } from '../lib/i18nRuntime'
import { diagramBody } from './transform/diagramBody'

let initialized: string | null = null
let renderCounter = 0
let renderQueue: Promise<void> = Promise.resolve()

let mermaidPromise: Promise<Mermaid> | null = null
function loadMermaid(): Promise<Mermaid> {
  mermaidPromise ??= Promise.all([import('mermaid'), import('@mermaid-js/layout-elk')]).then(
    ([{ default: mermaid }, { default: elkLayouts }]) => {
      mermaid.registerLayoutLoaders(elkLayouts)
      return mermaid
    },
  )
  mermaidPromise.catch(() => {
    mermaidPromise = null
  })
  return mermaidPromise
}

const APP_THEME_TO_MERMAID: Record<AppTheme, 'default' | 'dark'> = {
  light: 'default',
  dark: 'dark',
}

function baseConfig(theme: AppTheme, htmlLabels: boolean) {
  return {
    startOnLoad: false,
    securityLevel: 'strict' as const,
    theme: APP_THEME_TO_MERMAID[theme],
    look: 'classic' as const,
    suppressErrorRendering: true,
    // <foreignObject> PNG canvas'ını kirletir (taint); htmlLabels:false etiketleri <text> yapar.
    // ELK yalnızca kök seviyedeki `htmlLabels`'a bakar, `flowchart.htmlLabels` yetmez.
    htmlLabels,
    flowchart: {
      useMaxWidth: false,
      htmlLabels,
      defaultRenderer: 'elk' as const,
      curve: 'basis' as const,
    },
    sequence: { useMaxWidth: false },
    gantt: { useMaxWidth: false },
    pie: { useMaxWidth: false },
  }
}

function genId(): string {
  renderCounter += 1
  return `mmd-${Date.now().toString(36)}-${renderCounter}`
}

/**
 * Mindmap'te <text> etiketleri düğüm içinde ortalanmaz; yalnızca o tür HTML etiket kullanır
 * (PNG'de stripForeignObjects devrede). Diğerlerinde <text> sarma ve sınıf renklerini korur.
 */
const usesHtmlLabels = (code: string): boolean => /^\s*mindmap\b/i.test(diagramBody(code))

function configureMermaid(mermaid: Mermaid, theme: AppTheme, htmlLabels: boolean) {
  const key = `${theme}:${htmlLabels}`
  if (initialized === key) return
  mermaid.initialize(baseConfig(theme, htmlLabels))
  initialized = key
}

async function renderOne(code: string, theme: AppTheme): Promise<string> {
  const mermaid = await loadMermaid()
  const trimmed = code.trim()
  configureMermaid(mermaid, theme, usesHtmlLabels(trimmed))

  if (!trimmed) {
    throw new Error(rt('preview.emptySource'))
  }

  const { svg } = await mermaid.render(genId(), trimmed)

  // XML ayrıştırıcısı mermaid'in HTML entity'lerini reddeder; HTML ayrıştırıcısı SVG namespace'ini korur.
  const doc = new DOMParser().parseFromString(svg, 'text/html')
  const svgEl = doc.querySelector('svg')
  if (!svgEl) {
    throw new Error(rt('preview.svgParseError'))
  }
  svgEl.setAttribute('aria-label', rt('preview.mermaidAriaLabel'))

  // Kenar etiketi arka planı yarı saydam (fill alfası + #id-seçicili CSS) olduğundan ELK
  // etiketlerinin altından çizgi görünür. Inline stil cascade'i kazanır ve export'a da taşınır.
  // Mermaid'in iç CSS/sınıf adlarına bağlı: tamamen savunmacı, hata halinde stok görünüme düşer.
  try {
    const mermaidStyle = svgEl.querySelector('style')?.textContent ?? ''
    const rawFill = (
      mermaidStyle.match(/\.edgeLabel\s+rect\s*\{[^}]*fill:\s*([^;}]+)/)?.[1] ??
      mermaidStyle.match(/\.edgeLabel\s*\{[^}]*background-color:\s*([^;}]+)/)?.[1] ??
      ''
    ).trim()
    // Tanınmayan metin inline stile enjekte edilmez.
    const isColor = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|var\([-\w,# ]*\)|[a-z]+)$/i.test(
      rawFill,
    )
    const solidFill = (isColor ? rawFill : '')
      // Alfa kanalını düşür: rgba->rgb, hsla->hsl, #rrggbbaa->#rrggbb
      .replace(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)[^)]*\)/i, 'rgb($1, $2, $3)')
      .replace(/hsla?\(\s*([^,)]+)[,\s]+([^,)]+)[,\s]+([^,)]+)[^)]*\)/i, 'hsl($1, $2, $3)')
      .replace(/^#([0-9a-f]{6})[0-9a-f]{2}$/i, '#$1')
    const fallbackFill = theme === 'dark' ? '#585858' : '#e8e8e8'
    const fill = solidFill || fallbackFill
    for (const rect of svgEl.querySelectorAll('g.edgeLabel rect')) {
      rect.setAttribute('style', `opacity:1;fill:${fill};stroke:none;`)
    }
  } catch {
    // Post-processing kozmetiktir; hata halinde SVG olduğu gibi kullanılır.
  }

  return new XMLSerializer().serializeToString(svgEl)
}

export function renderMermaid(code: string, theme: AppTheme): Promise<string> {
  // Mermaid paylaşılan DOM ve yapılandırma kullanır; eşzamanlı çizimler
  // birbirlerinin geçici SVG'sini silip firstChild hatasına yol açabilir.
  const result = renderQueue.then(() => renderOne(code, theme))
  renderQueue = result.then(() => undefined, () => undefined)
  return result
}

export async function canParse(code: string): Promise<boolean> {
  const trimmed = code.trim()
  if (!trimmed) return true
  try {
    const mermaid = await loadMermaid()
    await mermaid.parse(trimmed)
    return true
  } catch {
    return false
  }
}

export function parseError(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return rt('preview.unknownRenderError')
}
