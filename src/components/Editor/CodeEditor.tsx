import { useEffect, useRef } from 'react'

import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import {
  bracketMatching,
  foldGutter,
  indentOnInput,
  indentUnit,
} from '@codemirror/language'
import { lintGutter } from '@codemirror/lint'

import { useDiagramStore } from '../../store/diagramStore'
import { useSettingsStore } from '../../store/settingsStore'
import {
  mermaidLanguage,
  mermaidThemeExtensions,
} from './mermaidLanguage'
import { mermaidLinter } from './mermaidLinter'

// Tema extension'larını runtime'da değiştirebilmek için (ışık/koyu geçişi).
const themeCompartment = new Compartment()

interface CodeEditorProps {
  className?: string
}

export function CodeEditor({ className }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)

  const code = useDiagramStore((s) => s.code)
  const setCode = useDiagramStore((s) => s.setCode)
  const theme = useSettingsStore((s) => s.theme)
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)

  const codeRef = useRef(code)
  codeRef.current = code

  // Editörü bir kez kur
  useEffect(() => {
    if (!hostRef.current) return

    const updateListener = EditorView.updateListener.of((u) => {
      if (u.docChanged) {
        const next = u.state.doc.toString()
        if (next !== codeRef.current) setCode(next)
      }
    })

    const state = EditorState.create({
      doc: codeRef.current,
      extensions: [
        lineNumbers(),
        foldGutter({ openText: '▾', closedText: '▸' }),
        history(),
        indentOnInput(),
        indentUnit.of('  '),
        bracketMatching(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        highlightSelectionMatches(),
        lintGutter(),
        mermaidLinter,
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          indentWithTab,
        ]),
        mermaidLanguage(),
        themeCompartment.of(mermaidThemeExtensions(theme === 'dark')),
        EditorView.lineWrapping,
        updateListener,
      ],
    })

    const view = new EditorView({ state, parent: hostRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // Editör yalnızca bir kez kurulur; tema değişimleri yukarıdaki reconfigure effect'i ile canlı uygulanır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Tema değiştiğinde extension'ları yeniden yapılandır
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      effects: themeCompartment.reconfigure(mermaidThemeExtensions(theme === 'dark')),
    })
  }, [theme])

  // Font boyutu değiştiğinde editöre yansıt
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dom.style.fontSize = `${editorFontSize}px`
  }, [editorFontSize])

  // Dış kaynak değişti (import/template) → editörü güncelle
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== code) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: code },
      })
    }
  }, [code])

  return (
    <div
      ref={hostRef}
      className={`cm-host h-full w-full overflow-hidden bg-bg-surface ${className ?? ''}`}
    />
  )
}
