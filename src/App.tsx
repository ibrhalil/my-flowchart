import { useState } from 'react'
import { Code2, Eye } from 'lucide-react'

import { Header } from './components/Layout/Header'
import { SplitPane } from './components/Layout/SplitPane'
import { CodeEditor } from './components/Editor/CodeEditor'
import { EditorToolbar } from './components/Editor/EditorToolbar'
import { DiagramPreview } from './components/Preview/DiagramPreview'
import { TemplateGallery, type GalleryMode } from './components/Gallery/TemplateGallery'
import { HistoryPanel } from './components/History/HistoryPanel'
import { HelpModal } from './components/Layout/HelpModal'
import { AboutModal } from './components/Layout/AboutModal'
import { SettingsModal } from './components/Settings/SettingsModal'
import { Toast } from './components/Layout/Toast'
import { useApplyTheme } from './hooks/useApplyTheme'
import { useAutoSnapshot } from './hooks/useAutoSnapshot'
import { useCrossTabSync } from './hooks/useCrossTabSync'
import { useSharedLink } from './hooks/useSharedLink'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useTranslation } from './lib/i18n'

const DESKTOP_QUERY = '(min-width: 768px)'

export default function App() {
  useApplyTheme()
  useAutoSnapshot()
  useCrossTabSync()
  useSharedLink()

  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor')

  const [gallery, setGallery] = useState<GalleryMode | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  const editorPane = (
    <section className="flex h-full flex-col bg-bg-subtle">
      <EditorToolbar onNew={() => setGallery('new')} />
      <div className="min-h-0 flex-1">
        <CodeEditor />
      </div>
    </section>
  )

  // Mobil: her iki panel de mount kalır; gizli olan yalnızca CSS ile saklanır.
  // Böylece sekme değişiminde CodeMirror geri alma geçmişi ve önizleme
  // zoom/pan durumu kaybolmaz.
  const previewPane = <DiagramPreview />

  return (
    <div className="flex h-full flex-col bg-bg-base text-text">
      <Header
        onOpenTemplates={() => setGallery('browse')}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
      />

      <main className="min-h-0 flex-1">
        {isDesktop ? (
          <SplitPane left={editorPane} right={previewPane} />
        ) : (
          <div className="h-full">
            <div className={mobileTab === 'editor' ? 'h-full' : 'hidden'}>{editorPane}</div>
            <div className={mobileTab === 'preview' ? 'h-full' : 'hidden'}>{previewPane}</div>
          </div>
        )}
      </main>

      {!isDesktop ? <MobileTabBar active={mobileTab} onChange={setMobileTab} /> : null}

      <TemplateGallery
        open={gallery !== null}
        mode={gallery ?? 'browse'}
        onClose={() => setGallery(null)}
      />
      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenAbout={() => {
          setSettingsOpen(false)
          setAboutOpen(true)
        }}
      />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <Toast />
    </div>
  )
}

interface MobileTabBarProps {
  active: 'editor' | 'preview'
  onChange: (tab: 'editor' | 'preview') => void
}

function MobileTabBar({ active, onChange }: MobileTabBarProps) {
  const { t } = useTranslation()
  const tabs = [
    { key: 'editor' as const, label: t('mobile.editorTab'), icon: <Code2 size={18} /> },
    { key: 'preview' as const, label: t('mobile.previewTab'), icon: <Eye size={18} /> },
  ]
  return (
    <nav className="flex shrink-0 border-t border-border bg-bg-surface">
      {tabs.map((tab) => {
        const isActive = active === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex h-12 flex-1 items-center justify-center gap-2 text-sm font-medium transition ${
              isActive ? 'text-primary' : 'text-text-muted'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.icon}
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
