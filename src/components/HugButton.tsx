import { motion, useAnimation } from 'framer-motion'
import { useState } from 'react'
import { useI18n } from '../i18n'

export function HugButton({
  count,
  hugged,
  onHug,
}: {
  count: number
  hugged: boolean
  onHug: () => void | Promise<void>
}) {
  const { t } = useI18n()
  const controls = useAnimation()
  const [busy, setBusy] = useState(false)

  async function handle() {
    if (hugged || busy) return
    setBusy(true)
    await controls.start({
      scale: [1, 1.12, 1],
      transition: { duration: 0.45 },
    })
    await onHug()
    setBusy(false)
  }

  return (
    <div className="hug-row">
      <motion.button
        type="button"
        className={`hug-btn${hugged ? ' done' : ''}`}
        animate={controls}
        onClick={() => void handle()}
        disabled={hugged || busy}
        aria-pressed={hugged}
      >
        <svg className="hug-arms" viewBox="0 0 120 48" aria-hidden>
          <motion.path
            d="M10 28 C 28 8, 52 8, 60 24"
            fill="none"
            stroke="#1a1410"
            strokeWidth="2.2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={hugged ? { pathLength: 1, opacity: 0.55 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
          <motion.path
            d="M110 28 C 92 8, 68 8, 60 24"
            fill="none"
            stroke="#1a1410"
            strokeWidth="2.2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={hugged ? { pathLength: 1, opacity: 0.55 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        {hugged ? t.hug.hugged : t.hug.send}
      </motion.button>
      <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
        <strong style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
          {count}
        </strong>{' '}
        {count === 1 ? t.hug.hugOne : t.hug.hugs}
      </span>
    </div>
  )
}
