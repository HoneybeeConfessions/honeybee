import { useI18n } from '../i18n'
import type { Callout } from '../types'

export function CalloutCard({
  callout,
  index,
  onOpen,
}: {
  callout: Callout
  index: number
  onOpen: (id: string) => void
}) {
  const { t } = useI18n()
  const num = String(callout.number).padStart(3, '0')
  const rising = index < 3 && callout.secondCount > 0

  return (
    <article className={`callout-card${rising ? ' rising' : ''}`}>
      <button type="button" className="callout-card-main" onClick={() => onOpen(callout.id)}>
        <div className="callout-card-top">
          <span className="callout-pill">{t.callouts.label}</span>
          <strong className="callout-num">#{num}</strong>
        </div>
        <p className="callout-preview">{callout.body}</p>
        <div className="callout-card-meta">
          <span>
            {t.callouts.from} {callout.locationNorm}
          </span>
          <span>
            {callout.secondCount}{' '}
            {callout.secondCount === 1 ? t.callouts.secondOne : t.callouts.seconds}
          </span>
        </div>
        <span className="callout-read">{t.callouts.read}</span>
      </button>
    </article>
  )
}
