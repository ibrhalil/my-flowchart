export interface ParsedMarkdown {
  title?: string
  description?: string
  mermaidBlocks: string[]
}

const FENCE = /```mermaid\r?\n([\s\S]*?)```/gi

export function parseMarkdown(input: string): ParsedMarkdown {
  const result: ParsedMarkdown = { mermaidBlocks: [] }

  const fmStart = input.indexOf('---')
  if (fmStart === 0) {
    const fmEnd = input.indexOf('\n---', 3)
    if (fmEnd !== -1) {
      const fm = input.slice(4, fmEnd)
      const get = (key: string): string | undefined => {
        const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'mi'))
        if (!m) return undefined
        const v = m[1].trim()
        return v.startsWith('"') && v.endsWith('"') ? v.slice(1, -1) : v
      }
      result.title = get('title')
      result.description = get('description')
    }
  }

  if (!result.title) {
    const h = input.match(/^#\s+(.+)$/m)
    if (h) result.title = h[1].trim()
  }

  let m: RegExpExecArray | null
  while ((m = FENCE.exec(input)) !== null) {
    result.mermaidBlocks.push(m[1].trim())
  }

  return result
}
