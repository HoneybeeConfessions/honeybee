import { motion } from 'framer-motion'
import { useI18n } from '../i18n'

export function NumberFlash({
  number,
  onDone,
}: {
  number: number
  onDone: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="flash-overlay" role="dialog" aria-modal="true" aria-label="Confession number">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <p style={{ margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.8rem' }}>
          {t.flash.youAre}
        </p>
        <p className="flash-number">#{String(number).padStart(3, '0')}</p>
        <p style={{ margin: '0 0 1.4rem', opacity: 0.85, maxWidth: '18rem', marginInline: 'auto' }}>
          {t.flash.remember}
        </p>
        <button type="button" className="btn btn-primary" onClick={onDone}>
          {t.flash.open}
        </button>
      </motion.div>
    </div>
  )
}
