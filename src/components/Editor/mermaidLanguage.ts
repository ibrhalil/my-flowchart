import { tags as t } from '@lezer/highlight'
import { HighlightStyle, StreamLanguage, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'

const KEYWORDS = new Set([
  'flowchart',
  'graph',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'stateDiagram-v2',
  'erDiagram',
  'gantt',
  'pie',
  'journey',
  'user-journey',
  'gitGraph',
  'gitgraph',
  'mindmap',
  'subgraph',
  'end',
  'section',
  'direction',
  'classDef',
  'class',
  'linkStyle',
  'style',
  'click',
  'title',
  'note',
  'participant',
  'actor',
  'loop',
  'alt',
  'opt',
  'else',
  'rect',
  'autonumber',
  'activate',
  'deactivate',
  'dateFormat',
  'axisFormat',
  'milestone',
  'root',
])

const mermaidStream = StreamLanguage.define<{
  inArrow: boolean
  afterArrow: boolean
}>({
  name: 'mermaid',
  startState() {
    return { inArrow: false, afterArrow: false }
  },
  copyState(s) {
    return { inArrow: s.inArrow, afterArrow: s.afterArrow }
  },
  token(stream, state) {
    if (stream.sol()) {
      state.inArrow = false
      state.afterArrow = false
    }

    if (stream.eatSpace()) return null

    // Yorum: %%
    if (stream.match(/^%%[^\n]*/)) {
      return 'comment'
    }
    if (stream.match(/^;;;[^\n]*/)) {
      return 'comment'
    }

    // Frontmatter içindeki YAML (diagramConfigs vs) — kısa yok sayım
    if (stream.match(/^---$/)) {
      return 'meta'
    }

    // Diagram tanım satırı (flowchart TD gibi)
    if (stream.sol()) {
      const m = stream.match(/^([A-Za-z][\w-]*)(\s+([A-Za-z0-9]+))?/) as
        | RegExpMatchArray
        | null
      if (m) {
        if (KEYWORDS.has(m[1])) {
          return 'keyword'
        }
        // classDef adı veya düz satır — kelime variable olarak işaretlendi
        return 'variable'
      }
    }

    // classDef adı + stiller: "myClass fill:#fff,stroke:#000"
    if (stream.match(/^classDef\b/)) {
      stream.eatSpace()
      return 'keyword'
    }

    // Oklar: -->, ---, ==>, -.->, ===>|...|
    const ch = stream.peek() ?? ''
    if (ch === '-' || ch === '=' || ch === '.') {
      if (stream.match(/^(--|==|-\.|\.\.|->|=>|-?>| x |-->|---|===)/)) {
        state.inArrow = true
        return 'operator'
      }
      if (stream.match(/^[->=.]+/)) {
        state.inArrow = true
        return 'operator'
      }
    }

    if (ch === '|') {
      if (!stream.match(/^\|[^|]*\|/)) stream.next()
      return 'atom'
    }

    // Etiketler: [..], (..), [[..]], ((..)), {..}, >..], "/../"
    if (ch === '[') {
      if (!stream.match(/^\[[^\]]*\]/)) stream.next()
      return 'string'
    }
    if (ch === '(') {
      if (!stream.match(/^\([\s\S]*?\)/)) stream.next()
      return 'string'
    }
    if (ch === '{') {
      if (!stream.match(/^\{[^}]*\}/)) stream.next()
      return 'string'
    }
    if (ch === '"') {
      if (!stream.match(/^"[^"]*"/)) stream.next()
      return 'string'
    }
    if (ch === '<') {
      if (!stream.match(/^<[^>]*>/)) stream.next()
      return 'string'
    }

    if (ch === ':' && state.inArrow) {
      if (!stream.match(/^:[^;\n]+/)) stream.next()
      state.inArrow = false
      return 'atom'
    }

    if (ch === '#' && stream.match(/^#[0-9a-fA-F]{3,8}\b/)) {
      return 'number'
    }
    if (/[0-9]/.test(ch) && stream.match(/^[0-9]+(\.[0-9]+)?/)) {
      return 'number'
    }

    // Tanımlayıcı
    if (/[A-Za-z_]/.test(ch)) {
      stream.match(/^[A-Za-z_][\w-]*/)
      return 'variable'
    }

    stream.next()
    return null
  },
  languageData: {
    commentTokens: { line: '%%' },
  },
})

export const mermaidLanguage = () => mermaidStream

export const mermaidHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#0057ff' },
  { tag: t.variableName, color: '#1a1f2e' },
  { tag: t.string, color: '#0e9f6e' },
  { tag: t.number, color: '#e78a00' },
  { tag: t.atom, color: '#ff4696' },
  { tag: t.operator, color: '#5c6573' },
  { tag: t.comment, color: '#8a929e', fontStyle: 'italic' },
  { tag: t.meta, color: '#dc2626' },
])

const darkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#ff4696' },
  { tag: t.variableName, color: '#f4f0fa' },
  { tag: t.string, color: '#34d399' },
  { tag: t.number, color: '#fbbf24' },
  { tag: t.atom, color: '#c4b5fd' },
  { tag: t.operator, color: '#a89dc4' },
  { tag: t.comment, color: '#7d6e9f', fontStyle: 'italic' },
  { tag: t.meta, color: '#f87171' },
])

export function mermaidThemeExtensions(isDark: boolean): ReturnType<typeof syntaxHighlighting>[] {
  return [
    syntaxHighlighting(isDark ? darkHighlightStyle : mermaidHighlightStyle),
    EditorView.theme({
      '&': {
        backgroundColor: 'transparent',
      },
      '.cm-gutters': {
        backgroundColor: 'transparent',
        borderRight: '1px solid var(--color-border)',
      },
      '.cm-content': {
        caretColor: isDark ? '#ff4696' : '#0057ff',
      },
      '.cm-activeLine': {
        backgroundColor: isDark ? 'rgba(255,70,150,0.06)' : 'rgba(0,87,255,0.05)',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'transparent',
      },
      '.cm-selectionBackground, ::selection': {
        backgroundColor: isDark ? 'rgba(255,70,150,0.25)' : 'rgba(0,87,255,0.18)',
      },
      // Lint diagnostic widget'ları (temaya duyarlı)
      '.cm-diagnostic': {
        backgroundColor: isDark ? '#2d1b45' : '#ffffff',
        color: isDark ? '#f4f0fa' : '#1a1f2e',
        borderColor: isDark ? '#3d2856' : '#e5e2da',
      },
      '.cm-diagnostic-warning': {
        borderLeftColor: isDark ? '#fbbf24' : '#e78a00',
      },
      '.cm-diagnostic-error': {
        borderLeftColor: isDark ? '#f87171' : '#dc2626',
      },
      '.cm-diagnostic-info': {
        borderLeftColor: isDark ? '#ff4696' : '#0057ff',
      },
      '.cm-diagnosticText': {
        color: isDark ? '#a89dc4' : '#5c6573',
      },
      '.cm-diagnosticAction': {
        backgroundColor: isDark ? '#3a2555' : '#f0eee8',
        color: isDark ? '#f4f0fa' : '#1a1f2e',
        borderColor: isDark ? '#4f3870' : '#d4d0c4',
      },
      // Lint tooltip (hover'da çıkan kutucuk)
      '.cm-tooltip.cm-tooltip-lint': {
        backgroundColor: isDark ? '#2d1b45' : '#ffffff',
        color: isDark ? '#f4f0fa' : '#1a1f2e',
        borderColor: isDark ? '#3d2856' : '#e5e2da',
      },
      // Lint gutter işaretçisi
      '.cm-lintMarker': {
        width: '8px',
        height: '8px',
      },
    }),
  ]
}
