import { useCallback } from 'react'

import { useDiagramStore } from '../store/diagramStore'
import { useTranslation } from '../lib/i18n'
import { isFlowchartLike, normalizeMermaid } from '../services/transform/normalizeMermaid'

export function useNormalizeAction(): {
  run: () => void
  canRun: boolean
} {
  const code = useDiagramStore((s) => s.code)
  const setCode = useDiagramStore((s) => s.setCode)
  const setToast = useDiagramStore((s) => s.setToast)
  const { t } = useTranslation()

  const run = useCallback(() => {
    if (!isFlowchartLike(code)) {
      setToast(t('editor.normalizeNoBlock'))
      return
    }
    const report = normalizeMermaid(code)
    if (report.unchanged) {
      setToast(t('editor.normalizeUnchanged'))
      return
    }
    setCode(report.code)
    const parts: string[] = []
    if (report.renamed) parts.push(`${report.renamed} ${t('editor.normalizeIdUnit')}`)
    if (report.quoted) parts.push(`${report.quoted} ${t('editor.normalizeLabelUnit')}`)
    setToast(t('editor.normalizeDone', { detail: parts.length ? `: ${parts.join(' + ')}` : '' }))
  }, [code, setCode, setToast, t])

  return { run, canRun: isFlowchartLike(code) }
}
