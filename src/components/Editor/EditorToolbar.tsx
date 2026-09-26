import { useEffect } from 'react'
import { Wand2 } from 'lucide-react'

import { useDiagramStore } from '../../store/diagramStore'
import { useNormalizeAction } from '../../hooks/useNormalizeAction'
import { useAutoGrowTextarea } from '../../hooks/useAutoGrowTextarea'
import { useTranslation } from '../../lib/i18n'
import { IconButton } from '../ui/Button'

export function EditorToolbar() {
  const title = useDiagramStore((s) => s.title)
  const setTitle = useDiagramStore((s) => s.setTitle)
  const description = useDiagramStore((s) => s.description)
  const setDescription = useDiagramStore((s) => s.setDescription)
  const { run: runNormalize } = useNormalizeAction()
  const { ref: descRef, resize: resizeDesc } = useAutoGrowTextarea(500)
  const { t } = useTranslation()

  // Şablon/içe aktarma gibi dış kaynaklı açıklama değişimlerinde textarea'yı boyutlandır.
  useEffect(() => {
    resizeDesc()
  }, [resizeDesc, description])

  return (
    <div className="border-b border-border bg-bg-subtle/60 px-3 py-1.5">
      <div className="flex items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('editor.titlePlaceholder')}
          aria-label={t('editor.titlePlaceholder')}
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-medium text-text outline-none transition hover:border-border-strong focus:border-primary focus:bg-bg-surface"
        />
        <IconButton
          label={t('editor.normalizeTooltip')}
          side="bottom"
          onClick={runNormalize}
          className="shrink-0"
        >
          <Wand2 />
        </IconButton>
    </div>

      <textarea
        ref={descRef}
        value={description}
        onChange={(e) => {
          setDescription(e.target.value)
          resizeDesc()
        }}
        placeholder={t('editor.descPlaceholder')}
        aria-label={t('editor.descPlaceholder')}
        rows={1}
        className="mt-1 w-full resize-none overflow-auto rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm leading-relaxed text-text-muted outline-none transition hover:border-border-strong focus:border-primary focus:bg-bg-surface"
        style={{ maxHeight: 500 }}
      />
 </div>
  )
}
