const STYLES = {
  live: { dot: 'bg-emerald-500', ring: 'bg-emerald-400', text: 'text-emerald-700', label: 'Live' },
  building: { dot: 'bg-amber-500', ring: 'bg-amber-400', text: 'text-amber-700', label: 'Updating' },
  not_built: { dot: 'bg-zinc-400', ring: 'bg-zinc-300', text: 'text-zinc-500', label: 'Not built' },
  failed: { dot: 'bg-red-500', ring: 'bg-red-400', text: 'text-red-700', label: 'Failed' },
}

export default function StatusBadge({ status = 'live', className = '' }) {
  const s = STYLES[status] || STYLES.live
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.text} ${className}`}>
      <span className="relative flex h-2 w-2">
        {status !== 'failed' && status !== 'not_built' && <span className={`absolute inset-0 animate-ring rounded-full ${s.ring}`} />}
        <span className={`relative h-2 w-2 rounded-full ${s.dot}`} />
      </span>
      {s.label}
    </span>
  )
}
