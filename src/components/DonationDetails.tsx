import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { parseBankDetails } from '../lib/parseBank'

export function DonationDetails({
  bankType,
  accountDetails,
  note,
  showFraud = false,
}: {
  bankType?: string | null
  accountDetails: string
  note?: string
  showFraud?: boolean
}) {
  const { t } = useI18n()
  const { bank, account } = parseBankDetails(bankType, accountDetails)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(id)
  }, [copied])

  async function copyAccount() {
    if (!account) return
    try {
      await navigator.clipboard.writeText(account)
      setCopied(true)
    } catch {
      /* fallback: select via prompt not needed — leave quiet */
    }
  }

  if (!bank && !account) return null

  return (
    <div className="bank-card">
      {showFraud ? <p className="bank-card-fraud">{t.detail.fraud}</p> : null}
      {note ? <p className="bank-card-note">{note}</p> : null}

      <dl className="bank-card-rows">
        {bank ? (
          <div className="bank-row">
            <dt>{t.detail.bank}</dt>
            <dd>
              <span className="bank-value">{bank}</span>
            </dd>
          </div>
        ) : null}
        {account ? (
          <div className="bank-row bank-row-account">
            <dt>{t.about.account}</dt>
            <dd>
              <span className="bank-value bank-account" aria-label={t.about.account}>
                {account}
              </span>
              <button
                type="button"
                className={`bank-copy${copied ? ' on' : ''}`}
                onClick={() => void copyAccount()}
              >
                {copied ? t.detail.copied : t.detail.copy}
              </button>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
