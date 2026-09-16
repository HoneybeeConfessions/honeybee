import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { listAwareness } from '../lib/awareness'
import { countAllComments } from '../lib/comments'
import { platformStats } from '../lib/confessions'
import type { AwarenessStat, ConfessionPublic } from '../types'

export function Insights({ confessions }: { confessions: ConfessionPublic[] }) {
  const { t } = useI18n()
  const stats = platformStats(confessions)
  const [comments, setComments] = useState(0)
  const [awareness, setAwareness] = useState<AwarenessStat[]>([])

  useEffect(() => {
    void countAllComments().then(setComments)
    void listAwareness().then(setAwareness)
  }, [confessions])

  const tiles = [
    { value: stats.total, label: t.insights.posts },
    { value: stats.hugs, label: t.insights.hugs },
    { value: comments, label: t.insights.comments },
    { value: stats.comebacks, label: t.insights.comebacks },
    { value: stats.needing, label: t.insights.needSupport },
  ]

  return (
    <div className="screen panel-screen">
      <header className="panel-head">
        <p className="panel-eyebrow">{t.insights.eyebrow}</p>
        <h1 className="section-title">{t.insights.title}</h1>
        <p className="section-sub">{t.insights.lead}</p>
      </header>

      <div className="insights-grid">
        {tiles.map((tile) => (
          <div key={tile.label} className="stat-tile">
            <strong>{tile.value}</strong>
            <span>{tile.label}</span>
          </div>
        ))}
      </div>

      <section className="write-card panel-card">
        <h2 className="panel-card-title">{t.insights.placesTitle}</h2>
        {stats.topPlaces.length === 0 ? (
          <p className="panel-muted">{t.insights.placesEmpty}</p>
        ) : (
          <ul className="place-list">
            {stats.topPlaces.map(([place, n], i) => (
              <li key={place}>
                <span className="place-rank">{i + 1}</span>
                <span className="place-name">{place}</span>
                <span className="place-count">{n}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel-block">
        <h2 className="section-title" style={{ fontSize: '1.3rem' }}>
          {t.insights.awarenessTitle}
        </h2>
        <p className="section-sub">{t.insights.awarenessSub}</p>
        <div className="awareness-list">
          {awareness.map((a) => (
            <article key={a.id} className="write-card panel-card awareness-card">
              <h3 className="panel-card-title">{a.metric}</h3>
              <p className="awareness-value">
                {a.value}
                {a.metric.toLowerCase().includes('share') ? '%' : ''}
              </p>
              <p className="panel-muted">{a.note}</p>
              <p className="awareness-source">
                <a href={a.sourceUrl} target="_blank" rel="noreferrer">
                  {t.insights.source}
                </a>
                <span>· {a.date}</span>
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
