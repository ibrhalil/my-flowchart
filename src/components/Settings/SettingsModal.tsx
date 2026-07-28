import { Moon, Sun, RotateCcw } from 'lucide-react'

import { useSettingsStore, DEFAULT_SETTINGS } from '../../store/settingsStore'
import { useDiagramStore } from '../../store/diagramStore'
import { useTranslation } from '../../lib/i18n'
import { Modal } from '../Layout/Modal'
import { Button } from '../ui/Button'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

const PNG_SCALES = [1, 2, 3, 4]
const FONT_SIZES = [12, 13, 14, 16]
const IDLE_OPTIONS = [5000, 10000, 30000]

export function SettingsModal({ open, onClose }: SettingsModalProps) {
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

  const handleReset = () => {
    resetSettings()
    setToast(t('settings.toastReset'))
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('settings.title')} widthClass="max-w-2xl">
      <div className="space-y-6 p-5">
        {/* 1. Görünüm */}
        <Section title={t('settings.appearance')} subtitle={t('settings.appearanceSubtitle')}>
          <Field label={t('settings.appTheme')}>
            <div className="grid grid-cols-2 gap-2">
              <ThemeCard
                active={theme === 'light'}
                onClick={() => setTheme('light')}
                icon={<Sun size={18} />}
                label={t('settings.light')}
              />
              <ThemeCard
                active={theme === 'dark'}
                onClick={() => setTheme('dark')}
                icon={<Moon size={18} />}
                label={t('settings.dark')}
              />
            </div>
          </Field>
        </Section>

        <Divider />

        {/* 2. Dil */}
        <Section title={t('settings.language')} subtitle={t('settings.languageSubtitle')}>
          <Field label={t('language.label')}>
            <SegmentedGroup>
              <Segmented
                active={locale === 'tr'}
                onClick={() => setLocale('tr')}
              >
                {t('language.tr')}
             </Segmented>
              <Segmented
                active={locale === 'en'}
                onClick={() => setLocale('en')}
              >
                {t('language.en')}
             </Segmented>
           </SegmentedGroup>
         </Field>
       </Section>

        <Divider />

        {/* 3. Düzenleme */}
        <Section title={t('settings.editor')} subtitle={t('settings.editorSubtitle')}>
          <Field label={t('settings.editorFontSize')}>
            <SegmentedGroup>
              {FONT_SIZES.map((s) => (
                <Segmented
                  key={s}
                  active={editorFontSize === s}
                  onClick={() => setEditorFontSize(s)}
                >
                  {s} px
               </Segmented>
              ))}
           </SegmentedGroup>
         </Field>
       </Section>

        <Divider />

        {/* 4. Çıktı */}
        <Section title={t('settings.output')} subtitle={t('settings.outputSubtitle')}>
          <Field label={t('settings.pngResolution')}>
            <SegmentedGroup>
              {PNG_SCALES.map((s) => (
                <Segmented key={s} active={pngScale === s} onClick={() => setPngScale(s)}>
                  ×{s}
               </Segmented>
              ))}
           </SegmentedGroup>
         </Field>
       </Section>

        <Divider />

        {/* 5. Otomatik kaydet */}
        <Section title={t('settings.autoSave')} subtitle={t('settings.autoSaveSubtitle')}>
          <Field label={t('settings.status')}>
            <Toggle
              checked={autoSaveEnabled}
              onChange={setAutoSaveEnabled}
              label={autoSaveEnabled ? t('settings.on') : t('settings.off')}
            />
         </Field>

          <Field label={t('settings.idleTimeout')}>
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
         </Field>
       </Section>

        <Divider />

        {/* 6. Sıfırla */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-text">
              {t('settings.resetAll')}
         </div>
            <div className="text-xs text-text-subtle">
              {t('settings.resetDescription', {
                theme: DEFAULT_SETTINGS.theme === 'dark' ? t('settings.dark') : t('settings.light'),
                fontSize: DEFAULT_SETTINGS.editorFontSize,
                pngScale: DEFAULT_SETTINGS.pngScale,
              })}
         </div>
       </div>
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw size={13} />
            {t('settings.resetButton')}
         </Button>
       </div>
     </div>
   </Modal>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {subtitle ? (
          <p className="text-xs text-text-subtle">{subtitle}</p>
        ) : null}
   </div>
      {children}
   </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-text-muted">{label}</label>
      <div>{children}</div>
  </div>
  )
}

function Divider() {
  return <div className="h-px bg-border" />
}

function ThemeCard({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border p-3 text-left transition ${
        active
          ? 'border-primary bg-primary-soft ring-1 ring-primary'
          : 'border-border bg-bg-surface hover:border-border-strong'
      }`}
    >
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
          active
            ? 'bg-primary text-white'
            : 'bg-bg-subtle text-text-muted'
        }`}
      >
        {icon}
     </span>
      <span className="text-sm font-medium text-text">{label}</span>
    </button>
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
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'bg-primary text-white shadow-sm'
          : 'text-text-muted hover:text-text'
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
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
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
