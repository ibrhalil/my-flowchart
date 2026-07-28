import { useState } from 'react'

import { Header } from './components/Layout/Header'
import { SplitPane } from './components/Layout/SplitPane'
import { CodeEditor } from './components/Editor/CodeEditor'
import { EditorToolbar } from './components/Editor/EditorToolbar'
import { DiagramPreview } from './components/Preview/DiagramPreview'
import { TemplateGallery } from './components/Gallery/TemplateGallery'
import { HistoryPanel } from './components/History/HistoryPanel'
import { HelpModal } from './components/Layout/HelpModal'
import { SettingsModal } from './components/Settings/SettingsModal'
import { Toast } from './components/Layout/Toast'
import { useApplyTheme } from './hooks/useApplyTheme'
import { useAutoSnapshot } from './hooks/useAutoSnapshot'

export default function App() {
  useApplyTheme()
  useAutoSnapshot()

  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="flex h-full flex-col bg-bg-base text-text">
      <Header
        onOpenTemplates={() => setTemplatesOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="min-h-0 flex-1">
        <SplitPane
          left={
            <section className="flex h-full flex-col bg-bg-subtle">
              <EditorToolbar />
              <div className="min-h-0 flex-1">
                <CodeEditor />
              </div>
            </section>
          }
          right={<DiagramPreview />}
        />
      </main>

      <TemplateGallery open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Toast />
    </div>
  )
}
