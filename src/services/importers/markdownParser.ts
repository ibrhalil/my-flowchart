export interface ParsedMarkdown {
  title?: string
  description?: string
  mermaidBlocks: string[]
}

/** Frontmatter: dosyanın başında `---` ... `---` bloğu (CRLF toleranslı). */
const FRONTMATTER_RE = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/

/** Kod çiti satırı: ``` veya ~~~ (3+ tekrar) + opsiyonel bilgi dizesi. */
const FENCE_RE = /^(\s*)(`{3,}|~{3,})(.*)$/

/** JSON biçiminde yazılmış frontmatter değerini çözer; değilse olduğu gibi döner. */
function decodeValue(raw: string): string {
  const v = raw.trim()
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
    try {
      const parsed: unknown = JSON.parse(v)
      if (typeof parsed === 'string') return parsed
    } catch {
      // JSON olarak ayrıştırılamadı — tırnakları kaldırarak devam et
      return v.slice(1, -1)
    }
  }
  return v
}

function parseFrontmatter(input: string): { title?: string; description?: string } {
  const m = input.match(FRONTMATTER_RE)
  if (!m) return {}
  const fm = m[1]
  const get = (key: string): string | undefined => {
    const line = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'mi'))
    if (!line) return undefined
    const v = line[1].trim()
    return v ? decodeValue(v) : undefined
  }
  return { title: get('title'), description: get('description') }
}

/** Tüm mermaid kod çitlerini (``` ve ~~~ varyantları) yapısal olarak toplar. */
function collectMermaidBlocks(input: string): string[] {
  const blocks: string[] = []
  const lines = input.split(/\r?\n/)
  let fenceChar = ''
  let fenceLen = 0
  let buf: string[] = []

  for (const line of lines) {
    const m = line.match(FENCE_RE)
    if (m && fenceChar === '') {
      // Açılış çiti: bilgi dizesi "mermaid" olmalı
      if (m[3].trim().toLowerCase() === 'mermaid') {
        fenceChar = m[2][0]
        fenceLen = m[2].length
        buf = []
      }
    } else if (m && fenceChar !== '' && m[2][0] === fenceChar && m[2].length >= fenceLen) {
      // Kapanış çiti: bilgi dizesi boş olmalı
      if (!m[3].trim()) {
        blocks.push(buf.join('\n').trim())
        fenceChar = ''
        buf = []
      }
    } else if (fenceChar !== '') {
      buf.push(line)
    }
  }
  return blocks
}

export function parseMarkdown(input: string): ParsedMarkdown {
  const result: ParsedMarkdown = { mermaidBlocks: collectMermaidBlocks(input) }

  const fm = parseFrontmatter(input)
  result.title = fm.title
  result.description = fm.description

  if (!result.title) {
    const h = input.match(/^#\s+(.+)$/m)
    if (h) result.title = h[1].trim()
  }

  return result
}
