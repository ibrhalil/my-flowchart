import { FRONTMATTER_RE } from '../transform/diagramBody'

// `%%{init…}%%` direktifleri yorum değil koddur; `%%` ile başlayan düz satırlar yorumdur.
const COMMENT_LINE_RE = /^[ \t]*%%(?!\{)[ \t]?(.*)$/

function splitFrontmatter(code: string): [frontmatter: string, body: string] {
  const m = code.match(FRONTMATTER_RE)
  return m ? [m[0], code.slice(m[0].length)] : ['', code]
}

/**
 * .mmd dosyasının başındaki `%%` yorum satırlarını açıklama olarak ayırır ve kaynaktan çıkarır.
 * Frontmatter varsa yorumlar ondan sonra aranır (Mermaid frontmatter'ın en başta olmasını ister).
 */
export function extractLeadingDescription(code: string): { description: string | null; code: string } {
  const [frontmatter, body] = splitFrontmatter(code)
  const lines = body.split(/\r?\n/)
  let i = 0
  while (i < lines.length && !lines[i].trim()) i += 1

  const found: string[] = []
  while (i < lines.length) {
    const m = lines[i].match(COMMENT_LINE_RE)
    if (!m) break
    found.push(m[1].trimEnd())
    i += 1
  }

  const description = found.join('\n').trim()
  if (!description) return { description: null, code }
  return { description, code: frontmatter + lines.slice(i).join('\n').replace(/^\n+/, '') }
}

/** Açıklamayı dosyanın başına `%%` yorumları olarak yazar; zaten aynı başlıkla başlıyorsa dokunmaz. */
export function withLeadingDescription(code: string, description: string | undefined): string {
  const text = description?.trim()
  if (!text) return code
  if (extractLeadingDescription(code).description === text) return code

  const header = text
    .split(/\r?\n/)
    .map((line) => (line.trim() ? `%% ${line.trimEnd()}` : '%%'))
    .join('\n')
  const [frontmatter, body] = splitFrontmatter(code)
  return `${frontmatter}${header}\n${body}`
}
