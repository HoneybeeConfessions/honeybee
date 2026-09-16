import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { listComebackPosts } from '../lib/confessions'
import type { ConfessionPublic } from '../types'

export function UnderstandUs({ onOpen }: { onOpen: (id: string) => void }) {
  const { t } = useI18n()
  const [comebacks, setComebacks] = useState<ConfessionPublic[]>([])

  useEffect(() => {
    void listComebackPosts(6).then(setComebacks)
  }, [])

  return (
    <div className="screen panel-screen">
      <header className="panel-head">
        <p className="panel-eyebrow">{t.women.eyebrow}</p>
        <h1 className="section-title">{t.women.title}</h1>
        <p className="section-sub">{t.women.lead}</p>
      </header>

      <section className="write-card panel-card">
        {t.women.paragraphs.map((p) => (
          <p key={p.slice(0, 28)} className="panel-copy">
            {p}
          </p>
        ))}
      </section>

      <div className="panel-split">
        <section className="write-card panel-card good">
          <h2 className="panel-card-title">{t.women.helpsTitle}</h2>
          <ul className="panel-list">
            {t.women.helps.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
        <section className="write-card panel-card hurt">
          <h2 className="panel-card-title">{t.women.hurtsTitle}</h2>
          <ul className="panel-list">
            {t.women.hurts.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel-block">
        <div className="feed-head">
          <div>
            <h2 className="section-title" style={{ fontSize: '1.3rem' }}>
              {t.women.comebacksTitle}
            </h2>
            <p className="section-sub">{t.women.comebacksSub}</p>
          </div>
        </div>

        {comebacks.length === 0 ? (
          <div className="empty home-empty">
            <p>{t.women.comebacksEmpty}</p>
          </div>
        ) : (
          <div className="confession-list">
            {comebacks.map((c) => (
              <button key={c.id} type="button" className="mini-comeback" onClick={() => onOpen(c.id)}>
                <div className="confession-meta">
                  <span className="confession-num">#{String(c.number).padStart(3, '0')}</span>
                  <span className="kind-pill comeback">{t.detail.comeback}</span>
                  {c.replyToNumber ? (
                    <span className="meta-link">→ #{String(c.replyToNumber).padStart(3, '0')}</span>
                  ) : null}
                </div>
                <p className="confession-preview">{c.body}</p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
