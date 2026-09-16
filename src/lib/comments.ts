import type { ConfessionComment } from '../types'
import { FLAG_THRESHOLD, getDeviceId } from './device'
import { stripIdentity } from './strip'
import { supabase, supabaseConfigured } from './supabase'

const STORE_KEY = 'honeybee_comments_v1'

function loadLocal(): ConfessionComment[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ConfessionComment[]
  } catch {
    return []
  }
}

function saveLocal(rows: ConfessionComment[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(rows))
}

function rowToComment(row: Record<string, unknown>): ConfessionComment {
  return {
    id: String(row.id),
    confessionId: String(row.confession_id),
    body: String(row.body),
    deviceId: String(row.device_id),
    flagCount: Number(row.flag_count ?? 0),
    status: (row.status as ConfessionComment['status']) ?? 'visible',
    createdAt: String(row.created_at),
  }
}

export async function listComments(confessionId: string): Promise<ConfessionComment[]> {
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('confession_comments')
      .select('*')
      .eq('confession_id', confessionId)
      .eq('status', 'visible')
      .order('created_at', { ascending: true })
    if (!error && data) return data.map(rowToComment)
  }
  return loadLocal()
    .filter((c) => c.confessionId === confessionId && c.status === 'visible')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function addComment(
  confessionId: string,
  bodyRaw: string,
): Promise<{ comment: ConfessionComment } | { error: string }> {
  const body = stripIdentity(bodyRaw, 500)
  if (!body || body.length < 3) return { error: 'Write a short supportive note.' }

  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('confession_comments')
      .insert({
        confession_id: confessionId,
        body,
        device_id: getDeviceId(),
      })
      .select('*')
      .single()
    if (error || !data) return { error: error?.message ?? 'Could not post comment.' }
    return { comment: rowToComment(data) }
  }

  const comment: ConfessionComment = {
    id: crypto.randomUUID(),
    confessionId,
    body,
    deviceId: getDeviceId(),
    flagCount: 0,
    status: 'visible',
    createdAt: new Date().toISOString(),
  }
  const all = loadLocal()
  all.push(comment)
  saveLocal(all)
  return { comment }
}

export async function flagComment(id: string): Promise<void> {
  const key = `honeybee_comment_flagged_${getDeviceId()}`
  const raw = localStorage.getItem(key)
  const set = new Set(raw ? (JSON.parse(raw) as string[]) : [])
  if (set.has(id)) return
  set.add(id)
  localStorage.setItem(key, JSON.stringify([...set]))

  if (supabaseConfigured && supabase) {
    const { data } = await supabase.from('confession_comments').select('*').eq('id', id).maybeSingle()
    if (!data) return
    const flagCount = Number(data.flag_count ?? 0) + 1
    const status = flagCount >= FLAG_THRESHOLD ? 'hidden' : data.status
    await supabase.from('confession_comments').update({ flag_count: flagCount, status }).eq('id', id)
    return
  }

  const all = loadLocal()
  const idx = all.findIndex((c) => c.id === id)
  if (idx < 0) return
  const flagCount = all[idx].flagCount + 1
  all[idx] = {
    ...all[idx],
    flagCount,
    status: flagCount >= FLAG_THRESHOLD ? 'hidden' : all[idx].status,
  }
  saveLocal(all)
}

export async function countAllComments(): Promise<number> {
  if (supabaseConfigured && supabase) {
    const { count } = await supabase
      .from('confession_comments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'visible')
    return count ?? 0
  }
  return loadLocal().filter((c) => c.status === 'visible').length
}
