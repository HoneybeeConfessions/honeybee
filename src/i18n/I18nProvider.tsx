import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getDict,
  I18nContext,
  loadComfort,
  loadLang,
  saveComfort,
  saveLang,
  type Lang,
} from './index'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => loadLang())
  const [comfort, setComfortState] = useState(() => loadComfort())

  useEffect(() => {
    document.documentElement.lang = lang === 'zu' ? 'zu' : lang === 'st' ? 'st' : 'en'
  }, [lang])

  useEffect(() => {
    document.documentElement.classList.toggle('comfort-reading', comfort)
  }, [comfort])

  const value = useMemo(
    () => ({
      lang,
      t: getDict(lang),
      setLang: (l: Lang) => {
        saveLang(l)
        setLangState(l)
      },
      comfort,
      setComfort: (on: boolean) => {
        saveComfort(on)
        setComfortState(on)
      },
    }),
    [lang, comfort],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
