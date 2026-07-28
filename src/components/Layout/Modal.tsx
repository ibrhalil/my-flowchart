import { useEffect } from 'react'
import { X } from 'lucide-react'

import { useTranslation } from '../../lib/i18n'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  widthClass?: string
}

export function Modal({ open, title, onClose, children, widthClass = 'max-w-3xl' }: ModalProps) {
  const { t } = useTranslation()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[85vh] w-full ${widthClass} flex-col overflow-hidden rounded-xl border border-border bg-bg-surface shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
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
