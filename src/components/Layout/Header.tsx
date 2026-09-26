import { Book, HelpCircle, History, LayoutTemplate, Settings } from 'lucide-react'

import { Tooltip } from './Tooltip'
import { IconButton } from '../ui/Button'
import { useTranslation } from '../../lib/i18n'

interface HeaderProps {
  onOpenTemplates: () => void
  onOpenHistory: () => void
  onOpenHelp: () => void
  onOpenSettings: () => void
}

export function Header({ onOpenTemplates, onOpenHistory, onOpenHelp, onOpenSettings }: HeaderProps) {
  const { t } = useTranslation()
  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-border bg-bg-surface px-4 py-2">
      <div className="flex items-center gap-2">
        <img
          src="/logo-light.svg"
          alt=""
          aria-hidden="true"
          className="block h-9 w-auto dark:hidden"
        />
        <img
          src="/logo-dark.svg"
          alt=""
          aria-hidden="true"
          className="hidden h-9 w-auto dark:block"
        />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-text">{t('appTitle')}</div>
          <div className="text-[11px] text-text-subtle">{t('appSubtitle')}</div>
       </div>
     </div>

      <div className="mx-1 hidden h-8 w-px bg-border sm:block" />

      <div className="ml-auto flex items-center gap-2">
        <IconButton label={t('header.templatesTooltip')} side="bottom" onClick={onOpenTemplates}>
          <LayoutTemplate />
        </IconButton>

        <IconButton label={t('header.historyTooltip')} side="bottom" onClick={onOpenHistory}>
          <History />
        </IconButton>

        <IconButton label={t('header.helpTooltip')} side="bottom" onClick={onOpenHelp}>
          <HelpCircle />
        </IconButton>

        <Tooltip label={t('header.mermaidDocs')} side="bottom">
          <a
            href="https://mermaid.js.org/intro/"
            target="_blank"
            rel="noreferrer"
            aria-label={t('header.mermaidDocs')}
            className="hidden h-8 w-8 items-center justify-center rounded-md border border-border bg-bg-surface text-text-muted transition hover:bg-bg-subtle hover:text-text sm:inline-flex sm:h-9 sm:w-9 [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-[18px] sm:[&_svg]:w-[18px]"
          >
            <Book />
          </a>
        </Tooltip>

        <IconButton
          label={t('header.settingsTooltip')}
          side="bottom"
          variant="primary"
          onClick={onOpenSettings}
        >
          <Settings />
        </IconButton>
      </div>
   </header>
  )
}
