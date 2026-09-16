import type { AwarenessStat } from '../types'

/** Seeded awareness figures — update with cited sources before public launch */
export const SEED_AWARENESS: AwarenessStat[] = [
  {
    id: 'aw-1',
    date: '2024-01-01',
    metric: 'Male share of suicide deaths (SA, approx.)',
    value: 78,
    sourceUrl: 'https://www.statssa.gov.za/',
    note: 'Men account for the large majority of suicide deaths in South Africa. Exact yearly figures vary — check Stats SA / health reports for the latest.',
  },
  {
    id: 'aw-2',
    date: '2024-01-01',
    metric: 'Why we count speaking up',
    value: 1,
    sourceUrl: 'https://www.sadag.org/',
    note: 'Every confession and every comeback is a man choosing not to stay silent. We track platform activity, not a live national death counter.',
  },
]
