import { motion } from 'framer-motion'
import { useI18n } from '../i18n'
import type { Callout } from '../types'
import { CalloutCard } from './CalloutCard'

export function CalloutsFeed({
  callouts,
  onOpen,
  onWrite,
}: {
  callouts: Callout[]
  onOpen: (id: string) => void
  onWrite: () => void
}) {
  const { t } = useI18n()
  const critical = callouts.filter((c) => c.secondCount > 0).slice(0, 3)

  return (
    <div className="screen callouts-screen">
      <header className="callouts-hero">
        <div className="callouts-hero-inner">
          <div>
            <h1 className="section-title callouts-title">{t.callouts.title}</h1>
            <p className="section-sub callouts-sub">{t.callouts.sub}</p>
          </div>
          <motion.button
            type="button"
            className="btn btn-primary"
            onClick={onWrite}
            whileTap={{ scale: 0.97 }}
          >
            {t.callouts.writeCta}
          </motion.button>
        </div>
      </header>

      <p className="trust-strip callout-trust">{t.callouts.trust}</p>

      {critical.length > 0 ? (
        <section className="callout-critical" aria-label={t.callouts.critical}>
          <h2 className="callout-critical-title">{t.callouts.critical}</h2>
          <p className="section-sub">{t.callouts.criticalSub}</p>
          <div className="callout-critical-pulse" aria-hidden>
            <span className="callout-heartbeat" />
          </div>
        </section>
      ) : null}

      {callouts.length === 0 ? (
        <div className="empty">
          <p>{t.callouts.empty}</p>
          <button type="button" className="btn btn-soft" onClick={onWrite}>
            {t.callouts.writeCta}
          </button>
        </div>
      ) : (
        <div className="callout-list">
          {callouts.map((c, i) => (
            <CalloutCard key={c.id} callout={c} index={i} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  )
}
