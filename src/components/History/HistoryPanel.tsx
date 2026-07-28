import { Trash2, Undo2, History as HistoryIcon } from 'lucide-react'

import { Modal } from '../Layout/Modal'
import { useDiagramStore } from '../../store/diagramStore'
import { useTranslation } from '../../lib/i18n'
import { Button, IconButton } from '../ui/Button'

interface HistoryPanelProps {
  open: boolean
  onClose: () => void
}

export function HistoryPanel({ open, onClose }: HistoryPanelProps) {
  const history = useDiagramStore((s) => s.history)
  const restore = useDiagramStore((s) => s.restoreHistory)
  const remove = useDiagramStore((s) => s.removeHistory)
  const clear = useDiagramStore((s) => s.clearHistory)
  const { locale, t } = useTranslation()

  const formatTime = (ts: number): string => {
    try {
      return new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(ts))
    } catch {
      return new Date(ts).toISOString()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('history.title')} widthClass="max-w-3xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="flex items-center gap-1.5 text-xs text-text-subtle">
          <HistoryIcon size={14} /> {t('history.recordCount', { count: history.length })}
        </span>
        <Button
          variant="danger"
          size="sm"
          onClick={clear}
          disabled={history.length === 0}
        >
          {t('history.clearAll')}
        </Button>
      </div>

      {history.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-subtle">
          <p className="font-medium">{t('history.empty')}</p>
          <p className="mt-1 text-xs">{t('history.emptyDesc')}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {history.map((h) => (
            <li key={h.id} className="flex items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => {
                    restore(h.id)
                    onClose()
                  }}
                  title={t('history.restore')}
                  className="block w-full truncate text-left text-sm font-medium text-text transition hover:text-primary"
                >
                  {h.title || t('history.noName')}
                </button>
                <div className="text-[11px] tabular-nums text-text-subtle">
                  {formatTime(h.savedAt)}
                </div>
                <pre className="mt-1 max-h-20 overflow-hidden rounded bg-bg-subtle p-2 text-[10px] text-text-muted">
                  {h.code.split('\n').slice(0, 4).join('\n')}
                </pre>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <IconButton
                  label={t('history.restore')}
                  onClick={() => {
                    restore(h.id)
                    onClose()
                  }}
                >
                  <Undo2 size={14} />
                </IconButton>
                <IconButton
                  label={t('history.delete')}
                  variant="danger"
                  onClick={() => remove(h.id)}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
