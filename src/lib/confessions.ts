import { CREATOR_CONFESSION, CREATOR_CONFESSION_ID } from '../data/creatorConfession'
import type { Confession, ConfessionPublic, CreateConfessionInput } from '../types'
import { emailToAuthorKey, isValidEmail, normalizeWhatsapp } from './authorKey'
import { FLAG_THRESHOLD, getDeviceId } from './device'
import { normalizeLocation } from './location'
import { stripIdentity } from './strip'
import { supabase, supabaseConfigured } from './supabase'

const STORE_KEY = 'honeybee_confessions_v1'
const HUGS_KEY = 'honeybee_hugs_v1'

type LocalStore = {
  confessions: Confession[]
  nextNumber: number
}

function normalizeEntry(c: Confession): Confession {
  return {
    ...c,
    kind: c.kind === 'comeback' ? 'comeback' : 'confession',
    replyToNumber: c.kind === 'comeback' && c.replyToNumber ? c.replyToNumber : null,
    lifeStage: c.lifeStage ?? null,
  }
}

function ensureCreator(store: LocalStore): LocalStore {
  store.confessions = (store.confessions ?? []).map(normalizeEntry)
  const existing = store.confessions.find((c) => c.id === CREATOR_CONFESSION_ID || c.number === 1)
  if (!existing) {
    store.confessions = [CREATOR_CONFESSION, ...store.confessions.filter((c) => c.number !== 1)]
  } else {
    store.confessions = store.confessions.map((c) =>
      c.id === CREATOR_CONFESSION_ID || c.number === 1
        ? {
            ...CREATOR_CONFESSION,
            hugCount: c.hugCount,
            flagCount: c.flagCount,
            status: c.status,
          }
        : c,
    )
  }
  store.nextNumber = Math.max(store.nextNumber, 2)
  const maxNum = store.confessions.reduce((m, c) => Math.max(m, c.number), 1)
  store.nextNumber = Math.max(store.nextNumber, maxNum + 1)
  return store
}

function loadLocal(): LocalStore {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) {
      const fresh = ensureCreator({ confessions: [], nextNumber: 2 })
      saveLocal(fresh)
      return fresh
    }
    const parsed = JSON.parse(raw) as LocalStore
    const ensured = ensureCreator({
      confessions: parsed.confessions ?? [],
      nextNumber: parsed.nextNumber ?? 2,
    })
    saveLocal(ensured)
    return ensured
  } catch {
    const fresh = ensureCreator({ confessions: [], nextNumber: 2 })
    saveLocal(fresh)
    return fresh
  }
}

