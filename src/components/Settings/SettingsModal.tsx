import { Moon, Sun, RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { useSettingsStore, DEFAULT_SETTINGS } from '../../store/settingsStore'
import { eraseAllData, useDiagramStore } from '../../store/diagramStore'
import { APP_INFO } from '../../lib/appInfo'
import { useTranslation } from '../../lib/i18n'
import { Modal } from '../Layout/Modal'
import { Button } from '../ui/Button'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  onOpenAbout: () => void
}

const PNG_SCALES = [1, 2, 3, 4]
const FONT_SIZES = [12, 13, 14, 16]
const IDLE_OPTIONS = [5000, 10000, 30000]

export function SettingsModal({ open, onClose, onOpenAbout }: SettingsModalProps) {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const pngScale = useSettingsStore((s) => s.pngScale)
  const setPngScale = useSettingsStore((s) => s.setPngScale)
  const editorFontSize = useSettingsStore((s) => s.editorFontSize)
  const setEditorFontSize = useSettingsStore((s) => s.setEditorFontSize)
  const autoSaveEnabled = useSettingsStore((s) => s.autoSaveEnabled)
  const setAutoSaveEnabled = useSettingsStore((s) => s.setAutoSaveEnabled)
  const autoSaveIdleMs = useSettingsStore((s) => s.autoSaveIdleMs)
  const setAutoSaveIdleMs = useSettingsStore((s) => s.setAutoSaveIdleMs)
  const resetSettings = useSettingsStore((s) => s.resetSettings)
  const setToast = useDiagramStore((s) => s.setToast)
  const { locale, setLocale, dict, t } = useTranslation()
  const [confirmingErase, setConfirmingErase] = useState(false)

  const close = () => {
    setConfirmingErase(false)
    onClose()
  }

  const handleErase = () => {
    if (eraseAllData()) {
      window.location.reload()
      return
    }
    setToast(t('toasts.eraseFailed'))
    setConfirmingErase(false)
  }

  const handleReset = () => {
    resetSettings()
    setToast(t('settings.toastReset'))
  }

  return (
    <Modal open={open} onClose={close} title={t('settings.title')} widthClass="max-w-xl">
      <div className="space-y-6 p-5">
        <Section title={t('settings.appearance')}>
          <Row label={t('settings.theme')} description={t('settings.themeDesc')}>
            <SegmentedGroup>
              <Segmented active={theme === 'light'} onClick={() => setTheme('light')}>
                <Sun size={13} aria-hidden />
                {t('settings.light')}
              </Segmented>
              <Segmented active={theme === 'dark'} onClick={() => setTheme('dark')}>
                <Moon size={13} aria-hidden />
                {t('settings.dark')}
              </Segmented>
            </SegmentedGroup>
          </Row>
          <Row label={t('settings.language')} description={t('settings.languageDesc')}>
            <SegmentedGroup>
              <Segmented active={locale === 'tr'} onClick={() => setLocale('tr')}>
                {t('language.tr')}
              </Segmented>
              <Segmented active={locale === 'en'} onClick={() => setLocale('en')}>
                {t('language.en')}
              </Segmented>
            </SegmentedGroup>
          </Row>
        </Section>

        <Section title={t('settings.editor')}>
          <Row label={t('settings.editorFontSize')} description={t('settings.editorFontSizeDesc')}>
            <SegmentedGroup>
              {FONT_SIZES.map((s) => (
                <Segmented key={s} active={editorFontSize === s} onClick={() => setEditorFontSize(s)}>
                  {s} px
                </Segmented>
              ))}
            </SegmentedGroup>
          </Row>
        </Section>

        <Section title={t('settings.output')}>
          <Row label={t('settings.pngResolution')} description={t('settings.pngResolutionDesc')}>
            <SegmentedGroup>
              {PNG_SCALES.map((s) => (
                <Segmented key={s} active={pngScale === s} onClick={() => setPngScale(s)}>
                  ×{s}
                </Segmented>
              ))}
            </SegmentedGroup>
          </Row>
        </Section>

        <Section title={t('settings.autoSave')}>
          <Row label={t('settings.autoSave')} description={t('settings.autoSaveDesc')}>
            <Toggle
              checked={autoSaveEnabled}
              onChange={setAutoSaveEnabled}
              label={autoSaveEnabled ? t('settings.on') : t('settings.off')}
              ariaLabel={t('settings.autoSave')}
            />
          </Row>
          <Row
            label={t('settings.idleTimeout')}
            description={t('settings.idleTimeoutDesc')}
            muted={!autoSaveEnabled}
          >
            <SegmentedGroup>
              {IDLE_OPTIONS.map((value) => (
                <Segmented
                  key={value}
                  active={autoSaveIdleMs === value}
                  onClick={() => setAutoSaveIdleMs(value)}
                  disabled={!autoSaveEnabled}
                >
                  {dict.settings.idleOptions[String(value) as keyof typeof dict.settings.idleOptions]}
                </Segmented>
              ))}
            </SegmentedGroup>
          </Row>
        </Section>

        <Section title={t('settings.data')}>
          <Row
            label={confirmingErase ? t('settings.eraseConfirmTitle') : t('settings.dataLabel')}
            description={confirmingErase ? t('settings.eraseConfirm') : t('settings.dataDesc')}
          >
            {confirmingErase ? (
              <div className="flex gap-2">
                <Button variant="danger-soft" onClick={handleErase}>
                  {t('settings.eraseYes')}
                </Button>
                <Button onClick={() => setConfirmingErase(false)}>{t('settings.eraseCancel')}</Button>
              </div>
            ) : (
              <Button variant="danger-soft" onClick={() => setConfirmingErase(true)}>
                <Trash2 size={13} aria-hidden />
                {t('settings.eraseButton')}
              </Button>
            )}
          </Row>
        </Section>

        <Section title={t('about.title')}>
          <Row
            label={t('about.version')}
            description={`v${APP_INFO.version}${APP_INFO.commit ? ` · ${APP_INFO.commit}` : ''}`}
          >
            <Button onClick={onOpenAbout}>{t('settings.aboutDetails')}</Button>
          </Row>
        </Section>
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-bg-surface px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-xs text-text-subtle">
          {t('settings.resetDescription', {
            theme: DEFAULT_SETTINGS.theme === 'dark' ? t('settings.dark') : t('settings.light'),
            fontSize: DEFAULT_SETTINGS.editorFontSize,
            pngScale: DEFAULT_SETTINGS.pngScale,
          })}
        </p>
        <Button variant="ghost" onClick={handleReset} className="shrink-0 self-start sm:self-auto">
          <RotateCcw size={13} aria-hidden />
          {t('settings.resetButton')}
        </Button>
      </div>
    </Modal>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="section-label mb-2">{title}</h3>
      <div className="divide-y divide-border rounded-lg border border-border">{children}</div>
    </section>
  )
}

function Row({
  label,
  description,
  muted,
  children,
}: {
  label: string
  description?: string
  muted?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex flex-col gap-2 px-4 py-3 transition-opacity sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
        muted ? 'opacity-60' : ''
      }`}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-text">{label}</div>
        {description ? <div className="mt-0.5 text-xs text-text-subtle">{description}</div> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function SegmentedGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-border bg-bg-subtle p-0.5">
      {children}
    </div>
  )
}

function Segmented({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'bg-primary text-on-primary shadow-sm'
          : 'text-text-muted hover:text-primary'
      }`}
    >
      {children}
    </button>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  ariaLabel,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? 'bg-primary' : 'bg-border-strong'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? 'left-[1.375rem]' : 'left-0.5'
          }`}
        />
      </span>
      <span className="text-xs font-medium text-text-muted">{label}</span>
    </button>
  )
}
