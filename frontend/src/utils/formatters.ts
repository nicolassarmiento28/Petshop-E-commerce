export function formatCLP(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string): string {
  // "YYYY-MM-DD" sin hora parsea como UTC y se corre un día en timezones
  // negativos (ej. Chile) — si no trae hora, se arma como fecha local.
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const parsed = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(date)

  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsed)
}
