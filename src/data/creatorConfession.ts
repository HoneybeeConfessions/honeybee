import type { Confession } from '../types'

export const CREATOR_CONFESSION_ID = 'honeybee-creator-001'

export const DEVELOPER_DONATION = {
  bank: 'Capitec',
  account: '1681108133',
  email: 'thabisoxulu4@gmail.com',
  whatsapp: '27635488295',
  note: 'If Honeybee or The Voices helped you, a thank-you donation keeps the lights on. Optional. Never required.',
}

/** Hardcoded Confession #001 — the creator. Not anonymous. */
export const CREATOR_CONFESSION: Confession = {
  id: CREATOR_CONFESSION_ID,
  number: 1,
  kind: 'confession',
  replyToNumber: null,
  locationRaw: 'Richards Bay',
  locationNorm: 'Richards Bay',
  body: `I grew up being bullied. At school. In my neighbourhood. At church. Everywhere I turned, it felt like I was the scared boy people could pick on. I was afraid of fighting back. I learned to go quiet.

I carry that with me. I’m grown now, and I still struggle to find ease in myself. I’m depressed a lot of the time. I walked a career path, finally made it somewhere — and then the fear hits that AI might take even that. But the deeper thing isn’t the job. It’s the silence I was trained into.

I was raised in an environment where talking about what hurt was hard. So I didn’t. Men are taught not to. This first confession is me saying it anyway: I’m still that boy sometimes. I’m still fighting to stay soft without disappearing. If you’re reading this as a man who never got to speak — this space is for you. Use it.`,
  tags: [],
  lifeStage: null,
  authorKey: null,
  hugCount: 0,
  flagCount: 0,
  status: 'visible',
  needsHelp: true,
  email: 'thabisoxulu4@gmail.com',
  whatsapp: '27635488295',
  accountDetails: 'Capitec\n1681108133',
  bankType: 'Capitec',
  isCreator: true,
  createdAt: '2026-09-16T08:00:00.000Z',
}
