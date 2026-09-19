export function formatFecha(iso: string, incluirHora = false): string {
  const opts: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(incluirHora ? { hour: '2-digit', minute: '2-digit' } : {}),
  }
  return new Date(iso).toLocaleDateString('es-MX', opts)
}
