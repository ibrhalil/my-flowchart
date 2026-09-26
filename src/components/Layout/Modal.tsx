import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

import { useTranslation } from '../../lib/i18n'
import { suppressTooltipFocusOpen } from './tooltipFocus'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  widthClass?: string
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ open, title, onClose, children, widthClass = 'max-w-3xl' }: ModalProps) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const headingId = useId()
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    // Açılış: odağı diyaloğa taşı; kapanışta tetikleyiciye geri ver.
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    if (dialog) {
      const focusables = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      const target = focusables.length > 0 ? focusables[0] : dialog
      target.focus()
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const dlg = dialogRef.current
      if (!dlg) return
      const items = Array.from(dlg.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (items.length === 0) {
        e.preventDefault()
        dlg.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !dlg.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !dlg.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      // Odağı tetikleyiciye geri vermek erişilebilirlik için önemlidir; ancak
      // bu programatik odak, tetikleyicinin tooltip'ini faresiz açıp ekranda
      // takılı bırakır. Açılışı bastırıp odağı yine de geri veriyoruz.
      suppressTooltipFocusOpen()
      restoreFocusRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className={`relative flex max-h-[85vh] w-full ${widthClass} flex-col overflow-hidden rounded-xl border border-border bg-bg-surface shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id={headingId} className="text-sm font-semibold text-text">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-subtle transition hover:bg-bg-subtle hover:text-text"
            aria-label={t('common.close')}
          >
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
