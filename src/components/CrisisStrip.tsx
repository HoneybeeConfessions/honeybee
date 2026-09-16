import { useI18n } from '../i18n'
import { LangSwitcher } from './LangSwitcher'

const LINES = [
  { href: 'tel:0800567567', key: 'sadag' as const },
  { href: 'sms:31393', key: 'sms' as const },
  { href: 'tel:0861322322', key: 'lifeline' as const },
  { href: 'tel:0800708090', key: 'akeso' as const },
  { href: 'tel:116', key: 'childline' as const },
  { href: 'tel:10111', key: 'police' as const },
]

export function CrisisStrip() {
  const { t } = useI18n()
  return (
    <div className="crisis" role="region" aria-label="Crisis help">
      <div className="crisis-top">
        <span>{t.crisis.copy}</span>
        <LangSwitcher compact />
      </div>
      <div className="crisis-links">
        {LINES.map((l) => (
          <a key={l.href + l.key} href={l.href}>
            {t.crisis[l.key]}
          </a>
        ))}
      </div>
    </div>
  )
}
