import { motion } from 'framer-motion'
import { useI18n } from '../i18n'
import { attribution, hasHugged } from '../lib/confessions'
import type { ConfessionPublic } from '../types'

export function ConfessionCard({
  confession,
  index,
  onOpen,
  onHug,
}: {
  confession: ConfessionPublic
  index: number
  onOpen: (id: string) => void
  onHug: (id: string) => void | Promise<void>
}) {
  const { t } = useI18n()
  const hugged = hasHugged(confession.id)
  const isComeback = confession.kind === 'comeback'
  const attr = attribution(confession, {
    creator: t.detail.theCreator,
    anonymousFrom: t.detail.anonymousFrom,
  })

  return (
    <motion.article
      className={`confession-card${confession.isCreator ? ' creator' : ''}${isComeback ? ' comeback' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.045, 0.32), duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
    >
      <button type="button" className="confession-card-main" onClick={() => onOpen(confession.id)}>
        <div className="confession-meta">
          <span className="confession-num">#{String(confession.number).padStart(3, '0')}</span>
          <span className={`kind-pill${isComeback ? ' comeback' : ''}`}>
            {isComeback ? t.detail.comeback : t.detail.confession}
          </span>
          {isComeback && confession.replyToNumber ? (
            <span className="meta-link">→ #{String(confession.replyToNumber).padStart(3, '0')}</span>
          ) : null}
          {confession.needsHelp ? <span className="need-pill">{t.card.needsSupport}</span> : null}
        </div>
        <p className="confession-place">{attr}</p>
        <p className="confession-preview">{confession.body}</p>
      </button>

      <div className="card-actions">
        <button
          type="button"
          className={`card-hug${hugged ? ' done' : ''}`}
          disabled={hugged}
          onClick={(e) => {
            e.stopPropagation()
            void onHug(confession.id)
          }}
          aria-label={hugged ? t.hug.hugged : t.hug.send}
        >
          {hugged ? t.hug.hugged : t.hug.hug} · {confession.hugCount}
        </button>
        <button type="button" className="card-read" onClick={() => onOpen(confession.id)}>
          {t.card.read}
        </button>
      </div>
    </motion.article>
  )
}
