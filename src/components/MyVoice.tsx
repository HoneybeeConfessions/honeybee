import { useState, type FormEvent } from 'react'
import { useI18n } from '../i18n'
import { emailToAuthorKey, isValidEmail } from '../lib/authorKey'
import { addHug, listByAuthorKey } from '../lib/confessions'
import type { ConfessionPublic } from '../types'
import { ConfessionCard } from './ConfessionCard'

const SESSION_KEY = 'honeybee_myvoice_key'

export function MyVoice({ onOpen }: { onOpen: (id: string) => void }) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [items, setItems] = useState<ConfessionPublic[]>([])
  const [error, setError] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [busy, setBusy] = useState(false)

  async function unlock(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!isValidEmail(email)) {
      setError(t.myVoice.badEmail)
      return
    }
    setBusy(true)
    const key = await emailToAuthorKey(email)
    sessionStorage.setItem(SESSION_KEY, key)
    const list = await listByAuthorKey(key)
    setItems(list)
    setUnlocked(true)
    setBusy(false)
  }

  async function refreshList() {
    const key = sessionStorage.getItem(SESSION_KEY)
    if (!key) return
    setItems(await listByAuthorKey(key))
  }

  function lock() {
    sessionStorage.removeItem(SESSION_KEY)
    setUnlocked(false)
    setItems([])
    setEmail('')
  }

  return (
    <div className="screen panel-screen">
      <header className="panel-head">
        <p className="panel-eyebrow">{t.myVoice.eyebrow}</p>
        <h1 className="section-title">{t.myVoice.title}</h1>
        <p className="section-sub">{t.myVoice.lead}</p>
      </header>

      <form className="write-card panel-card voice-form" onSubmit={(e) => void unlock(e)}>
        <div className="field">
          <label htmlFor="mv">{t.myVoice.emailLabel}</label>
          <input
            id="mv"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <p className="hint">{t.myVoice.emailHint}</p>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="voice-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? t.myVoice.looking : unlocked ? t.myVoice.refresh : t.myVoice.find}
          </button>
          {unlocked ? (
            <button type="button" className="btn btn-ghost" onClick={lock}>
              {t.myVoice.clear}
            </button>
          ) : null}
        </div>
      </form>

      {unlocked ? (
        <section className="panel-block">
          <div className="feed-head">
            <div>
              <h2 className="section-title" style={{ fontSize: '1.25rem' }}>
                {t.myVoice.yourPosts}
              </h2>
              <p className="section-sub">
                {items.length === 0
                  ? t.myVoice.noneYet
                  : items.length === 1
                    ? t.myVoice.postCountOne
                    : t.myVoice.postCount.replace('{n}', String(items.length))}
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="empty home-empty">
              <p>{t.myVoice.emptyHint}</p>
            </div>
          ) : (
            <div className="confession-list">
              {items.map((c, i) => (
                <ConfessionCard
                  key={c.id}
                  confession={c}
                  index={i}
                  onOpen={onOpen}
                  onHug={async (cid) => {
                    await addHug(cid)
                    await refreshList()
                  }}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="empty home-empty">
          <p>{t.myVoice.emptyUnlock}</p>
        </div>
      )}
    </div>
  )
}
