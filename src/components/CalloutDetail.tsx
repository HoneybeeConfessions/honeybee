import { motion, useAnimation } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { addSecond, flagCallout, getCallout, hasSeconded } from '../lib/callouts'
import type { Callout } from '../types'

export function CalloutDetail({
  id,
  onBack,
}: {
  id: string
  onBack: () => void
}) {
  const { t } = useI18n()
  const [callout, setCallout] = useState<Callout | null>(null)
  const [seconded, setSeconded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const controls = useAnimation()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const c = await getCallout(id)
      if (cancelled) return
      setCallout(c)
      setSeconded(c ? hasSeconded(c.id) : false)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  async function onSecond() {
    if (!callout || seconded || busy) return
    setBusy(true)
    await controls.start({ scale: [1, 1.06, 1], transition: { duration: 0.4 } })
    const updated = await addSecond(callout.id)
    if (updated) {
      setCallout(updated)
      setSeconded(true)
    }
    setBusy(false)
  }

  async function onFlag() {
    if (!callout) return
    const updated = await flagCallout(callout.id)
    if (updated?.status === 'hidden') {
      setCallout(null)
      return
    }
    if (updated) setCallout(updated)
  }

  if (loading) {
    return (
      <div className="screen">
        <p className="empty">{t.callouts.loading}</p>
      </div>
    )
  }

  if (!callout || callout.status === 'hidden') {
    return (
      <div className="screen">
        <button type="button" className="back-link" onClick={onBack}>
          {t.callouts.back}
        </button>
        <p className="empty">{t.callouts.unavailable}</p>
      </div>
    )
  }

  const num = String(callout.number).padStart(3, '0')

  return (
    <div className="screen detail-screen callout-detail">
      <button type="button" className="back-link" onClick={onBack}>
        {t.callouts.back}
      </button>
      <p className="shot-hint callout-shot-hint">{t.callouts.shotHint}</p>

      <article className="callout-frame" aria-label={`${t.callouts.label} ${num}`}>
        <div className="callout-frame-inner">
          <header className="callout-frame-top">
            <div className="share-brand">
              Honey<span>bee</span>
            </div>
            <div className="callout-kind">{t.callouts.label}</div>
          </header>

          <div className="callout-frame-id">
            <p className="callout-frame-number">#{num}</p>
            <p className="callout-frame-from">
              {t.callouts.from} {callout.locationNorm}
            </p>
          </div>

          <div className="callout-frame-rule" aria-hidden />

          <p className="callout-frame-body">{callout.body}</p>

          <footer className="callout-frame-foot">
            <div className="callout-second-block">
              <motion.button
                type="button"
                className={`second-btn${seconded ? ' done' : ''}`}
                animate={controls}
                onClick={() => void onSecond()}
                disabled={seconded || busy}
                aria-pressed={seconded}
              >
                {seconded ? t.callouts.seconded : t.callouts.second}
              </motion.button>
              <span className="callout-second-count">
                <strong>{callout.secondCount}</strong>{' '}
                {callout.secondCount === 1 ? t.callouts.secondOne : t.callouts.seconds}
              </span>
            </div>
            <div className="callout-frame-end">
              <span>{t.callouts.stillNaming}</span>
              <span className="callout-hash">{t.callouts.hashtag}</span>
            </div>
          </footer>
        </div>
      </article>

      <button type="button" className="back-link" style={{ marginTop: '1rem' }} onClick={() => void onFlag()}>
        {t.callouts.report}
      </button>
    </div>
  )
}
