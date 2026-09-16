import { motion } from 'framer-motion'
import { useI18n } from '../i18n'
import type { ConfessionPublic } from '../types'
import { ConfessionCard } from './ConfessionCard'
import { LangSwitcher } from './LangSwitcher'

export function HomeFeed({
  confessions,
  filter,
  onFilter,
  onOpen,
  onWrite,
  onAbout,
  onHug,
}: {
  confessions: ConfessionPublic[]
  filter: string
  onFilter: (f: string) => void
  onOpen: (id: string) => void
  onWrite: () => void
  onAbout: () => void
  onHug: (id: string) => void | Promise<void>
}) {
  const { t, comfort, setComfort } = useI18n()

  const filters = [
    { id: 'all', label: t.home.filterAll },
    { id: 'confession', label: t.home.filterConfession },
    { id: 'comeback', label: t.home.filterComeback },
    { id: 'help', label: t.home.filterHelp },
  ]

  const filtered = confessions.filter((c) => {
    if (filter === 'all') return true
    if (filter === 'help') return c.needsHelp
    if (filter === 'comeback') return c.kind === 'comeback'
    if (filter === 'confession') return c.kind !== 'comeback'
    return true
  })

  const confessionCount = confessions.filter((c) => c.kind !== 'comeback').length
  const comebackCount = confessions.filter((c) => c.kind === 'comeback').length
  const hugTotal = confessions.reduce((n, c) => n + c.hugCount, 0)

  return (
    <div className="screen home-screen">
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1 className="brand">
              {t.home.brandHoney}
              <span>{t.home.brandBee}</span>
            </h1>
            <p className="hero-line">{t.home.hero}</p>
          </div>
          <div className="hero-tools">
            <LangSwitcher compact />
            <motion.button
              type="button"
              className="btn btn-primary hero-cta"
              onClick={onWrite}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
            >
              {t.home.writeCta}
            </motion.button>
          </div>
        </div>
      </header>

      <p className="trust-strip">{t.home.trust}</p>

      <div className="home-pulse" aria-label="Community pulse">
        <div className="pulse-item">
          <strong>{confessionCount}</strong>
          <span>{t.home.pulseConfessions}</span>
        </div>
        <div className="pulse-item">
          <strong>{comebackCount}</strong>
          <span>{t.home.pulseComebacks}</span>
        </div>
        <div className="pulse-item">
          <strong>{hugTotal}</strong>
          <span>{t.home.pulseHugs}</span>
        </div>
      </div>

      <div className="feed-head">
        <div>
          <h2 className="section-title">{t.home.feedTitle}</h2>
          <p className="section-sub">{t.home.feedSub}</p>
        </div>
        <div className="legend" aria-hidden>
          <span className="legend-item">
            <i className="swatch honey" /> {t.home.legendConfession}
          </span>
          <span className="legend-item">
            <i className="swatch olive" /> {t.home.legendComeback}
          </span>
        </div>
      </div>

      <div className="filter-bar" role="toolbar" aria-label="Filter">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`chip${filter === f.id ? ' on' : ''}${f.id === 'comeback' ? ' comeback-chip' : ''}`}
            onClick={() => onFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty home-empty">
          <p>{t.home.emptyFilter}</p>
          <button type="button" className="btn btn-soft" onClick={onWrite}>
            {t.home.writeNext}
          </button>
        </div>
      ) : (
        <div className="confession-list">
          {filtered.map((c, i) => (
            <ConfessionCard key={c.id} confession={c} index={i} onOpen={onOpen} onHug={onHug} />
          ))}
        </div>
      )}

      <footer className="home-foot">
        <button type="button" className="back-link" onClick={onAbout}>
          {t.home.aboutLink}
        </button>
        <button
          type="button"
          className={`chip comfort-chip${comfort ? ' on' : ''}`}
          onClick={() => setComfort(!comfort)}
        >
          {comfort ? t.comfort.on : t.comfort.off}
        </button>
      </footer>
    </div>
  )
}
