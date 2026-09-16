/** Split stored bank fields into display bank name + account number. */
export function parseBankDetails(
  bankType: string | null | undefined,
  accountDetails: string | null | undefined,
): { bank: string; account: string } {
  const raw = (accountDetails ?? '').trim()
  const type = (bankType ?? '').trim()
  if (!raw && !type) return { bank: '', account: '' }

  const lines = raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)

  let bank = type
  let account = ''

  const digitish = (s: string) => {
    const digits = s.replace(/\D/g, '')
    return digits.length >= 6 ? digits : ''
  }

  for (const line of lines) {
    const asDigits = digitish(line)
    if (asDigits) {
      account = asDigits
      continue
    }
    if (!bank) bank = line
  }

  if (!account && lines.length) {
    const last = lines[lines.length - 1]
    account = digitish(last) || last.replace(/^[^0-9]*/i, '').trim() || last
    if (!bank && lines.length > 1 && lines[0] !== last) bank = lines[0]
  }

  if (bank && account.toLowerCase().startsWith(bank.toLowerCase())) {
    account = account.slice(bank.length).replace(/^[\s:\-–—]+/, '')
    account = digitish(account) || account
  }

  return { bank, account: account.trim() }
}
