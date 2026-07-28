import { Modal } from './Modal'
import { useTranslation } from '../../lib/i18n'

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  const { dict, t } = useTranslation()
  const shapes = dict.help.shapes
  const tips = dict.help.tipItems
  const pitfalls = dict.help.pitfallItems

  return (
    <Modal open={open} onClose={onClose} title={t('help.title')} widthClass="max-w-3xl">
      <div className="space-y-6 p-5 text-sm text-text-muted">
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-subtle">
            {t('help.goldenRule')}
          </h3>
          <p
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t('help.goldenRuleDesc') }}
          />
          <pre className="mt-2 overflow-auto rounded-lg bg-text p-3 text-[12px] leading-relaxed text-bg-surface">
{dict.help.goldenRuleExample}
          </pre>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-subtle">
            {t('help.nodeShapes')}
          </h3>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-bg-subtle text-xs uppercase text-text-subtle">
                <tr>
                  <th className="px-3 py-2 font-medium">{t('help.syntax')}</th>
                  <th className="px-3 py-2 font-medium">{t('help.description')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shapes.map((s) => (
                  <tr key={s.syntax}>
                    <td className="px-3 py-1.5">
                      <code className="rounded bg-bg-subtle px-1.5 py-0.5 text-[12px] text-text">
                        {s.syntax}
                      </code>
                    </td>
                    <td className="px-3 py-1.5 text-text-muted">{s.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-subtle">
            {t('help.tips')}
          </h3>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-bg-subtle text-xs uppercase text-text-subtle">
                <tr>
                  <th className="px-3 py-2 font-medium">{t('help.syntax')}</th>
                  <th className="px-3 py-2 font-medium">{t('help.description')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tips.map((s) => (
                  <tr key={s.syntax}>
                    <td className="px-3 py-1.5">
                      <code className="rounded bg-bg-subtle px-1.5 py-0.5 text-[12px] text-text">
                        {s.syntax}
                      </code>
                    </td>
                    <td className="px-3 py-1.5 text-text-muted">{s.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-subtle">
            {t('help.pitfalls')}
          </h3>
          <ul className="space-y-2">
            {pitfalls.map((p) => (
              <li
                key={p.problem}
                className="rounded-lg border border-warning/50 bg-warning-soft p-3 text-[13px]"
              >
                <div className="font-medium text-text">{p.problem}</div>
                <div className="mt-1 text-text-muted">{p.solution}</div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-subtle">
            {t('help.autoHelp')}
          </h3>
          <p
            className="leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t('help.autoHelpDesc') }}
          />
        </section>
      </div>
    </Modal>
  )
}
