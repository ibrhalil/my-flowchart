import { useMemo, useState } from 'react'
import { Search, Sparkles } from 'lucide-react'

import { Modal } from '../Layout/Modal'
import { TEMPLATES } from '../../data/templates'
import { DIAGRAM_TYPE_LABELS, type DiagramType, type TemplateEntry } from '../../types/project'
import { useDiagramStore } from '../../store/diagramStore'
import { useTranslation } from '../../lib/i18n'
import { TypeGlyph } from './TypeGlyph'

interface TemplateGalleryProps {
  open: boolean
  onClose: () => void
}

export function TemplateGallery({ open, onClose }: TemplateGalleryProps) {
  const loadProject = useDiagramStore((s) => s.loadProject)
  const setToast = useDiagramStore((s) => s.setToast)
  const [filter, setFilter] = useState<DiagramType | 'all'>('all')
  const [query, setQuery] = useState('')
  const { locale, t } = useTranslation()

  const localized = useMemo(
    () =>
      TEMPLATES.map((tpl) => ({
        tpl,
        title: locale === 'en' ? (tpl.titleEn ?? tpl.title) : tpl.title,
        description: locale === 'en' ? (tpl.descriptionEn ?? tpl.description) : tpl.description,
      })),
    [locale],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(locale)
    return localized.filter(({ tpl, title, description }) => {
      if (filter !== 'all' && tpl.type !== filter) return false
      if (!q) return true
      return (
        title.toLocaleLowerCase(locale).includes(q) ||
        description.toLocaleLowerCase(locale).includes(q) ||
        DIAGRAM_TYPE_LABELS[tpl.type].toLowerCase().includes(q) ||
        tpl.code.toLocaleLowerCase(locale).includes(q)
      )
    })
  }, [localized, filter, query, locale])

  const grouped = useMemo(() => {
    const map = new Map<DiagramType, typeof filtered>()
    for (const item of filtered) {
      if (!map.has(item.tpl.type)) map.set(item.tpl.type, [])
      map.get(item.tpl.type)!.push(item)
    }
    return Array.from(map.entries())
  }, [filtered])

  const apply = (tpl: TemplateEntry, title: string, description: string) => {
    loadProject({ code: tpl.code, title, description })
    setToast(t('gallery.toastLoad', { title }))
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('gallery.title')} widthClass="max-w-5xl">
      <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-56">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('gallery.search')}
            aria-label={t('gallery.searchLabel')}
            className="h-7 w-full rounded-md border border-border bg-bg-surface pl-8 pr-2 text-xs text-text placeholder:text-text-subtle focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            {t('gallery.all')}
          </FilterChip>
          {Object.entries(DIAGRAM_TYPE_LABELS).map(([key, label]) =>
            key === 'other' ? null : (
              <FilterChip
                key={key}
                active={filter === key}
                onClick={() => setFilter(key as DiagramType)}
              >
                {label}
              </FilterChip>
            ),
          )}
        </div>
        <span className="shrink-0 text-xs tabular-nums text-text-subtle">
          {t('gallery.resultCount', { count: filtered.length })}
        </span>
      </div>

      <div className="space-y-6 p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-text-subtle">
            <Sparkles size={20} aria-hidden />
            {t('gallery.noResults')}
          </div>
        ) : (
          grouped.map(([type, items]) => (
            <section key={type}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-subtle">
                {DIAGRAM_TYPE_LABELS[type]}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(({ tpl, title, description }) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => apply(tpl, title, description)}
                    className="group flex items-start gap-3 rounded-lg border border-border bg-bg-surface p-3 text-left transition hover:border-primary hover:shadow-md"
                  >
                    <span className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft transition group-hover:scale-105">
                      <TypeGlyph type={tpl.type} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-text group-hover:text-primary">
                          {title}
                        </span>
                        <span className="shrink-0 rounded-full bg-bg-subtle px-2 py-0.5 text-[10px] font-medium text-text-subtle">
                          {DIAGRAM_TYPE_LABELS[tpl.type]}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-text-subtle">
                        {description}
                      </span>
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                        {t('gallery.use')} →
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
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
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? 'bg-primary text-on-primary'
          : 'bg-bg-subtle text-text-muted hover:bg-border-strong'
      }`}
    >
      {children}
    </button>
  )
}
