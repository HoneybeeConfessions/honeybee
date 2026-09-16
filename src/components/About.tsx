import { useState } from 'react'
import { DEVELOPER_DONATION } from '../data/creatorConfession'
import { useI18n } from '../i18n'
import { DonationDetails } from './DonationDetails'
import { LangSwitcher } from './LangSwitcher'

export function About({ onBack }: { onBack: () => void }) {
  const { t, comfort, setComfort } = useI18n()
  const [showDonate, setShowDonate] = useState(false)

  return (
    <div className="screen panel-screen">
      <button type="button" className="back-link" onClick={onBack}>
        {t.about.back}
      </button>
      <header className="panel-head">
        <h1 className="section-title">{t.about.title}</h1>
        <div className="about-tools">
          <LangSwitcher />
          <button
            type="button"
            className={`chip comfort-chip${comfort ? ' on' : ''}`}
            onClick={() => setComfort(!comfort)}
          >
            {comfort ? t.comfort.on : t.comfort.off}
          </button>
        </div>
      </header>

      <section className="write-card panel-card">
        {t.about.body.map((p) => (
          <p key={p.slice(0, 32)} className="panel-copy">
            {p}
          </p>
        ))}
        <p className="panel-copy">
          {t.about.sister}{' '}
          <a href="https://thevoisees.github.io/the-voices/" target="_blank" rel="noreferrer">
            {t.about.openVoices}
          </a>
          .
        </p>
      </section>

      <div className="help-panel">
        <h3>{t.about.thankTitle}</h3>
        <p style={{ margin: '0 0 0.75rem', color: 'var(--muted)', fontSize: '0.92rem' }}>
          {t.about.thankNote}
        </p>
        <div className="help-actions">
          <a
            className="btn btn-soft"
            href={`mailto:${DEVELOPER_DONATION.email}?subject=${encodeURIComponent('Honeybee')}`}
          >
            {t.about.email}
          </a>
          <a
            className="btn btn-soft"
            href={`https://wa.me/${DEVELOPER_DONATION.whatsapp}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <button type="button" className="btn btn-ghost" onClick={() => setShowDonate((v) => !v)}>
            {showDonate ? t.about.hideDonation : t.about.donationDetails}
          </button>
        </div>
        {showDonate ? (
          <DonationDetails
            bankType={DEVELOPER_DONATION.bank}
            accountDetails={DEVELOPER_DONATION.account}
            note={t.about.donationOptional}
          />
        ) : null}
      </div>
    </div>
  )
}
