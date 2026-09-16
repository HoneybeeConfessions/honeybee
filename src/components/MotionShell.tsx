import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function MotionShell({ children, screenKey }: { children: ReactNode; screenKey: string }) {
  return (
    <motion.div
      key={screenKey}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
