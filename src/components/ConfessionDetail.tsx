import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import {
  addHug,
  attribution,
  flagConfession,
  getConfession,
  getConfessionByNumber,
  hasHugged,
  listComebacksFor,
  listMoreFromVoice,
} from '../lib/confessions'
import type { Confession, ConfessionPublic } from '../types'
import { Comments } from './Comments'
import { DonationDetails } from './DonationDetails'
import { HugButton } from './HugButton'

export function ConfessionDetail({
  id,
  onBack,
  onOpen,
}: {
  id: string
  onBack: () => void
  onOpen: (id: string) => void
}) {
  const { t } = useI18n()
  const [confession, setConfession] = useState<Confession | null>(null)
  const [hugged, setHugged] = useState(false)
  const [showDonate, setShowDonate] = useState(false)
  const [more, setMore] = useState<ConfessionPublic[]>([])
  const [linkedComebacks, setLinkedComebacks] = useState<ConfessionPublic[]>([])
  const [parent, setParent] = useState<Confession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const c = await getConfession(id)
      if (cancelled) return
      setConfession(c)
      setHugged(c ? hasHugged(c.id) : false)
      setShowDonate(false)
      if (c?.authorKey) {
        setMore(await listMoreFromVoice(c.authorKey, c.id))
      } else {
        setMore([])
      }
      if (c?.kind === 'comeback' && c.replyToNumber) {
        setParent(await getConfessionByNumber(c.replyToNumber))
      } else {
        setParent(null)
      }
      if (c && c.kind !== 'comeback') {
        setLinkedComebacks(await listComebacksFor(c.number))
      } else {
        setLinkedComebacks([])
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="screen">
        <p className="empty">{t.detail.loading}</p>
      </div>
    )
  }

  if (!confession || confession.status === 'hidden') {
    return (
      <div className="screen">
        <button type="button" className="back-link" onClick={onBack}>
          {t.write.back}
        </button>
        <p className="empty">{t.detail.unavailable}</p>
      </div>
    )
  }

  const isComeback = confession.kind === 'comeback'
  const num = String(confession.number).padStart(3, '0')
  const attr = attribution(confession, {
    creator: t.detail.theCreator,
    anonymousFrom: t.detail.anonymousFrom,
  })

  const wa = confession.whatsapp
    ? `https://wa.me/${confession.whatsapp}?text=${encodeURIComponent(
        `Honeybee #${confession.number}`,
      )}`
    : null

  const mail = confession.email
    ? `mailto:${encodeURIComponent(confession.email)}?subject=${encodeURIComponent(
        `Honeybee #${confession.number}`,
      )}`
    : null

  return (
    <div className={`screen detail-screen${isComeback ? ' detail-comeback' : ''}`}>
      <button type="button" className="back-link" onClick={onBack}>
        {t.detail.back}
      </button>
      <p className="shot-hint">{t.detail.shotHint}</p>

      <article
        className={`share-frame${isComeback ? ' comeback' : ''}${confession.isCreator ? ' creator' : ''}`}
        aria-label={`${isComeback ? t.detail.comeback : t.detail.confession} ${num}`}
      >
        <div className="share-frame-inner">
          <header className="share-top">
            <div className="share-brand">
              Honey<span>bee</span>
            </div>
            <div className={`share-kind${isComeback ? ' comeback' : ''}`}>
              {isComeback ? t.detail.comeback : t.detail.confession}
            </div>
          </header>

          <div className="share-id-row">
            <p className="share-number">#{num}</p>
            <div className="share-id-meta">
              <p className="share-attr">{attr}</p>
              {confession.isCreator ? (
                <p className="share-creator-line">{t.detail.creatorLine}</p>
              ) : null}
              {isComeback && confession.replyToNumber ? (
                <p className="share-reply">
                  {t.detail.returningTo} #{String(confession.replyToNumber).padStart(3, '0')}
                </p>
              ) : null}
            </div>
          </div>

          <div className="share-rule" aria-hidden />

          <p className="share-body">{confession.body}</p>

          <footer className="share-foot">
            <div className="share-hug-block">
              <HugButton
                count={confession.hugCount}
                hugged={hugged}
                onHug={async () => {
                  const updated = await addHug(confession.id)
                  if (updated) {
                    setConfession(updated)
                    setHugged(true)
                  }
                }}
              />
            </div>
            <div className="share-foot-end">
              <span>{t.detail.stillHere}</span>
              <span className="share-foot-mark">honeybee</span>
            </div>
          </footer>
        </div>
      </article>

      {isComeback && confession.replyToNumber && parent ? (
        <p className="comeback-link-note" style={{ marginTop: '0.85rem' }}>
          <button
            type="button"
            className="back-link"
            style={{ marginBottom: 0 }}
            onClick={() => onOpen(parent.id)}
          >
            {t.detail.openOriginal} #{String(confession.replyToNumber).padStart(3, '0')} →
          </button>
        </p>
      ) : null}

      {(mail || wa || confession.accountDetails) && (
        <div className="help-panel">
          <h3>{confession.isCreator ? t.detail.reachCreator : t.detail.helpPerson}</h3>
          <p style={{ margin: '0 0 0.75rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
            {confession.isCreator ? t.detail.reachCreatorHint : t.detail.helpPersonHint}
          </p>
          <div className="help-actions">
            {mail ? (
              <a className="btn btn-soft" href={mail}>
                {t.detail.sendMessage}
              </a>
            ) : null}
            {wa ? (
              <a className="btn btn-soft" href={wa} target="_blank" rel="noreferrer">
                {t.detail.whatsapp}
              </a>
            ) : null}
            {confession.accountDetails ? (
              <button type="button" className="btn btn-ghost" onClick={() => setShowDonate((v) => !v)}>
                {showDonate ? t.detail.hideDonate : t.detail.showDonate}
              </button>
            ) : null}
          </div>
          {showDonate && confession.accountDetails ? (
            <DonationDetails
              bankType={confession.bankType}
              accountDetails={confession.accountDetails}
              showFraud
            />
          ) : null}
        </div>
      )}

      {linkedComebacks.length > 0 ? (
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 className="section-title" style={{ fontSize: '1.2rem' }}>
            {t.detail.comebacksToThis}
          </h3>
          <p className="section-sub">{t.detail.comebacksToThisSub}</p>
          <div className="tag-row">
            {linkedComebacks.map((m) => (
              <button key={m.id} type="button" className="chip comeback-chip" onClick={() => onOpen(m.id)}>
                #{String(m.number).padStart(3, '0')}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <Comments confessionId={confession.id} />

      {more.length > 0 ? (
        <section style={{ marginTop: '1.75rem' }}>
          <h3 className="section-title" style={{ fontSize: '1.2rem' }}>
            {t.detail.moreVoice}
          </h3>
          <p className="section-sub">{t.detail.moreVoiceSub}</p>
          <div className="tag-row">
            {more.map((m) => (
              <button key={m.id} type="button" className="chip" onClick={() => onOpen(m.id)}>
                #{String(m.number).padStart(3, '0')}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {!confession.isCreator ? (
        <p style={{ marginTop: '1.75rem' }}>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() =>
              void flagConfession(confession.id).then((c) => {
                if (c) setConfession(c)
              })
            }
          >
            {t.detail.report}
          </button>
        </p>
      ) : null}
    </div>
  )
}
