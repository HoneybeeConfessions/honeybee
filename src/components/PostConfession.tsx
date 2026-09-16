import { useState, type FormEvent } from 'react'
import { BANK_TYPES } from '../data/banks'
import { useI18n, type LifeStage } from '../i18n'
import { createConfession } from '../lib/confessions'
import { looksLikeCrisis } from '../lib/strip'
import type { Confession, ConfessionKind } from '../types'

const STAGES: LifeStage[] = ['young', 'husband', 'father', 'provider', 'elder', 'tired']

export function PostConfession({
  onPosted,
  onCancel,
  onCrisis,
}: {
  onPosted: (c: Confession) => void
  onCancel: () => void
  onCrisis: () => void
}) {
  const { t } = useI18n()
  const [kind, setKind] = useState<ConfessionKind>('confession')
  const [replyToNumber, setReplyToNumber] = useState('')
  const [location, setLocation] = useState('')
  const [body, setBody] = useState('')
  const [lifeStage, setLifeStage] = useState<LifeStage | null>(null)
  const [authorEmail, setAuthorEmail] = useState('')
  const [helpEmail, setHelpEmail] = useState('')
  const [helpWhatsapp, setHelpWhatsapp] = useState('')
  const [bankType, setBankType] = useState('')
  const [accountDetails, setAccountDetails] = useState('')
  const [needsHelp, setNeedsHelp] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const isComeback = kind === 'comeback'
  const bodyPlaceholder = lifeStage
    ? t.write.placeholders[lifeStage]
    : t.write.bodyPlaceholderDefault

  function pickStage(stage: LifeStage) {
    setLifeStage((prev) => (prev === stage ? null : stage))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (looksLikeCrisis(body)) onCrisis()
    setBusy(true)
    const result = await createConfession({
      location,
      body,
      tags: [],
      kind,
      replyToNumber: isComeback ? Number(replyToNumber) : undefined,
      lifeStage: lifeStage ?? undefined,
      authorEmail: authorEmail || undefined,
      helpEmail: needsHelp ? helpEmail || undefined : undefined,
      helpWhatsapp: needsHelp ? helpWhatsapp || undefined : undefined,
      bankType: needsHelp ? bankType || undefined : undefined,
      accountDetails: needsHelp ? accountDetails || undefined : undefined,
      needsHelp,
    })
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    onPosted(result.confession)
  }

  return (
    <div className="screen write-screen">
      <button type="button" className="back-link" onClick={onCancel}>
        {t.write.back}
      </button>

      <header className="write-head">
        <h1 className="section-title">
          {isComeback ? t.write.titleComeback : t.write.titleConfession}
        </h1>
        <p className="section-sub">
          {isComeback ? t.write.subComeback : t.write.subConfession}
        </p>
      </header>

      <div className="kind-toggle" role="tablist" aria-label="Post type">
        <button
          type="button"
          role="tab"
          aria-selected={!isComeback}
          className={`kind-toggle-btn${!isComeback ? ' on' : ''}`}
          onClick={() => setKind('confession')}
        >
          {t.write.kindConfession}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isComeback}
          className={`kind-toggle-btn comeback${isComeback ? ' on' : ''}`}
          onClick={() => setKind('comeback')}
        >
          {t.write.kindComeback}
        </button>
      </div>

      <form className="write-form" onSubmit={(e) => void submit(e)}>
        <section className="write-card">
          {isComeback ? (
            <div className="field">
              <label htmlFor="reply">{t.write.replyLabel}</label>
              <input
                id="reply"
                inputMode="numeric"
                value={replyToNumber}
                onChange={(e) => setReplyToNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="001"
                required
              />
              <p className="hint">{t.write.replyHint}</p>
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="loc">{t.write.fromLabel}</label>
            <input
              id="loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t.write.fromPlaceholder}
              required
              autoComplete="address-level2"
            />
            <p className="hint">{t.write.fromHint}</p>
          </div>

          <div className="field">
            <span className="field-label-text">{t.write.stageLabel}</span>
            <p className="hint" style={{ marginBottom: '0.45rem' }}>
              {t.write.stageHint}
            </p>
            <div className="chip-select">
              {STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip${lifeStage === s ? ' on' : ''}`}
                  onClick={() => pickStage(s)}
                >
                  {t.write.stages[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="body">
              {isComeback ? t.write.bodyLabelComeback : t.write.bodyLabelConfession}
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={bodyPlaceholder}
              required
            />
            <p className="hint char-count">{body.trim().length}</p>
          </div>
        </section>

        <section className="write-card write-optional">
          <button
            type="button"
            className="write-fold"
            aria-expanded={showLink}
            onClick={() => setShowLink((v) => !v)}
          >
            <span>{t.write.linkTitle}</span>
            <span className="fold-hint">{showLink ? t.write.linkHide : t.write.linkShow}</span>
          </button>
          {showLink ? (
            <div className="field fold-body">
              <label htmlFor="authorEmail">{t.write.linkEmail}</label>
              <input
                id="authorEmail"
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <p className="hint">{t.write.linkHint}</p>
            </div>
          ) : null}
        </section>

        <section className="write-card write-optional">
          <label className="write-check">
            <input
              type="checkbox"
              checked={needsHelp}
              onChange={(e) => setNeedsHelp(e.target.checked)}
            />
            <span>
              <strong>{t.write.needSupport}</strong>
              <em>{t.write.needSupportHint}</em>
            </span>
          </label>

          {needsHelp ? (
            <div className="fold-body help-fields">
              <div className="field">
                <label htmlFor="helpEmail">{t.write.helpEmail}</label>
                <input
                  id="helpEmail"
                  type="email"
                  value={helpEmail}
                  onChange={(e) => setHelpEmail(e.target.value)}
                  placeholder={t.write.optional}
                />
              </div>
              <div className="field">
                <label htmlFor="wa">{t.write.helpWa}</label>
                <input
                  id="wa"
                  value={helpWhatsapp}
                  onChange={(e) => setHelpWhatsapp(e.target.value)}
                  placeholder="063…"
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="bankType">{t.write.helpBank}</label>
                  <select id="bankType" value={bankType} onChange={(e) => setBankType(e.target.value)}>
                    <option value="">{t.write.selectBank}</option>
                    {BANK_TYPES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="bank">{t.write.helpAccount}</label>
                  <input
                    id="bank"
                    value={accountDetails}
                    onChange={(e) => setAccountDetails(e.target.value)}
                  />
                </div>
              </div>
              <p className="hint">{t.write.helpDonateHint}</p>
            </div>
          ) : null}
        </section>

        <p className="write-rules">{t.write.rules}</p>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="btn btn-primary write-submit" disabled={busy}>
          {busy
            ? t.write.sending
            : isComeback
              ? t.write.sendComeback
              : t.write.sendConfession}
        </button>
      </form>
    </div>
  )
}
