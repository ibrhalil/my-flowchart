/**
 * Mermaid flowchart/graph kaynak kodunu ASCII/boşluk açısından güvenli hale getirir.
 *
 * Dönüşümler:
 *   1. Etiketli okları `-->|"etiket"|` post-label formatına indirger:
 *        A -- Evet --> B     →   A -->|"Evet"| B
 *        A -. metin .-> B    →   A -.->|"metin"| B
 *        A == metin ==> B    →   A ==>|"metin"| B
 *   2. Etiket/şekil dışındaki ASCII dışı veya boşluklu düz kimlikleri
 *      benzersiz n1, n2, ... kimliklerine çevirir ve orijinal metni label'a taşır:
 *        Başlangıç --> Bitiş   →   n1[Başlangıç] --> n2[Bitiş]
 *
 * Güvenlik kuralları (geçerli sözdizimi asla bozulmaz):
 *   - Çift tırnak içindeki içerik hiçbir zaman ok/kimlik sayılmaz.
 *   - `;` ile ayrılan ifadeler tek tek işlenir; `&` ile birleşen düğümler
 *     ayrı ayrı normalize edilir (örn. `A & B --> C` korunur).
 *   - Satır sonundaki `%%` yorumları ve YAML frontmatter dokunulmaz kalır.
 *   - Tanınmayan satırlar (subgraph, classDef, linkStyle, ...) olduğu gibi
 *     korunur; yalnızca style/class/click satırlarındaki kimlik referansları
 *     rename haritasıyla güncellenir.
 *   - `%%{ ... }%%` direktif blokları çok satırlı olarak atlanır.
 *
 * Diğer diyagram türlerine (sequence, class, gantt, vb.) dokunulmaz.
 */

const DIRECTIVE_RE =
  /^(%%|subgraph\b|end\b|classDef\b|class\b|linkStyle\b|style\b|click\b|direction\b|graph\b|flowchart\b)/i

const VALID_ASCII_ID_RE = /^[A-Za-z_][A-Za-z0-9_-]*$/

/** Kimlik + opsiyonel şekil ayrımı için ilk şekil başlangıç karakteri */
const SHAPE_START_RE = /[[({<"]/

/** Hiç harf/rakam içermeyen parçalar (ok kalıntıları, noktalama) dokunulmaz */
const HAS_WORD_CHAR_RE = /[A-Za-z0-9_\p{L}\p{N}]/u

/** Etiketli ok kuralları: `-- etiket -->` biçimlerini post-label'a çevirir. */
interface LabeledEdgeRule {
  re: RegExp
  render: (m: RegExpMatchArray) => string
}

const LABELED_EDGE_RULES: LabeledEdgeRule[] = [
  {
    // A -- etiket --> B  /  A -- "etiket" --> B  (--- ve ---> varyantlarıyla)
    re: /^\s*--\s+(?:"([^"\n]*)"|([^"\n|[\]{}()<>-]+?))\s+(--->|-->|---)\s*/,
    render: (m) => ` ${m[3]}|"${m[1] ?? m[2] ?? ''}"| `,
  },
  {
    // A -. etiket .-> B  /  A -. etiket .- B
    re: /^\s*-\.\s+(?:"([^"\n]*)"|([^"\n|[\]{}()<>.|,;=&-]+?))\s+\.(->)?\s*/,
    render: (m) => ` -.${m[3] ? '->' : ''}|"${m[1] ?? m[2] ?? ''}"| `,
  },
  {
    // A == etiket ==> B  /  A == etiket === B
    re: /^\s*==\s+(?:"([^"\n]*)"|([^"\n|[\]{}()<>\-=]+?))\s+(===>|==>|===)\s*/,
    render: (m) => ` ${m[3]}|"${m[1] ?? m[2] ?? ''}"| `,
  },
]

/** Tırnak dışındaki düz ok belirteçleri (opsiyonel `|etiket|` son ekiyle). */
const ARROW_AT =
  /^(\s*)(--->|===>|-.->|<-->|--o|--x|o--|x--|-->|---|===|~~~|-.-|==>|-\.|--|==)(\s*)(\|[^|\n]*\|)?(\s*)/

const FRONTMATTER_RE = /^---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/

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

/** Çift tırnak dışındaki `;` ayraçlarını bölerek ifadeleri ayırır. */
function splitStatements(line: string): string[] {
  const parts: string[] = []
  let buf = ''
  let inQuote = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') {
      inQuote = !inQuote
      buf += ch
    } else if (ch === ';' && !inQuote) {
      parts.push(buf)
      buf = ''
    } else {
      buf += ch
    }
  }
  parts.push(buf)
  return parts
}

/** Satırdaki ilk `%%` yorumunun (tırnak dışı) indeksini bulur. */
function findCommentIndex(line: string): number {
  let inQuote = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') inQuote = !inQuote
    else if (!inQuote && ch === '%' && line[i + 1] === '%') return i
  }
  return -1
}

