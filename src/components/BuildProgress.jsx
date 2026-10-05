import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'

/**
 * Meaningful step-by-step progress. `current` is the active step index,
 * `done` marks all complete, `errorStep` marks a failed step.
 */
export default function BuildProgress({ steps, current = 0, done = false, errorStep = null, compact = false }) {
  const times = useRef({})
  const [, tick] = useState(0)

  useEffect(() => {
    const now = performance.now()
    if (times.current[current] === undefined) times.current[current] = { start: now }
    for (let i = 0; i < current; i++) {
      if (times.current[i] && !times.current[i].end) times.current[i].end = now
    }
    if (done && times.current[current] && !times.current[current].end) times.current[current].end = now
    tick((n) => n + 1)
  }, [current, done])

  const progress = done ? 100 : Math.round(((current + (errorStep !== null ? 0 : 0.5)) / steps.length) * 100)

  return (
    <div>
      <div className="mb-5 h-1 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${errorStep !== null ? 'bg-red-500' : done ? 'bg-emerald-500' : 'bg-brand-600'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className={compact ? 'space-y-2.5' : 'space-y-3.5'}>
        {steps.map((step, i) => {
          const state = errorStep === i ? 'error' : done || i < current ? 'done' : i === current && errorStep === null ? 'active' : 'pending'
          const t = times.current[i]
          const secs = t?.end ? ((t.end - t.start) / 1000).toFixed(1) : null
          return (
            <li key={step.label} className="flex items-center gap-3">
              <StepIcon state={state} />
              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
                <span className={`text-[14px] transition-colors ${state === 'pending' ? 'text-zinc-400' : state === 'error' ? 'font-medium text-red-600' : 'text-zinc-900'} ${state === 'active' ? 'font-medium' : ''}`}>
                  {step.label}
                  {state === 'active' && <span className="ml-0.5 inline-block w-4 animate-pulse">…</span>}
                </span>
                {!compact && (
                  <span className="hidden shrink-0 font-mono text-[11.5px] text-zinc-400 sm:inline">
                    {state === 'done' && secs ? `${secs}s` : state === 'active' || state === 'error' ? step.detail : ''}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function StepIcon({ state }) {
  if (state === 'done')
    return (
      <span className="flex h-5 w-5 shrink-0 animate-scale-in items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    )
  if (state === 'error')
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
        <X className="h-3 w-3" strokeWidth={3} />
      </span>
    )
  if (state === 'active')
    return (
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-brand-100" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600" />
        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
      </span>
    )
  return <span className="h-5 w-5 shrink-0 rounded-full border-2 border-dashed border-zinc-200" />
}
