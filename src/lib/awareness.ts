import { SEED_AWARENESS } from '../data/seed-awareness'
import type { AwarenessStat } from '../types'
import { supabase, supabaseConfigured } from './supabase'

export async function listAwareness(): Promise<AwarenessStat[]> {
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('awareness_stats')
      .select('*')
      .order('date', { ascending: false })
    if (!error && data && data.length > 0) {
      return data.map((row) => ({
        id: String(row.id),
        date: String(row.date),
        metric: String(row.metric),
        value: Number(row.value),
        sourceUrl: String(row.source_url),
        note: String(row.note ?? ''),
      }))
    }
  }
  return SEED_AWARENESS
}
