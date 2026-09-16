import type { ConfessionUpdate } from '../types'
import { stripIdentity } from './strip'
import { supabase, supabaseConfigured } from './supabase'

const STORE_KEY = 'honeybee_updates_v1'

function loadLocal(): ConfessionUpdate[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ConfessionUpdate[]
  } catch {
    return []
  }
}

function saveLocal(rows: ConfessionUpdate[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(rows))
}

function rowToUpdate(row: Record<string, unknown>): ConfessionUpdate {
  return {
    id: String(row.id),
    confessionId: String(row.confession_id),
    body: String(row.body),
    createdAt: String(row.created_at),
  }
}

export async function listUpdates(confessionId: string): Promise<ConfessionUpdate[]> {
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('confession_updates')
      .select('*')
      .eq('confession_id', confessionId)
      .order('created_at', { ascending: true })
    if (!error && data) return data.map(rowToUpdate)
  }
  return loadLocal()
    .filter((u) => u.confessionId === confessionId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function addUpdate(
  confessionId: string,
  bodyRaw: string,
): Promise<{ update: ConfessionUpdate } | { error: string }> {
  const body = stripIdentity(bodyRaw, 800)
  if (!body || body.length < 5) return { error: 'Write a short update.' }

  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('confession_updates')
      .insert({ confession_id: confessionId, body })
      .select('*')
      .single()
    if (error || !data) return { error: error?.message ?? 'Could not save update.' }
    return { update: rowToUpdate(data) }
  }

  const update: ConfessionUpdate = {
    id: crypto.randomUUID(),
    confessionId,
    body,
    createdAt: new Date().toISOString(),
  }
  const all = loadLocal()
  all.push(update)
  saveLocal(all)
  return { update }
}

export async function listRecentComebacks(limit = 8): Promise<
  Array<ConfessionUpdate & { confessionNumber?: number }>
> {
  const updates = loadLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit)

  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('confession_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (!error && data) return data.map(rowToUpdate)
  }

  return updates
}

export async function countUpdates(): Promise<number> {
  if (supabaseConfigured && supabase) {
    const { count } = await supabase
      .from('confession_updates')
      .select('*', { count: 'exact', head: true })
    return count ?? 0
  }
  return loadLocal().length
}
