/** Hash email for anonymous author linking — never store raw email as authorKey */

export async function emailToAuthorKey(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase()
  const data = new TextEncoder().encode(`honeybee:${normalized}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function normalizeWhatsapp(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  if (digits.length < 9) return null
  if (digits.startsWith('27')) return digits
  if (digits.startsWith('0')) return `27${digits.slice(1)}`
  return digits
}
