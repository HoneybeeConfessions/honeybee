import { useI18n, type Lang } from '../i18n'

export function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n()
  const langs: Lang[] = ['en', 'zu', 'st']

  return (
    <div className={`lang-switch${compact ? ' compact' : ''}`} role="group" aria-label={t.lang.label}>
      {langs.map((l) => (
        <button
          key={l}
          type="button"
          className={lang === l ? 'on' : ''}
          onClick={() => setLang(l)}
        >
          {l === 'en' ? 'EN' : l === 'zu' ? 'ZU' : 'ST'}
        </button>
      ))}
    </div>
  )
}
