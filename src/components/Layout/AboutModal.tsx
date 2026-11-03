import { ExternalLink } from 'lucide-react'

import { Modal } from './Modal'
import { APP_INFO } from '../../lib/appInfo'
import { useTranslation } from '../../lib/i18n'

interface AboutModalProps {
  open: boolean
  onClose: () => void
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  const { locale, t } = useTranslation()

  const builtAt = new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(APP_INFO.builtAt))

  const meta: [label: string, value: string][] = [
    [t('about.version'), `v${APP_INFO.version}`],
    ...(APP_INFO.commit ? [[t('about.commit'), APP_INFO.commit] as [string, string]] : []),
    [t('about.builtAt'), builtAt],
    ...(APP_INFO.license ? [[t('about.license'), APP_INFO.license] as [string, string]] : []),
  ]

  return (
    <Modal open={open} onClose={onClose} title={t('about.title')} widthClass="max-w-lg">
      <div className="space-y-6 p-5 text-sm text-text-muted">
        <div>
          <div className="text-base font-semibold text-text">{t('appTitle')}</div>
          <p className="mt-1 leading-relaxed">{t('about.description')}</p>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
          {meta.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-text-subtle">{label}</dt>
              <dd className="font-mono text-text">{value}</dd>
            </div>
          ))}
        </dl>

        <section>
          <h3 className="section-label mb-2">
            {t('about.dependencies')}
          </h3>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-border">
                {APP_INFO.dependencies.map((dep) => (
                  <tr key={dep.name}>
                    <td className="px-3 py-1.5 text-text">{dep.name}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-text-muted">{dep.version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {APP_INFO.repositoryUrl ? (
          <a
            href={APP_INFO.repositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ExternalLink size={14} aria-hidden />
            {t('about.repository')}
          </a>
        ) : null}
      </div>
    </Modal>
  )
}
