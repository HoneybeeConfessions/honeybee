export const BANK_TYPES = [
  'Capitec',
  'FNB',
  'Standard Bank',
  'Absa',
  'Nedbank',
  'TymeBank',
  'African Bank',
  'Other',
] as const

export type BankType = (typeof BANK_TYPES)[number]
