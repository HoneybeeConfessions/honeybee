import { useI18n } from '../i18n'
import type { Screen } from '../types'

export function MoreScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { t } = useI18n()

  const links: { id: Screen; label: string }[] = [
    { id: 'insights', label: t.more.insights },
    { id: 'myvoice', label: t.more.myVoice },
    { id: 'about', label: t.more.about },
  ]

  return (
    <div className="screen panel-screen">
      <header className="panel-head">
        <h1 className="section-title">{t.more.title}</h1>
        <p className="section-sub">{t.more.sub}</p>
      </header>
      <div className="more-list">
        {links.map((l) => (
          <button
            key={l.id}
            type="button"
            className="more-link"
            onClick={() => onNavigate(l.id)}
          >
            {l.label}
            <span aria-hidden>→</span>
          </button>
        ))}
      </div>
    </div>
  )
}
