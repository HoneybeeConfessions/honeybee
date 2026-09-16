/**
 * Estimated male suicide deaths — for awareness counters only.
 * Sources: WHO Suicide worldwide in 2019 (SA males 10,861);
 * global male share approximated from WHO male/female ASR (~70% of ~700k).
 * These are models, not a live death feed. Counter resets each 1 January.
 */

export const SA_MEN_PER_YEAR = 10861
export const GLOBAL_MEN_PER_YEAR = 485_000

export const SA_MEN_PER_DAY = SA_MEN_PER_YEAR / 365.25
export const GLOBAL_MEN_PER_DAY = GLOBAL_MEN_PER_YEAR / 365.25

export const COUNTER_SOURCE_NOTE =
  'Estimates based on WHO-modelled annual figures (not a live registry). Resets every 1 January.'

export function yearStart(d = new Date()): Date {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0)
}

/** Continuous year-to-date estimate from 1 Jan of the current year. */
export function estimateYearToDate(perYear: number, now = new Date()): number {
  const start = yearStart(now)
  const ms = Math.max(0, now.getTime() - start.getTime())
  const days = ms / (24 * 60 * 60 * 1000)
  return days * (perYear / 365.25)
}

export function formatLossCount(n: number): string {
  return Math.floor(n).toLocaleString('en-ZA')
}