function saveLocal(store: LocalStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

function loadHugSet(): Set<string> {
  try {
    const raw = localStorage.getItem(HUGS_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveHugSet(set: Set<string>) {
  localStorage.setItem(HUGS_KEY, JSON.stringify([...set]))
}

function hugKey(confessionId: string) {
  return `${getDeviceId()}:${confessionId}`
}

function rowToConfession(row: Record<string, unknown>): Confession {
  const kind = row.kind === 'comeback' ? 'comeback' : 'confession'
  return {
    id: String(row.id),
    number: Number(row.number),
    kind,
    replyToNumber: row.reply_to_number != null ? Number(row.reply_to_number) : null,
    locationRaw: String(row.location_raw),
    locationNorm: String(row.location_norm),
    body: String(row.body),
    tags: (row.tags as Confession['tags']) ?? [],
    lifeStage: (row.life_stage as Confession['lifeStage']) ?? null,
    authorKey: row.author_key ? String(row.author_key) : null,
    hugCount: Number(row.hug_count ?? 0),
    flagCount: Number(row.flag_count ?? 0),
    status: (row.status as Confession['status']) ?? 'visible',
    needsHelp: Boolean(row.needs_help),
    email: row.email ? String(row.email) : null,
    whatsapp: row.whatsapp ? String(row.whatsapp) : null,
    accountDetails: row.account_details ? String(row.account_details) : null,
    bankType: row.bank_type ? String(row.bank_type) : null,
    isCreator: Boolean(row.is_creator),
    createdAt: String(row.created_at),
  }
}

export function attribution(
  c: Pick<Confession, 'isCreator' | 'locationNorm'>,
  labels?: { creator: string; anonymousFrom: string },
): string {
  if (c.isCreator) return `${labels?.creator ?? 'The creator'} · ${c.locationNorm}`
  return `${labels?.anonymousFrom ?? 'Anonymous from'} ${c.locationNorm}`
}

export function toPublic(c: Confession): ConfessionPublic {
  const { email: _e, whatsapp: _w, accountDetails: _a, ...rest } = c
  return rest
}

function withCreatorFirst(list: ConfessionPublic[]): ConfessionPublic[] {
  const creator = toPublic(CREATOR_CONFESSION)
  const others = list.filter((c) => c.id !== CREATOR_CONFESSION_ID && c.number !== 1)
  const fromLocal = loadLocal().confessions.find((c) => c.id === CREATOR_CONFESSION_ID)
  const head = fromLocal ? toPublic(fromLocal) : creator
  return [head, ...others].sort((a, b) => {
    if (a.number === 1) return -1
    if (b.number === 1) return 1
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export async function listConfessions(): Promise<ConfessionPublic[]> {
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('confessions')
      .select(
        'id, number, kind, reply_to_number, location_raw, location_norm, body, tags, author_key, hug_count, flag_count, status, needs_help, bank_type, is_creator, created_at',
      )
      .eq('status', 'visible')
      .order('created_at', { ascending: false })
    if (!error && data) {
      const mapped = data.map((row) =>
        toPublic(
          rowToConfession({
            ...row,
            email: null,
            whatsapp: null,
            account_details: null,
          }),
        ),
      )
      return withCreatorFirst(mapped)
    }
  }
  return loadLocal()
    .confessions.filter((c) => c.status === 'visible')
    .sort((a, b) => {
      if (a.number === 1) return -1
      if (b.number === 1) return 1
      return b.createdAt.localeCompare(a.createdAt)
    })
    .map(toPublic)
}

export async function getConfession(id: string): Promise<Confession | null> {
  if (id === CREATOR_CONFESSION_ID) {
    return loadLocal().confessions.find((c) => c.id === CREATOR_CONFESSION_ID) ?? CREATOR_CONFESSION
  }
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase.from('confessions').select('*').eq('id', id).maybeSingle()
    if (!error && data) return rowToConfession(data)
  }
  return loadLocal().confessions.find((c) => c.id === id) ?? null
}

export async function getConfessionByNumber(num: number): Promise<Confession | null> {
  if (num === 1) {
    return loadLocal().confessions.find((c) => c.number === 1) ?? CREATOR_CONFESSION
  }
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase.from('confessions').select('*').eq('number', num).maybeSingle()
    if (!error && data) return rowToConfession(data)
  }
  return loadLocal().confessions.find((c) => c.number === num) ?? null
}

function formatAccount(bankType: string | undefined, accountDetails: string | null): string | null {
  if (!accountDetails) return null
  if (!bankType) return accountDetails
  if (accountDetails.toLowerCase().includes(bankType.toLowerCase())) return accountDetails
  return `${bankType}\n${accountDetails}`
}

export async function createConfession(
  input: CreateConfessionInput,
): Promise<{ confession: Confession } | { error: string }> {
  const locationNorm = normalizeLocation(input.location)
  if (!locationNorm) return { error: 'Add a place — city or town is enough.' }

  const body = stripIdentity(input.body)
  if (!body || body.length < 20) return { error: 'Write a little more (at least a few sentences).' }

  let authorKey: string | null = null
  if (input.authorEmail?.trim()) {
    if (!isValidEmail(input.authorEmail)) return { error: 'That email doesn’t look right.' }
    authorKey = await emailToAuthorKey(input.authorEmail)
  }

  let email: string | null = null
  if (input.helpEmail?.trim()) {
    if (!isValidEmail(input.helpEmail)) return { error: 'Help email doesn’t look right.' }
    email = input.helpEmail.trim().toLowerCase()
  }

  let whatsapp: string | null = null
  if (input.helpWhatsapp?.trim()) {
    whatsapp = normalizeWhatsapp(input.helpWhatsapp)
    if (!whatsapp) return { error: 'WhatsApp number doesn’t look right.' }
  }

  const bankType = input.bankType?.trim() || null
  const accountDetails = formatAccount(bankType ?? undefined, input.accountDetails?.trim() || null)
  const tags = input.tags?.slice(0, 4) ?? []
  const lifeStage = input.lifeStage ?? null
  const needsHelp = Boolean(input.needsHelp || email || whatsapp || accountDetails)
  const kind = input.kind === 'comeback' ? 'comeback' : 'confession'
  let replyToNumber: number | null = null
  if (kind === 'comeback') {
    const n = Number(input.replyToNumber)
    if (!Number.isFinite(n) || n < 1) {
      return { error: 'Comebacks need the number of the confession you’re returning to (e.g. 1).' }
    }
    const target = await getConfessionByNumber(n)
    if (!target || target.status === 'hidden') {
      return { error: `Couldn’t find confession #${String(n).padStart(3, '0')} to link to.` }
    }
    if (target.kind === 'comeback') {
      return { error: 'Link a comeback to an original confession, not another comeback.' }
    }
    replyToNumber = n
  }

  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('confessions')
      .insert({
        location_raw: input.location.trim(),
        location_norm: locationNorm,
        body,
        tags,
        life_stage: lifeStage,
        author_key: authorKey,
        needs_help: needsHelp,
        email,
        whatsapp,
        account_details: accountDetails,
        bank_type: bankType,
        is_creator: false,
        kind,
        reply_to_number: replyToNumber,
      })
      .select('*')
      .single()
    if (error || !data) return { error: error?.message ?? 'Could not save confession.' }
    const confession = rowToConfession(data)
    mirrorLocal(confession)
    return { confession }
  }

  const store = loadLocal()
  const confession: Confession = {
    id: crypto.randomUUID(),
    number: Math.max(store.nextNumber, 2),
    kind,
    replyToNumber,
    locationRaw: input.location.trim(),
    locationNorm,
    body,
    tags,
    lifeStage,
    authorKey,
    hugCount: 0,
    flagCount: 0,
    status: 'visible',
    needsHelp,
    email,
    whatsapp,
    accountDetails,
    bankType,
    isCreator: false,
    createdAt: new Date().toISOString(),
  }
  store.confessions.unshift(confession)
  store.nextNumber = confession.number + 1
  saveLocal(store)
  return { confession }
}

function mirrorLocal(confession: Confession) {
  const store = loadLocal()
  if (store.confessions.some((c) => c.id === confession.id)) return
  store.confessions.unshift(confession)
  store.nextNumber = Math.max(store.nextNumber, confession.number + 1)
  saveLocal(store)
}

export function hasHugged(confessionId: string): boolean {
  return loadHugSet().has(hugKey(confessionId))
}

export async function addHug(confessionId: string): Promise<Confession | null> {
  if (hasHugged(confessionId)) {
    return getConfession(confessionId)
  }

  const set = loadHugSet()
  set.add(hugKey(confessionId))
  saveHugSet(set)

  if (supabaseConfigured && supabase && confessionId !== CREATOR_CONFESSION_ID) {
    await supabase.from('confession_hugs').insert({
      confession_id: confessionId,
      device_id: getDeviceId(),
    })
    const current = await getConfession(confessionId)
    if (current) {
      const next = current.hugCount + 1
      await supabase.from('confessions').update({ hug_count: next }).eq('id', confessionId)
      return { ...current, hugCount: next }
    }
  }

  const store = loadLocal()
  const idx = store.confessions.findIndex((c) => c.id === confessionId)
  if (idx < 0) return null
  store.confessions[idx] = {
    ...store.confessions[idx],
    hugCount: store.confessions[idx].hugCount + 1,
  }
  saveLocal(store)
  return store.confessions[idx]
}

export async function flagConfession(id: string): Promise<Confession | null> {
  if (id === CREATOR_CONFESSION_ID) return getConfession(id)

  const flaggedKey = `honeybee_flagged_${getDeviceId()}`
  const raw = localStorage.getItem(flaggedKey)
  const flagged = new Set(raw ? (JSON.parse(raw) as string[]) : [])
  if (flagged.has(id)) return getConfession(id)
  flagged.add(id)
  localStorage.setItem(flaggedKey, JSON.stringify([...flagged]))

  if (supabaseConfigured && supabase) {
    const current = await getConfession(id)
    if (!current) return null
    const flagCount = current.flagCount + 1
    const status = flagCount >= FLAG_THRESHOLD ? 'hidden' : current.status
    await supabase.from('confessions').update({ flag_count: flagCount, status }).eq('id', id)
    return { ...current, flagCount, status }
  }

  const store = loadLocal()
  const idx = store.confessions.findIndex((c) => c.id === id)
  if (idx < 0) return null
  const flagCount = store.confessions[idx].flagCount + 1
  store.confessions[idx] = {
    ...store.confessions[idx],
    flagCount,
    status: flagCount >= FLAG_THRESHOLD ? 'hidden' : store.confessions[idx].status,
  }
  saveLocal(store)
  return store.confessions[idx]
}

export async function listByAuthorKey(authorKey: string): Promise<ConfessionPublic[]> {
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('confessions')
      .select(
        'id, number, kind, reply_to_number, location_raw, location_norm, body, tags, author_key, hug_count, flag_count, status, needs_help, bank_type, is_creator, created_at',
      )
      .eq('author_key', authorKey)
      .eq('status', 'visible')
      .order('number', { ascending: true })
    if (!error && data) {
      return data.map((row) =>
        toPublic(
          rowToConfession({
            ...row,
            email: null,
            whatsapp: null,
            account_details: null,
          }),
        ),
      )
    }
  }
  return loadLocal()
    .confessions.filter((c) => c.authorKey === authorKey && c.status === 'visible')
    .sort((a, b) => a.number - b.number)
    .map(toPublic)
}

export async function listMoreFromVoice(
  authorKey: string | null,
  excludeId: string,
): Promise<ConfessionPublic[]> {
  if (!authorKey) return []
  const all = await listByAuthorKey(authorKey)
  return all.filter((c) => c.id !== excludeId)
}

export async function listComebacksFor(number: number): Promise<ConfessionPublic[]> {
  const all = await listConfessions()
  return all
    .filter((c) => c.kind === 'comeback' && c.replyToNumber === number)
    .sort((a, b) => a.number - b.number)
}

export async function listComebackPosts(limit = 8): Promise<ConfessionPublic[]> {
  const all = await listConfessions()
  return all.filter((c) => c.kind === 'comeback').slice(0, limit)
}

export function platformStats(confessions: ConfessionPublic[]) {
  const hugs = confessions.reduce((n, c) => n + c.hugCount, 0)
  const needing = confessions.filter((c) => c.needsHelp).length
  const comebacks = confessions.filter((c) => c.kind === 'comeback').length
  const places = new Map<string, number>()
  for (const c of confessions) {
    places.set(c.locationNorm, (places.get(c.locationNorm) ?? 0) + 1)
  }
  const topPlaces = [...places.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  return {
    total: confessions.length,
    hugs,
    needing,
    comebacks,
    topPlaces,
  }
}
