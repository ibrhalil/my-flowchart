import { linter, type Diagnostic } from '@codemirror/lint'
import type { Extension } from '@codemirror/state'

import { rt } from '../../lib/i18nRuntime'
import { isFlowchartLike } from '../../services/transform/normalizeMermaid'

/** flowchart/graph'ta ASCII dışı kimlikleri ve tırnaksız, boşluklu ok etiketlerini işaretler; diğer türler farklı söz dizimi kullanır, atlanır. */

const NON_ASCII = /\P{ASCII}/u

const DIRECTIVE_RE =
  /^(%%|subgraph\b|end\b|classDef\b|class\b|linkStyle\b|style\b|click\b|direction\b|graph\b|flowchart\b)/i

const ARROW_TOKEN_RE = /^[-=.>+]+$/

const LABEL_MASK_RE =
  /(\[[^\]]*\]|\(\([^)]*\)\)|\([\s\S]*?\)|\{[^}]*\}|<[^>]*>|\|[^|]*\|)|"[^"]*"/g

const UNQUOTED_EDGE_LABEL_RE = /\s--\s+([^"|[\](){}\n]+?)\s+-->/g

function maskLabels(line: string): string {
  const once = line.replace(LABEL_MASK_RE, (m) => ' '.repeat(m.length))
  // 2) Tırnaksız ok-etiketleri de maskelenir; aksi halde `B -- Hayır --> D`
  //    gibi geçerli satırlarda etiket sözcüğü yanlışlıkla node ID sanılır.
  return once.replace(UNQUOTED_EDGE_LABEL_RE, (m) => ' '.repeat(m.length))
}

function analyzeLine(lineText: string, baseFrom: number): Diagnostic[] {
  const out: Diagnostic[] = []
  const trimmed = lineText.trim()
  if (!trimmed || DIRECTIVE_RE.test(trimmed)) return out

  const masked = maskLabels(lineText)
  const wordRe = /\S+/g
  let m: RegExpExecArray | null
  while ((m = wordRe.exec(masked)) !== null) {
    const word = m[0]
    if (ARROW_TOKEN_RE.test(word)) continue
    const idPart = word.split(/::|:/)[0]
    if (!idPart) continue
    if (NON_ASCII.test(idPart)) {
      out.push({
        from: baseFrom + m.index,
        to: baseFrom + m.index + word.length,
        message: rt('linter.nonAscii', { label: idPart }),
        severity: 'warning',
      })
    }
  }

  let em: RegExpExecArray | null
  UNQUOTED_EDGE_LABEL_RE.lastIndex = 0
  while ((em = UNQUOTED_EDGE_LABEL_RE.exec(lineText)) !== null) {
    const label = em[1]
    if (!label.includes(' ')) continue
    const labelStart = em.index + em[0].indexOf(label)
    out.push({
      from: baseFrom + labelStart,
      to: baseFrom + labelStart + label.length,
      message: rt('linter.edgeLabelSpace', { label }),
      severity: 'warning',
    })
  }

  return out
}

export const mermaidLinter: Extension = linter((view) => {
  const doc = view.state.doc
  const text = doc.toString()

  if (!isFlowchartLike(text)) return []

  const diagnostics: Diagnostic[] = []
  const lineCount = doc.lines

  for (let i = 1; i <= lineCount; i++) {
    const line = doc.line(i)
    diagnostics.push(...analyzeLine(line.text, line.from))
  }

  return diagnostics
}, { delay: 250 })
