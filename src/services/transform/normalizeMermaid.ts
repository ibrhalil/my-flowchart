/**
 * Mermaid flowchart/graph kaynak kodunu ASCII/boşluk açısından güvenli hale getirir.
 *
 * Dönüşümler:
 *   1. Etiketli okları `-->|"etiket"|` post-label formatına indirger:
 *        A -- Evet --> B      →   A -->|"Evet"| B
 *        A -- "evet olur" --> B   →   A -->|"evet olur"| B
 *   2. Tırnaksız boşluk içeren ok-etiketlerini çift tırnaklar (yukarıdaki adımın parçası).
 *   3. Etiket/şekil dışindeki ASCII dışı veya boşluklu düz kimlikleri
 *      benzersiz n1, n2, ... kimliklerine çevirir ve orijinal metni label'a taşır:
 *        Başlangıç --> Son   →   n1[Başlangıç] --> n2[Son]
 *        Süreç Başla --> X   →   n1[Süreç Başla] --> X
 *        Über --> Ende       →   n1[Über] --> n2[Ende]
 *
 * Şekil zaten varsa (örn.  Süreç[Label]) yalnızca kimlik rename edilir, etiket korunur.
 * Diğer diyagram türlerine (sequence, class, gantt, vb.) dokunulmaz.
 */

const DIRECTIVE_RE =
  /^(%%|subgraph\b|end\b|classDef\b|class\b|linkStyle\b|style\b|click\b|direction\b|graph\b|flowchart\b)/i

/** Etiketli ok deseni: ` -- etiket --> ` (tırnaklı veya değil) */
const LABELED_EDGE_RE = /\s--\s+(?:"([^"]*)"|([^|[\](){}<>"\n-]+?))\s+-->\s/g

/** Ok ayraç + opsiyonel post-label: ` --> `, ` -->|...| `, ` -.-> `, `---`, `==>`, `===` */
const ARROW_TOKEN_RE =
  /(\s*(?:-->|==>|-\.->|-\.\.->|---|===)\s*(?:\|[^|\n]*\|\s*)?)/g

const ARROW_ONLY_RE = /^\s*(?:-->|==>|-\.->|-\.\.->|---|===)\s*(?:\|[^|\n]*\|\s*)?$/

const VALID_ASCII_ID_RE = /^[A-Za-z_][A-Za-z0-9_-]*$/

const SHAPE_START_RE = /[[({<"]/

export interface NormalizeReport {
  code: string
  /** Yeniden adlandırılan kimlik sayısı */
  renamed: number
  /** Tırnak içine alınan ok-etiketi sayısı */
  quoted: number
  /** İşlem yapılmadıysa true (zaten güvenli veya flowchart değil) */
  unchanged: boolean
}

export function isFlowchartLike(code: string): boolean {
  return /(^|\n)\s*(flowchart|graph)\b/im.test(code)
}

interface NormalizeContext {
  existingIds: Set<string>
  renameMap: Map<string, string>
  counter: number
  renamed: number
  quoted: number
}

function genId(ctx: NormalizeContext): string {
  for (;;) {
    ctx.counter += 1
    const candidate = `n${ctx.counter}`
    if (!ctx.existingIds.has(candidate)) {
      ctx.existingIds.add(candidate)
      return candidate
    }
  }
}

function normalizeNodeSegment(seg: string, ctx: NormalizeContext): string {
  if (ARROW_ONLY_RE.test(seg)) return seg

  const leadMatch = seg.match(/^\s*/)
  const trailMatch = seg.match(/\s*$/)
  const lead = leadMatch ? leadMatch[0] : ''
  const trail = trailMatch ? trailMatch[0] : ''
  const core = seg.slice(lead.length, seg.length - trail.length)
  if (!core) return seg

  // ID + opsiyonel şekil ayrıştırması
  const shapeIdx = core.search(SHAPE_START_RE)
  let idPart: string
  let shapePart: string
  if (shapeIdx === -1) {
    idPart = core
    shapePart = ''
  } else {
    idPart = core.slice(0, shapeIdx)
    shapePart = core.slice(shapeIdx)
  }

  // className ayrıştırması: ID:::cls
  const colonIdx = idPart.indexOf('::')
  const realId = colonIdx === -1 ? idPart : idPart.slice(0, colonIdx)
  const classSuffix = colonIdx === -1 ? '' : idPart.slice(colonIdx)

  // Boş kimlik → normalize etme
  if (!realId.trim()) return seg

  // Geçerli ASCII kimlik → hiç dokunma
  if (VALID_ASCII_ID_RE.test(realId)) {
    return seg
  }

  // ASCII dışı karakter veya boşluk içeriyor → rename
  let newId = ctx.renameMap.get(realId)
  if (!newId) {
    newId = genId(ctx)
    ctx.renameMap.set(realId, newId)
  }
  ctx.renamed += 1

  if (shapePart) {
    // Şekil zaten var → yalnızca kimliği rename et, etiket korunur
    return `${lead}${newId}${classSuffix}${shapePart}${trail}`
  }
  // Şekil yok → orijinal metni label yap
  return `${lead}${newId}[${realId}]${classSuffix}${trail}`
}

function normalizeLine(line: string, ctx: NormalizeContext): string {
  const trimmed = line.trim()
  if (!trimmed || DIRECTIVE_RE.test(trimmed)) return line

  // 1) Etiketli okları post-label formatına çevir
  let work = line.replace(
    LABELED_EDGE_RE,
    (_full, quoted: string | undefined, unquoted: string | undefined) => {
      const label = quoted ?? unquoted ?? ''
      if (unquoted && unquoted.includes(' ')) ctx.quoted += 1
      return ` -->|"${label}"| `
    },
  )

  // 2) Ok ayraçları ile segmentlere böl
  const segments: string[] = []
  let lastEnd = 0
  ARROW_TOKEN_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = ARROW_TOKEN_RE.exec(work)) !== null) {
    segments.push(work.slice(lastEnd, m.index))
    segments.push(m[0])
    lastEnd = m.index + m[0].length
  }
  segments.push(work.slice(lastEnd))

  // 3) Her node segmentini normalize et
  return segments.map((seg) => normalizeNodeSegment(seg, ctx)).join('')
}

export function normalizeMermaid(input: string): NormalizeReport {
  if (!isFlowchartLike(input)) {
    return { code: input, renamed: 0, quoted: 0, unchanged: true }
  }

  const reserved = new Set<string>([
    'flowchart',
    'graph',
    'subgraph',
    'end',
    'direction',
    'classDef',
    'class',
    'linkStyle',
    'style',
    'click',
    'TB',
    'TD',
    'BT',
    'RL',
    'LR',
  ])

  for (const m of input.matchAll(/([A-Za-z_][A-Za-z0-9_-]*)/g)) {
    reserved.add(m[1])
  }

  const ctx: NormalizeContext = {
    existingIds: reserved,
    renameMap: new Map(),
    counter: 0,
    renamed: 0,
    quoted: 0,
  }

  const lines = input.split('\n')
  let inDirective = false
  const out = lines.map((line) => {
    // %%{ ... }%% direktif bloğu çok satırlı olabilir; içindeki
    // tüm satırları (}%% kapanışı dahil) olduğu gibi bırak.
    if (inDirective) {
      if (/\}%%/.test(line)) inDirective = false
      return line
    }
    if (/^\s*%%\{/.test(line)) {
      if (!/\}%%/.test(line)) inDirective = true
      return line
    }
    return normalizeLine(line, ctx)
  })

  const code = out.join('\n')
  const unchanged = code === input
  return { code, renamed: ctx.renamed, quoted: ctx.quoted, unchanged }
}
