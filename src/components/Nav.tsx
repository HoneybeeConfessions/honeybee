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
    { id: 'callouts', label: t.nav.callouts },
    { id: 'post', label: t.nav.write },
    { id: 'understand', label: t.nav.women },
    { id: 'more', label: t.nav.more },
  ]

  const moreActive =
    screen === 'more' || screen === 'insights' || screen === 'myvoice' || screen === 'about'

  return (
    <nav className="nav" aria-label="Main">
      {items.map((item) => {
        const on =
          item.id === 'more'
            ? moreActive
            : screen === item.id ||
              (screen === 'detail' && item.id === 'home') ||
              (screen === 'calloutDetail' && item.id === 'callouts')
        return (
          <button
            key={item.id}
            type="button"
            className={on ? 'on' : ''}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
