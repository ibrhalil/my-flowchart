import { useMemo, useState } from 'react'
import { FilePlus, Search, Sparkles } from 'lucide-react'

import { Modal } from '../Layout/Modal'
import { TEMPLATES } from '../../data/templates'
import { DIAGRAM_TYPE_LABELS, type DiagramType } from '../../types/project'
import { useDiagramStore } from '../../store/diagramStore'
import { useTranslation } from '../../lib/i18n'
import { TypeGlyph } from './TypeGlyph'

export type GalleryMode = 'browse' | 'new'

interface TemplateGalleryProps {
  open: boolean
  onClose: () => void
  /** `new`: "Yeni diyagram" akışı; en başta boş belge seçeneği gösterilir. */
  mode?: GalleryMode
}

export function TemplateGallery({ open, onClose, mode = 'browse' }: TemplateGalleryProps) {
  const loadProject = useDiagramStore((s) => s.loadProject)
  const newDocument = useDiagramStore((s) => s.newDocument)
  const setToast = useDiagramStore((s) => s.setToast)
  const [filter, setFilter] = useState<DiagramType | 'all'>('all')
  const [query, setQuery] = useState('')
  const { locale, dict, t } = useTranslation()

  const hints: Record<string, string> = dict.gallery.typeHints

  const localized = useMemo(
    () =>
      TEMPLATES.map((tpl) => ({
        tpl,
        title: locale === 'en' ? (tpl.titleEn ?? tpl.title) : tpl.title,
        description: locale === 'en' ? (tpl.descriptionEn ?? tpl.description) : tpl.description,
        code: locale === 'en' ? (tpl.codeEn ?? tpl.code) : tpl.code,
      })),
    [locale],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(locale)
    return localized.filter(({ tpl, title, description, code }) => {
      if (filter !== 'all' && tpl.type !== filter) return false
      if (!q) return true
      return (
        title.toLocaleLowerCase(locale).includes(q) ||
        description.toLocaleLowerCase(locale).includes(q) ||
        (hints[tpl.type] ?? '').toLocaleLowerCase(locale).includes(q) ||
        DIAGRAM_TYPE_LABELS[tpl.type].toLowerCase().includes(q) ||
        code.toLocaleLowerCase(locale).includes(q)
      )
    })
  }, [localized, filter, query, locale, hints])

  const grouped = useMemo(() => {
    const map = new Map<DiagramType, typeof filtered>()
    for (const item of filtered) {
      if (!map.has(item.tpl.type)) map.set(item.tpl.type, [])
      map.get(item.tpl.type)!.push(item)
    }
    return Array.from(map.entries())
  }, [filtered])

  // Galeri bileşeni mount kalır; kapanışta arama/filtre sıfırlanmazsa bir sonraki açılışta eski filtre görünür.
  const close = () => {
    setFilter('all')
    setQuery('')
    onClose()
  }

  const apply = (code: string, title: string, description: string) => {
    loadProject({ code, title, description })
    setToast(t('gallery.toastLoad', { title }))
    close()
  }

  const startBlank = () => {
    newDocument()
    close()
  }

  const isNew = mode === 'new'

  return (
    <Modal
      open={open}
      onClose={close}
      title={t(isNew ? 'gallery.newTitle' : 'gallery.title')}
      widthClass="max-w-5xl"
    >
      <div className="sticky top-0 z-10 space-y-2 border-b border-border bg-bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
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
              className="h-8 w-full rounded-md border border-border bg-bg-surface pl-8 pr-2 text-xs text-text placeholder:text-text-subtle focus:border-primary focus:outline-none"
            />
          </div>
          <span className="shrink-0 text-xs tabular-nums text-text-subtle" role="status">
            {t('gallery.resultCount', { count: filtered.length })}
          </span>
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            {t('gallery.all')}
          </FilterChip>
          {Object.entries(DIAGRAM_TYPE_LABELS).map(([key, label]) =>
            key === 'other' ? null : (
              <FilterChip
                key={key}
                active={filter === key}
                title={hints[key]}
                onClick={() => setFilter(key as DiagramType)}
              >
                {label}
              </FilterChip>
            ),
          )}
        </div>
      </div>

      <div className="space-y-6 p-4">
        <p className="text-sm text-text-muted">{t('gallery.intro')}</p>

        {isNew ? (
          <button
            type="button"
            onClick={startBlank}
            className="group flex w-full items-center gap-3 rounded-lg border border-dashed border-border-strong bg-bg-surface p-3 text-left transition hover:border-primary hover:bg-primary-soft"
          >
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-bg-subtle text-text-muted transition group-hover:bg-primary group-hover:text-on-primary">
              <FilePlus size={22} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-text">{t('gallery.blankTitle')}</span>
              <span className="mt-0.5 block text-xs text-text-subtle">{t('gallery.blankDesc')}</span>
            </span>
          </button>
        ) : null}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-text-subtle">
            <Sparkles size={20} aria-hidden />
            {t('gallery.noResults')}
          </div>
        ) : (
          grouped.map(([type, items]) => (
            <section key={type}>
              <h3 className="text-sm font-semibold text-text">{DIAGRAM_TYPE_LABELS[type]}</h3>
              {hints[type] ? <p className="mb-2 mt-0.5 text-xs text-text-subtle">{hints[type]}</p> : null}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(({ tpl, title, description, code }) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => apply(code, title, description)}
                    className="group flex items-start gap-3 rounded-lg border border-border bg-bg-surface p-3 text-left transition hover:border-primary hover:shadow-md"
                  >
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft transition group-hover:scale-105">
                      <TypeGlyph type={tpl.type} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-text group-hover:text-primary">
                        {title}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-text-subtle">
                        {description}
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
  title,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  title?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      title={title}
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? 'bg-primary text-on-primary'
          : 'bg-bg-subtle text-text-muted hover:bg-primary-soft hover:text-primary'
      }`}
    >
      {children}
    </button>
  )
}
