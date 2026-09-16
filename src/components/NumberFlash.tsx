import { motion } from 'framer-motion'
import { useI18n } from '../i18n'

export function NumberFlash({
  number,
  onDone,
  kind = 'confession',
}: {
  number: number
  onDone: () => void
  kind?: 'confession' | 'callout'
}) {
  const { t } = useI18n()
  const isCallout = kind === 'callout'
  return (
    <div className="flash-overlay" role="dialog" aria-modal="true" aria-label="Number">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <p style={{ margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.8rem' }}>
          {isCallout ? t.flash.youAreCallout : t.flash.youAre}
        </p>
        <p className="flash-number">#{String(number).padStart(3, '0')}</p>
        <p style={{ margin: '0 0 1.4rem', opacity: 0.85, maxWidth: '18rem', marginInline: 'auto' }}>
          {isCallout ? t.flash.rememberCallout : t.flash.remember}
        </p>
        <button type="button" className="btn btn-primary" onClick={onDone}>
          {isCallout ? t.flash.openCallout : t.flash.open}
        </button>
      </motion.div>
    </div>
  )
}
