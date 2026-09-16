import { createContext, useContext } from 'react'
import { en, type Dict, type Lang } from './en'
import { st } from './st'
import { zu } from './zu'

const LANG_KEY = 'honeybee_lang'
const COMFORT_KEY = 'honeybee_comfort'

const dicts: Record<Lang, Dict> = { en, zu, st }

export function getDict(lang: Lang): Dict {
  return dicts[lang] ?? en
}

export function loadLang(): Lang {
  const raw = localStorage.getItem(LANG_KEY)
  if (raw === 'zu' || raw === 'st' || raw === 'en') return raw
  return 'en'
}

export function saveLang(lang: Lang) {
  localStorage.setItem(LANG_KEY, lang)
}

export function loadComfort(): boolean {
  return localStorage.getItem(COMFORT_KEY) === '1'
}

export function saveComfort(on: boolean) {
  localStorage.setItem(COMFORT_KEY, on ? '1' : '0')
}

export const I18nContext = createContext<{
  lang: Lang
  t: Dict
  setLang: (l: Lang) => void
  comfort: boolean
  setComfort: (on: boolean) => void
}>({
  lang: 'en',
  t: en,
  setLang: () => {},
  comfort: false,
  setComfort: () => {},
})

export function useI18n() {
  return useContext(I18nContext)
}

export type { Dict, Lang }
export type { LifeStage } from './en'
export { en, zu, st }
