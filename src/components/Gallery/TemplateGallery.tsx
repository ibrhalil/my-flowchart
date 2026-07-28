import { useMemo, useState } from 'react'

import { Modal } from '../Layout/Modal'
import { TEMPLATES } from '../../data/templates'
import { DIAGRAM_TYPE_LABELS, type DiagramType } from '../../types/project'
import { useDiagramStore } from '../../store/diagramStore'
import { useTranslation } from '../../lib/i18n'

interface TemplateGalleryProps {
  open: boolean
  onClose: () => void
}

export function TemplateGallery({ open, onClose }: TemplateGalleryProps) {
  const loadProject = useDiagramStore((s) => s.loadProject)
  const setToast = useDiagramStore((s) => s.setToast)
  const [filter, setFilter] = useState<DiagramType | 'all'>('all')
  const { t } = useTranslation()

  const grouped = useMemo(() => {
    const list = filter === 'all' ? TEMPLATES : TEMPLATES.filter((tpl) => tpl.type === filter)
    const map = new Map<DiagramType, typeof TEMPLATES>()
    for (const tpl of list) {
      if (!map.has(tpl.type)) map.set(tpl.type, [])
      map.get(tpl.type)!.push(tpl)
    }
    return Array.from(map.entries())
  }, [filter])

  const apply = (code: string, title: string, description: string) => {
    loadProject({ code, title, description })
    setToast(t('gallery.toastLoad', { title }))
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('gallery.title')} widthClass="max-w-5xl">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-4 py-3">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          {t('gallery.all')}
    </FilterChip>
        {Object.entries(DIAGRAM_TYPE_LABELS).map(([key, label]) =>
          key === 'other' ? null : (
            <FilterChip key={key} active={filter === key} onClick={() => setFilter(key as DiagramType)}>
              {label}
        </FilterChip>
          ),
        )}
  </div>

      <div className="space-y-6 p-4">
        {grouped.map(([type, items]) => (
          <section key={type}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-subtle">
              {DIAGRAM_TYPE_LABELS[type]}
        </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => apply(tpl.code, tpl.title, tpl.description)}
                  className="group flex flex-col rounded-lg border border-border bg-bg-surface p-3 text-left transition hover:border-primary hover:shadow-md"
                >
                  <div className="mb-1 text-sm font-medium text-text group-hover:text-primary">
                    {tpl.title}
            </div>
                  <div className="mb-2 text-xs text-text-subtle">{tpl.description}</div>
                  <pre className="max-h-28 overflow-hidden rounded bg-bg-subtle p-2 text-[10px] leading-tight text-text-muted">
                    {tpl.code.split('\n').slice(0, 6).join('\n')}
            </pre>
          </button>
              ))}
        </div>
        </section>
        ))}
  </div>
  </Modal>
  )
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? 'bg-primary text-white'
          : 'bg-bg-subtle text-text-muted hover:bg-border-strong'
      }`}
    >
      {children}
 </button>
  )
}
