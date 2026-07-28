import { saveAs } from 'file-saver'

import type { ProjectFile } from '../../types/project'
import { rt } from '../../lib/i18nRuntime'

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'diagram'

const baseName = (p: ProjectFile): string => slugify(p.title)

/**
 * SVG'de açık width/height yoksa viewBox'tan türetir.
 * <img> yüklemesinin doğru naturalWidth/Height alması (0-boyut failure
 * modunu önlemek) için.
 */
function ensureSvgSize(svg: string): string {
  try {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    const el = doc.documentElement
    const hasW = el.getAttribute('width')
    const hasH = el.getAttribute('height')
    if (hasW && hasH) return svg
    const vb = (el.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number)
    if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
      if (!hasW) el.setAttribute('width', String(vb[2]))
      if (!hasH) el.setAttribute('height', String(vb[3]))
      return new XMLSerializer().serializeToString(el)
    }
    return svg
  } catch {
    return svg
  }
}

/**
 * SVG'deki tüm <foreignObject> elemanlarını <text>'e çevirir.
 *
 * foreignObject içeren bir SVG <img> ile yüklenip canvas'a çizildiğinde
 * canvas kirlenir (taint) ve toBlob SecurityError fırlatır -> PNG üretilemez.
 * Etiketlerin metnini merkezlenmiş <text> olarak yeniden yerleştirir;
 * böylece SVG foreignObject'süz olur, canvas kirlenmez, PNG oluşur.
 */
function stripForeignObjects(svg: string): string {
  try {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    const svgNs = 'http://www.w3.org/2000/svg'
    const fos = Array.from(doc.querySelectorAll('foreignObject'))
    for (const fo of fos) {
      const x = parseFloat(fo.getAttribute('x') || '0')
      const y = parseFloat(fo.getAttribute('y') || '0')
      const w = parseFloat(fo.getAttribute('width') || '0')
      const h = parseFloat(fo.getAttribute('height') || '0')
      const text = (fo.textContent || '').replace(/\s+/g, ' ').trim()
      const t = doc.createElementNS(svgNs, 'text')
      t.setAttribute('x', String(x + w / 2))
      t.setAttribute('y', String(y + h / 2))
      t.setAttribute('text-anchor', 'middle')
      t.setAttribute('dominant-baseline', 'central')
      // İç elemanın sınıfını taşıyarak font stilini devralmaya çalış
      const inner = fo.firstElementChild as Element | null
      const cls = inner?.getAttribute('class')
      if (cls) t.setAttribute('class', cls)
      if (text) t.textContent = text
      fo.replaceWith(t)
    }
    return new XMLSerializer().serializeToString(doc)
  } catch {
    return svg
  }
}

export function exportMmd(project: ProjectFile): void {
  const blob = new Blob([project.code], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, `${baseName(project)}.mmd`)
}

export function exportJson(project: ProjectFile): void {
  const payload = {
    schema: 'mermaid-studio/project@1',
    exportedAt: new Date().toISOString(),
    project,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  saveAs(blob, `${baseName(project)}.json`)
}

export function exportMarkdown(project: ProjectFile): void {
  const front = [
    '---',
    `title: ${JSON.stringify(project.title)}`,
    project.description ? `description: ${JSON.stringify(project.description)}` : null,
    `theme: ${project.theme}`,
    `updated_at: ${new Date(project.updatedAt).toISOString()}`,
    '---',
    '',
  ]
    .filter(Boolean)
    .join('\n')

  const body = [
    `# ${project.title}`,
    '',
    project.description ? `${project.description}\n` : null,
    '```mermaid',
    project.code,
    '```',
    '',
  ]
    .filter(Boolean)
    .join('\n')

  const blob = new Blob([front + body], { type: 'text/markdown;charset=utf-8' })
  saveAs(blob, `${baseName(project)}.md`)
}

export function exportSvg(svg: string, project: ProjectFile): void {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  saveAs(blob, `${baseName(project)}.svg`)
}

export async function exportPng(
  svg: string,
  project: ProjectFile,
  scale = project.pngScale ?? 2,
): Promise<void> {
  // foreignObject -> text dönüşümü: canvas kirlenmesini (taint) önler.
  const stripped = stripForeignObjects(ensureSvgSize(svg))
  const svgBlob = new Blob([stripped], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    const natural = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      img.onload = () => resolve({ w: img.naturalWidth || 0, h: img.naturalHeight || 0 })
      img.onerror = () => reject(new Error(rt('preview.svgToImageError')))
      img.src = url
    })

    if (!natural.w || !natural.h) {
      throw new Error(rt('preview.svgSizeError'))
    }

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(natural.w * scale))
    canvas.height = Math.max(1, Math.round(natural.h * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error(rt('preview.canvasContextError'))

    ctx.fillStyle = project.theme === 'dark' ? '#1e1033' : '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    await new Promise<void>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) {
          saveAs(b, `${baseName(project)}.png`)
          resolve()
        } else {
          reject(new Error(rt('preview.pngError')))
        }
      }, 'image/png')
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}
