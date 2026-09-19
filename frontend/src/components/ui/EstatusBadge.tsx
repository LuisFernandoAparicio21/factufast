export function EstatusBadge({ estatus }: { estatus: 'OK' | 'ERROR' }) {
  if (estatus === 'OK') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        Timbrada
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
      Error
    </span>
  )
}
