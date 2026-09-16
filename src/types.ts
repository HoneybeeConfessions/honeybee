export type Screen =
  | 'home'
  | 'post'
  | 'detail'
  | 'myvoice'
  | 'understand'
  | 'insights'
  | 'about'

export type ConfessionTag =
  | 'grief'
  | 'father'
  | 'anger'
  | 'loneliness'
  | 'shame'
  | 'boyhood'
  | 'work'
  | 'relationship'
  | 'addiction'
  | 'hope'

export type LifeStage = 'young' | 'husband' | 'father' | 'provider' | 'elder' | 'tired'

export type ConfessionStatus = 'visible' | 'hidden'

export type ConfessionKind = 'confession' | 'comeback'

export interface Confession {
  id: string
  number: number
  kind: ConfessionKind
  replyToNumber: number | null
  locationRaw: string
  locationNorm: string
  body: string
  tags: ConfessionTag[]
  lifeStage: LifeStage | null
  authorKey: string | null
  hugCount: number
  flagCount: number
  status: ConfessionStatus
  needsHelp: boolean
  email: string | null
  whatsapp: string | null
  accountDetails: string | null
  bankType: string | null
  isCreator?: boolean
  createdAt: string
}

export type ConfessionPublic = Omit<Confession, 'email' | 'whatsapp' | 'accountDetails'>

export interface ConfessionComment {
  id: string
  confessionId: string
  body: string
  deviceId: string
  flagCount: number
  status: ConfessionStatus
  createdAt: string
}

export interface ConfessionUpdate {
  id: string
  confessionId: string
  body: string
  createdAt: string
}

export interface AwarenessStat {
  id: string
  date: string
  metric: string
  value: number
  sourceUrl: string
  note: string
}

export interface CreateConfessionInput {
  location: string
  body: string
  tags?: ConfessionTag[]
  kind?: ConfessionKind
  replyToNumber?: number
  lifeStage?: LifeStage
  authorEmail?: string
  helpEmail?: string
  helpWhatsapp?: string
  accountDetails?: string
  bankType?: string
  needsHelp?: boolean
}
