/** Normalize place names to consistent Title Case */

export function normalizeLocation(input: string): string {
  const cleaned = input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s'-]/gu, '')
  if (!cleaned) return ''

  return cleaned
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (!word) return word
      const parts = word.split('-').map((p) => {
        if (!p) return p
        if (p === "of" || p === "the" || p === "and" || p === "van" || p === "de") {
          return p
        }
        return p.charAt(0).toUpperCase() + p.slice(1)
      })
      return parts.join('-')
    })
    .join(' ')
    .replace(/^(Of|The|And|Van|De)\s/, (m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase())
}
