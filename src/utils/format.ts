const numberFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const dateTimeFormat = new Intl.DateTimeFormat('es-HN', { dateStyle: 'medium', timeStyle: 'short' })

export function formatHnl(amount: number): string {
  return `L ${numberFormat.format(amount)}`
}

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso))
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID()
}

export function formatAmountInput(raw: string): string {
  const clean = raw.replace(/[^\d.]/g, '')
  if (clean === '') return ''
  const dot = clean.indexOf('.')
  const integerDigits = (dot === -1 ? clean : clean.slice(0, dot)).replace(/^0+(?=\d)/, '')
  const grouped = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (dot === -1) return grouped
  const decimals = clean.slice(dot + 1).replace(/\./g, '').slice(0, 2)
  return `${grouped || '0'}.${decimals}`
}

export function unformatAmount(text: string): string {
  return text.replace(/,/g, '')
}

export function formatAmountFixed(text: string): string {
  const value = Number(unformatAmount(text))
  return text === '' || Number.isNaN(value) ? text : numberFormat.format(value)
}
