import { Check } from 'lucide-react'
import MiniPhone from './MiniPhone'
import { getTheme } from '../lib/themes'

export default function ScreenSelector({ theme, screens, value, onChange, chrome }) {
  const t = getTheme(theme)
  const onKeyDown = (e, i) => {
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (!dir) return
    e.preventDefault()
    const next = screens[(i + dir + screens.length) % screens.length]
    onChange(next)
    document.getElementById(`screen-${next.id}`)?.focus()
  }

  return (
    <div role="radiogroup" aria-label="Starting screen" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {screens.map((s, i) => {
        const selected = value?.id === s.id
        return (
          <button
            key={s.id}
            id={`screen-${s.id}`}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(s)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`group relative overflow-hidden rounded-2xl border bg-white text-left transition-all duration-200 ${selected ? 'border-brand-500 shadow-[0_0_0_3px_rgba(26,92,245,.14)]' : 'border-zinc-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-card-hover'}`}
          >
            <div className="relative flex h-[200px] justify-center overflow-hidden pt-5 sm:h-[230px]" style={{ background: t.tint }}>
              <MiniPhone theme={theme} route={s.route} imageUrl={s.previewImageUrl} wireframe={!s.previewImageUrl} label={s.route} chrome={s.previewImageUrl ? chrome : undefined} width={132} className="transition-transform duration-300 group-hover:-translate-y-1" />
            </div>
            <div className="flex items-center justify-between border-t border-zinc-100 px-3.5 py-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-zinc-900">{s.name}</p>
                <p className="truncate font-mono text-[11px] text-zinc-400">{s.route}</p>
              </div>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all ${selected ? 'scale-100 bg-brand-600 text-white' : 'scale-90 border border-zinc-300'}`}>
                {selected && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
