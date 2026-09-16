import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import {
  estimateYearToDate,
  formatLossCount,
  GLOBAL_MEN_PER_DAY,
  GLOBAL_MEN_PER_YEAR,
  SA_MEN_PER_DAY,
  SA_MEN_PER_YEAR,
} from '../lib/lossCounter'

export function LossCounter() {
  const { t } = useI18n()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const sa = estimateYearToDate(SA_MEN_PER_YEAR, now)
  const global = estimateYearToDate(GLOBAL_MEN_PER_YEAR, now)
  const year = now.getFullYear()

  return (
    <div className="loss-counter" role="region" aria-label="Male suicide awareness counters">
      <div className="loss-counter-grid">
        <div className="loss-tile">
          <span className="loss-label">{t.loss.saLabel.replace('{year}', String(year))}</span>
          <strong className="loss-num" aria-live="polite">
            {formatLossCount(sa)}
          </strong>
          <span className="loss-rate">
            {t.loss.perDay.replace('{n}', SA_MEN_PER_DAY.toFixed(1))}
          </span>
        </div>
        <div className="loss-tile">
          <span className="loss-label">{t.loss.worldLabel.replace('{year}', String(year))}</span>
          <strong className="loss-num" aria-live="polite">
            {formatLossCount(global)}
          </strong>
          <span className="loss-rate">
            {t.loss.perDay.replace('{n}', String(Math.round(GLOBAL_MEN_PER_DAY)))}
          </span>
        </div>
      </div>
      <p className="loss-note">
        {t.loss.note}{' '}
        <a
          href="https://www.who.int/publications/i/item/9789240026643"
          target="_blank"
          rel="noreferrer"
        >
          {t.loss.who}
        </a>
      </p>
    </div>
  )
}
