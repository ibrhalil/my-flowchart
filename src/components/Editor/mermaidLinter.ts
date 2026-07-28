import { linter, type Diagnostic } from '@codemirror/lint'
import type { Extension } from '@codemirror/state'

/**
 * Mermaid kaynak kodu üzerinde ASCII dışı karakter / boşluk kaynaklı
 * yaygın hataları işaretleyen CodeMirror linter.
 *
 * Kapsam: yalnızca `flowchart` ve `graph` blokları.
 * Diğer diyagram türleri farklı söz dizimine sahip; yanlış alarm üretmemek için atlanır.
 */

/** ASCII dışı herhangi bir karakter (Türkçe, Almanca, Kiril, Çince vb.) */
const NON_ASCII = /\P{ASCII}/u

const DIRECTIVE_RE =
  /^(%%|subgraph\b|end\b|classDef\b|class\b|linkStyle\b|style\b|click\b|direction\b|graph\b|flowchart\b)/i

const ARROW_TOKEN_RE = /^[-=.>+]+$/

/** Etiket/içerik maskesi: köşeli/parantezli içerikleri boşlukla değiştirir */
const LABEL_MASK_RE =
  /(\[[^\]]*\]|\(\([^)]*\)\)|\([\s\S]*?\)|\{[^}]*\}|<[^>]*>|\|[^|]*\|)|"[^"]*"/g

/** Ok-etiketi deseni: `-- etiket -->` (tırnaksız) */
const UNQUOTED_EDGE_LABEL_RE = /\s--\s+([^"|[\](){}\n]+?)\s+-->/g

function maskLabels(line: string): string {
  return line.replace(LABEL_MASK_RE, (m) => ' '.repeat(m.length))
}

function analyzeLine(lineText: string, baseFrom: number): Diagnostic[] {
  const out: Diagnostic[] = []
  const trimmed = lineText.trim()
  if (!trimmed || DIRECTIVE_RE.test(trimmed)) return out

  // 1) Düz node kimliklerinde ASCII dışı karakter araması
  const masked = maskLabels(lineText)
  const wordRe = /\S+/g
  let m: RegExpExecArray | null
  while ((m = wordRe.exec(masked)) !== null) {
    const word = m[0]
    // Ok sembolleri ve sadece noktalama içeren token'lar atlanır
    if (ARROW_TOKEN_RE.test(word)) continue
    // Birden çok segmenti olan (örn. A:::cls) kelimeyi ID kısmına indir
    const idPart = word.split(/::|:/)[0]
    if (!idPart) continue
    if (NON_ASCII.test(idPart)) {
      out.push({
        from: baseFrom + m.index,
        to: baseFrom + m.index + word.length,
        message: `"${idPart}" ASCII dışı karakter içeriyor. Etiket için köşeli parantez kullan: n1[${idPart}].`,
        severity: 'warning',
      })
    }
  }

  // 2) Tırnaksız, boşluk içeren ok-etiketleri
  let em: RegExpExecArray | null
  UNQUOTED_EDGE_LABEL_RE.lastIndex = 0
  while ((em = UNQUOTED_EDGE_LABEL_RE.exec(lineText)) !== null) {
    const label = em[1]
    if (!label.includes(' ')) continue
    const labelStart = em.index + em[0].indexOf(label)
    out.push({
      from: baseFrom + labelStart,
      to: baseFrom + labelStart + label.length,
      message: `Ok-etiketinde boşluk var: "${label}". Çift tırnak kullan: -- "${label}" -->.`,
      severity: 'warning',
    })
  }

  return out
}

export const mermaidLinter: Extension = linter((view) => {
  const doc = view.state.doc
  const text = doc.toString()

  // Yalnızca flowchart/graph blokları işle
  if (!/(^|\n)\s*(flowchart|graph)\b/im.test(text)) return []

  const diagnostics: Diagnostic[] = []
  const lineCount = doc.lines

  for (let i = 1; i <= lineCount; i++) {
    const line = doc.line(i)
    diagnostics.push(...analyzeLine(line.text, line.from))
  }

  return diagnostics
}, { delay: 250 })
