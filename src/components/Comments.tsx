import { useEffect, useState, type FormEvent } from 'react'
import { useI18n } from '../i18n'
import { addComment, flagComment, listComments } from '../lib/comments'
import type { ConfessionComment } from '../types'

export function Comments({ confessionId }: { confessionId: string }) {
  const { t } = useI18n()
  const [items, setItems] = useState<ConfessionComment[]>([])
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function refresh() {
    setItems(await listComments(confessionId))
  }

  useEffect(() => {
    void refresh()
  }, [confessionId])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const result = await addComment(confessionId, text)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setText('')
    await refresh()
  }

  return (
    <section>
      <h3 className="section-title" style={{ fontSize: '1.25rem' }}>
        {t.comments.title}
      </h3>
      <p className="section-sub">{t.comments.sub}</p>

      <div className="comment-list">
        {items.length === 0 ? (
          <p className="empty" style={{ padding: '0.5rem 0' }}>
            {t.comments.empty}
          </p>
        ) : (
          items.map((c) => (
            <div key={c.id} className="comment">
              <div className="comment-meta">
                {t.comments.anonymous} · {new Date(c.createdAt).toLocaleString()}
                <button
                  type="button"
                  className="back-link"
                  style={{ marginLeft: '0.75rem', marginBottom: 0 }}
                  onClick={() => void flagComment(c.id).then(refresh)}
                >
                  {t.comments.report}
                </button>
              </div>
              <div>{c.body}</div>
            </div>
          ))
        )}
      </div>

      <form className="form-stack" onSubmit={(e) => void submit(e)}>
        <div className="field">
          <label htmlFor="cmt">{t.comments.leave}</label>
          <textarea
            id="cmt"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.comments.placeholder}
            style={{ minHeight: '4.5rem' }}
          />
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit" className="btn btn-soft" disabled={busy}>
          {busy ? t.comments.posting : t.comments.post}
        </button>
      </form>
    </section>
  )
}