/** Çift tırnak dışındaki `&` ayraçlarıyla düğüm listesini böler. */
function splitAmp(seg: string): string[] {
  const parts: string[] = []
  let buf = ''
  let inQuote = false
  for (let i = 0; i < seg.length; i += 1) {
    const ch = seg[i]
    if (ch === '"') {
      inQuote = !inQuote
      buf += ch
    } else if (ch === '&' && !inQuote) {
      parts.push(buf)
      buf = ''
    } else {
      buf += ch
    }
  }
  parts.push(buf)
  return parts
}

function normalizeNodeSegment(seg: string, ctx: NormalizeContext): string {
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
  if (VALID_ASCII_ID_RE.test(realId)) return seg

  // Harf/rakam içermeyen parça (ok kalıntısı, noktalama) → dokunma
  if (!HAS_WORD_CHAR_RE.test(realId)) return seg

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

function normalizeTextSegment(seg: string, ctx: NormalizeContext): string {
  if (!seg.trim()) return seg
  return splitAmp(seg)
    .map((part) => normalizeNodeSegment(part, ctx))
    .join('&')
}

function normalizeStatement(stmt: string, ctx: NormalizeContext): string {
  let out = ''
  let buf = ''
  let inQuote = false
  let i = 0

  const flush = () => {
    out += normalizeTextSegment(buf, ctx)
    buf = ''
  }

  while (i < stmt.length) {
    const ch = stmt[i]
    if (ch === '"') {
      inQuote = !inQuote
      buf += ch
      i += 1
      continue
    }
    if (!inQuote) {
      const rest = stmt.slice(i)
      let handled = false
      for (const rule of LABELED_EDGE_RULES) {
        const m = rest.match(rule.re)
        if (m) {
          flush()
          out += rule.render(m)
          if (m[2] !== undefined) ctx.quoted += 1
          i += m[0].length
          handled = true
          break
        }
      }
      if (handled) continue
      const am = rest.match(ARROW_AT)
      if (am) {
        flush()
        out += am[0]
        i += am[0].length
        continue
      }
    }
    buf += ch
    i += 1
  }
  flush()
  return out
}

function normalizeFlowLine(line: string, ctx: NormalizeContext): string {
  const trimmed = line.trim()
  if (!trimmed) return line

  const commentIdx = findCommentIndex(line)
  const head = commentIdx === -1 ? line : line.slice(0, commentIdx)
  const tail = commentIdx === -1 ? '' : line.slice(commentIdx)

  const processed = splitStatements(head)
    .map((stmt) => normalizeStatement(stmt, ctx))
    .join(';')

  return processed + tail
}

/**
 * style/class/click satırlarındaki kimlik referanslarını rename haritasıyla günceller.
 * Diğer direktif satırları (subgraph, classDef, linkStyle, ...) dokunulmaz kalır.
 */
function applyRenamesToDirective(line: string, map: Map<string, string>): string {
  if (map.size === 0) return line
  const st = line.match(/^(\s*)(style|click)\s+(\S+)([\s\S]*)$/i)
  if (st) {
    const repl = map.get(st[3]) ?? st[3]
    return `${st[1]}${st[2]} ${repl}${st[4]}`
  }
  const cl = line.match(/^(\s*)class\s+([^\s]+)\s+(\S+)\s*$/i)
  if (cl) {
    const ids = cl[2]
      .split(',')
      .map((id) => map.get(id) ?? id)
      .join(',')
    return `${cl[1]}class ${ids} ${cl[3]}`
  }
  return line
}

export function normalizeMermaid(input: string): NormalizeReport {
  if (!isFlowchartLike(input)) {
    return { code: input, renamed: 0, quoted: 0, unchanged: true }
  }

  const { frontmatter, body } = splitFrontmatter(input)

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

  const lines = body.split('\n')
  const processed: string[] = []
  const isDirective: boolean[] = []
  let inDirective = false

  for (const line of lines) {
    // %%{ ... }%% direktif bloğu çok satırlı olabilir; içindeki
    // tüm satırları (}%% kapanışı dahil) olduğu gibi bırak.
    if (inDirective) {
      if (/\}%%/.test(line)) inDirective = false
      processed.push(line)
      isDirective.push(true)
      continue
    }
    if (/^\s*%%\{/.test(line)) {
      if (!/\}%%/.test(line)) inDirective = true
      processed.push(line)
      isDirective.push(true)
      continue
    }
    if (DIRECTIVE_RE.test(line.trim())) {
      processed.push(line)
      isDirective.push(true)
      continue
    }
    processed.push(normalizeFlowLine(line, ctx))
    isDirective.push(false)
  }

  // Rename'ler belgenin sonrasında keşfedilmiş olabilir; direktif
  // satırlarındaki referansları ikinci geçişte güncelle.
  const out = lines.map((_line, idx) =>
    isDirective[idx] ? applyRenamesToDirective(processed[idx], ctx.renameMap) : processed[idx],
  )

  const code = frontmatter + out.join('\n')
  const unchanged = code === input
  return { code, renamed: ctx.renamed, quoted: ctx.quoted, unchanged }
}

function splitFrontmatter(input: string): { frontmatter: string; body: string } {
  const m = input.match(FRONTMATTER_RE)
  if (!m) return { frontmatter: '', body: input }
  return { frontmatter: m[0], body: input.slice(m[0].length) }
}
