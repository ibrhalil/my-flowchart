import mermaid from 'mermaid'
import elkLayouts from '@mermaid-js/layout-elk'

import type { AppTheme } from '../types/project'
import { rt } from '../lib/i18nRuntime'

let initialized: AppTheme | null = null
let renderCounter = 0
let renderQueue: Promise<void> = Promise.resolve()

mermaid.registerLayoutLoaders(elkLayouts)

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
    flowchart: {
      useMaxWidth: false,
      htmlLabels: false,
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

function applyTheme(theme: AppTheme) {
  mermaid.initialize(baseConfig(theme))
  initialized = theme
}

export function configureMermaid(theme: AppTheme) {
  if (initialized !== theme) applyTheme(theme)
}

async function renderOne(code: string, theme: AppTheme): Promise<string> {
  configureMermaid(theme)

  const trimmed = code.trim()
  if (!trimmed) {
    throw new Error(rt('preview.emptySource'))
  }

  const { svg } = await mermaid.render(genId(), trimmed)

  // Mermaid'in HTML olarak serileştirdiği SVG, XML ayrıştırıcısının kabul
  // etmediği HTML entity'leri içerebilir. HTML ayrıştırıcısı SVG namespace'ini korur.
  const doc = new DOMParser().parseFromString(svg, 'text/html')
  const svgEl = doc.querySelector('svg')
  if (!svgEl) {
    throw new Error(rt('preview.svgParseError'))
  }
  svgEl.setAttribute('aria-label', rt('preview.mermaidAriaLabel'))

  // Kenar etiketlerinin arka planı yarı saydam olduğu için ("Evet"/"Hayır"
  // gibi) ELK etiketlerinin altından çizgi görünür. Saydamlık iki katmanlı:
  // fill değerine gömülü alfa (light tema: rgba(232,232,232,0.8)) ve mermaid'in
  // id-seçicili CSS kuralı (#mmd-x .edgeLabel rect { opacity: 0.5 }). Kural
  // yüksek specificity'li olduğundan stylesheet override edilmez; bu yüzden
  // her rect'e doğrudan inline stil yazıyoruz — inline stil cascade'de her
  // zaman kazanır ve string SVG'ye gömüldüğü için export'larda da korunır.
  // Renk, mermaid'in kendi temasından türetilir (alfa kanalı düşürülerek).
  //
  // Blok, mermaid'in iç CSS/sınıf adlarına bağımlıdır; sürüm değişikliğinde
  // bozulabilir. Bu yüzden tamamen savunmacıdır: hata fırlatmaz (try/catch),
  // yakalanan değer geçerli bir renk değilse yok sayılır, renk hiç
  // bulunamazsa tema tabanlı sabit renge düşülür, sınıf adları değişirse
  // döngü boşa döner (görsel stok mermaid görünümüne döner). Hiçbir durumda
  // render başarısız olmaz.
  try {
    const mermaidStyle = svgEl.querySelector('style')?.textContent ?? ''
    const rawFill = (
      mermaidStyle.match(/\.edgeLabel\s+rect\s*\{[^}]*fill:\s*([^;}]+)/)?.[1] ??
      mermaidStyle.match(/\.edgeLabel\s*\{[^}]*background-color:\s*([^;}]+)/)?.[1] ??
      ''
    ).trim()
    // Yalnızca tanıdık renk biçimlerini kabul et; tanınmayan metni inline
    // stil olarak enjekte etme.
    const isColor = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|var\([-\w,# ]*\)|[a-z]+)$/i.test(
      rawFill,
    )
    const solidFill = (isColor ? rawFill : '')
      // rgba(r,g,b,a) -> rgb(r,g,b), hsla(h,s%,l%,a) -> hsl(...), #rrggbbaa -> #rrggbb:
      // alfa kanallarını düşür, rengi koru.
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

  // svgEl üzerindeki aria-label değişikliğinin serialize edilmiş svg'ye yansıması için
  // documentElement'i tekrar string'e çeviriyoruz.
  return new XMLSerializer().serializeToString(svgEl)
}

export function renderMermaid(code: string, theme: AppTheme): Promise<string> {
  // Mermaid paylaşılan DOM ve yapılandırma kullanır; eşzamanlı çizimler
  // birbirlerinin geçici SVG'sini silip firstChild hatasına yol açabilir.
  const result = renderQueue.then(() => renderOne(code, theme))
  renderQueue = result.then(() => undefined, () => undefined)
  return result
}

/**
 * Kaynağın Mermaid tarafından ayrıştırılabilir olup olmadığını söyler.
 * Otomatik düzeltme gibi kaynak metni değiştiren işlemlerin sonucunu
 * uygulamadan önce güvenlik kontrolü olarak kullanılır.
 */
export async function canParse(code: string): Promise<boolean> {
  const trimmed = code.trim()
  if (!trimmed) return true
  try {
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
