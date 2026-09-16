import type { Callout, CreateCalloutInput } from '../types'
import { emailToAuthorKey, isValidEmail } from './authorKey'
import { FLAG_THRESHOLD, getDeviceId } from './device'
import { normalizeLocation } from './location'
import { stripIdentity } from './strip'
import { supabase, supabaseConfigured } from './supabase'

const STORE_KEY = 'honeybee_callouts_v1'
const SECONDS_KEY = 'honeybee_callout_seconds_v1'

type LocalStore = {
  callouts: Callout[]
  nextNumber: number
}

function loadLocal(): LocalStore {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return { callouts: [], nextNumber: 1 }
    const parsed = JSON.parse(raw) as LocalStore
    const callouts = parsed.callouts ?? []
    const maxNum = callouts.reduce((m, c) => Math.max(m, c.number), 0)
    return {
      callouts,
      nextNumber: Math.max(parsed.nextNumber ?? 1, maxNum + 1),
    }
  } catch {
    return { callouts: [], nextNumber: 1 }
  }
}

function saveLocal(store: LocalStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

function loadSecondSet(): Set<string> {
  try {
    const raw = localStorage.getItem(SECONDS_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveSecondSet(set: Set<string>) {
  localStorage.setItem(SECONDS_KEY, JSON.stringify([...set]))
}

function secondKey(calloutId: string) {
  return `${getDeviceId()}:${calloutId}`
}

function rowToCallout(row: Record<string, unknown>): Callout {
  return {
    id: String(row.id),
    number: Number(row.number),
    body: String(row.body),
    locationRaw: String(row.location_raw ?? ''),
    locationNorm: String(row.location_norm ?? ''),
    authorKey: row.author_key ? String(row.author_key) : null,
    secondCount: Number(row.second_count ?? 0),
    flagCount: Number(row.flag_count ?? 0),
    status: (row.status as Callout['status']) ?? 'visible',
    createdAt: String(row.created_at),
  }
}

function sortCallouts(list: Callout[]): Callout[] {
  return [...list].sort((a, b) => {
    if (b.secondCount !== a.secondCount) return b.secondCount - a.secondCount
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function hasSeconded(calloutId: string): boolean {
  return loadSecondSet().has(secondKey(calloutId))
}

export async function listCallouts(): Promise<Callout[]> {
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('callouts')
      .select(
        'id, number, body, location_raw, location_norm, author_key, second_count, flag_count, status, created_at',
      )
      .eq('status', 'visible')
      .order('second_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(400)
    if (!error && data) {
      return sortCallouts(data.map((r) => rowToCallout(r as Record<string, unknown>)))
    }
  }
  return sortCallouts(loadLocal().callouts.filter((c) => c.status === 'visible'))
}

export async function getCallout(id: string): Promise<Callout | null> {
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase.from('callouts').select('*').eq('id', id).maybeSingle()
    if (!error && data) return rowToCallout(data as Record<string, unknown>)
  }
  return loadLocal().callouts.find((c) => c.id === id) ?? null
}

export async function createCallout(
  input: CreateCalloutInput,
): Promise<{ callout: Callout } | { error: string }> {
  const locationRaw = input.location.trim()
  const locationNorm = normalizeLocation(locationRaw)
  const body = stripIdentity(input.body, 900)
  if (!locationNorm) return { error: 'Add where you are speaking from.' }
  if (!body || body.length < 12) return { error: 'Say a little more about the pattern.' }

  let authorKey: string | null = null
  if (input.authorEmail?.trim()) {
    if (!isValidEmail(input.authorEmail)) return { error: 'That email does not look right.' }
    authorKey = await emailToAuthorKey(input.authorEmail.trim().toLowerCase())
  }

  const store = loadLocal()
  const number = store.nextNumber
  const id = crypto.randomUUID()
  const callout: Callout = {
    id,
    number,
    body,
    locationRaw,
    locationNorm,
    authorKey,
    secondCount: 0,
    flagCount: 0,
    status: 'visible',
    createdAt: new Date().toISOString(),
  }

  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('callouts')
      .insert({
        id,
        number,
        body,
        location_raw: locationRaw,
        location_norm: locationNorm,
        author_key: authorKey,
        second_count: 0,
        flag_count: 0,
        status: 'visible',
        created_at: callout.createdAt,
      })
      .select('*')
      .maybeSingle()
    if (error) {
      console.warn('callout insert failed', error.message)
      // fall through to local
    } else if (data) {
      const live = rowToCallout(data as Record<string, unknown>)
      store.callouts = [live, ...store.callouts.filter((c) => c.id !== live.id)]
      store.nextNumber = Math.max(store.nextNumber, live.number + 1)
      saveLocal(store)
      return { callout: live }
    }
  }

  store.callouts = [callout, ...store.callouts]
  store.nextNumber = number + 1
  saveLocal(store)
  return { callout }
}

export async function addSecond(calloutId: string): Promise<Callout | null> {
  const set = loadSecondSet()
  const key = secondKey(calloutId)
  if (set.has(key)) {
    return getCallout(calloutId)
  }
  set.add(key)
  saveSecondSet(set)

  if (supabaseConfigured && supabase) {
    await supabase.from('callout_seconds').insert({
      callout_id: calloutId,
      device_id: getDeviceId(),
    })
    const current = await getCallout(calloutId)
    if (current) {
      const next = current.secondCount + 1
      await supabase.from('callouts').update({ second_count: next }).eq('id', calloutId)
      const store = loadLocal()
      store.callouts = store.callouts.map((c) =>
        c.id === calloutId ? { ...c, secondCount: next } : c,
      )
      saveLocal(store)
      return { ...current, secondCount: next }
    }
  }

  const store = loadLocal()
  const idx = store.callouts.findIndex((c) => c.id === calloutId)
  if (idx < 0) return null
  store.callouts[idx] = {
    ...store.callouts[idx],
    secondCount: store.callouts[idx].secondCount + 1,
  }
  saveLocal(store)
  return store.callouts[idx]
}

export async function flagCallout(id: string): Promise<Callout | null> {
  const flaggedKey = 'honeybee_callout_flags_v1'
  const raw = localStorage.getItem(flaggedKey)
  const flagged = new Set<string>(raw ? (JSON.parse(raw) as string[]) : [])
  if (flagged.has(id)) return getCallout(id)
  flagged.add(id)
  localStorage.setItem(flaggedKey, JSON.stringify([...flagged]))

  if (supabaseConfigured && supabase) {
    const current = await getCallout(id)
    if (!current) return null
    const flagCount = current.flagCount + 1
    const status = flagCount >= FLAG_THRESHOLD ? 'hidden' : current.status
    await supabase.from('callouts').update({ flag_count: flagCount, status }).eq('id', id)
    return { ...current, flagCount, status }
  }

  const store = loadLocal()
  const idx = store.callouts.findIndex((c) => c.id === id)
  if (idx < 0) return null
  const flagCount = store.callouts[idx].flagCount + 1
  store.callouts[idx] = {
    ...store.callouts[idx],
    flagCount,
    status: flagCount >= FLAG_THRESHOLD ? 'hidden' : store.callouts[idx].status,
  }
  saveLocal(store)
  return store.callouts[idx]
}
