import { useI18n } from '../i18n'
import type { Screen } from '../types'

export function Nav({
  screen,
  onNavigate,
}: {
  screen: Screen
  onNavigate: (s: Screen) => void
}) {
  const { t } = useI18n()
  const items: { id: Screen; label: string }[] = [
    { id: 'home', label: t.nav.home },
    { id: 'post', label: t.nav.write },
    { id: 'understand', label: t.nav.women },
    { id: 'insights', label: t.nav.insights },
    { id: 'myvoice', label: t.nav.myVoice },
  ]

  return (
    <nav className="nav" aria-label="Main">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={screen === item.id || (screen === 'detail' && item.id === 'home') ? 'on' : ''}
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
