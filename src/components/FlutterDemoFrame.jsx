import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'

const LOAD_TIMEOUT_MS = 25000

/**
 * Embeds the hosted Flutter Web build (output of `flutter build web`).
 * This is a real browsing context: taps, scrolling, gestures, keyboard input
 * and dialogs all go straight to the Flutter app. Nothing overlays it once
 * loaded. In production, demos are served from an isolated origin
 * (e.g. demos.fluttershow.dev), which is what makes allow-same-origin safe.
 */
export default function FlutterDemoFrame({ src, title, reloadKey = 0, onStateChange }) {
  const [state, setState] = useState('loading') // loading | ready | error
  const [attempt, setAttempt] = useState(0)
  const timer = useRef()

  useEffect(() => {
    setState('loading')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState((s) => (s === 'loading' ? 'error' : s)), LOAD_TIMEOUT_MS)
    return () => clearTimeout(timer.current)
  }, [src, reloadKey, attempt])

  useEffect(() => { onStateChange?.(state) }, [state, onStateChange])

  if (!src) return <FrameMessage title="Not built yet" body="Use Build now / Rebuild to compile this repository with flutter build web." />

  return (
    <div className="absolute inset-0">
      {state !== 'error' && (
        <iframe
          key={`${src}-${reloadKey}-${attempt}`}
          src={src}
          title={title ? `${title} — interactive Flutter demo` : 'Interactive Flutter demo'}
          className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${state === 'ready' ? 'opacity-100' : 'opacity-0'}`}
          allow="clipboard-read; clipboard-write; fullscreen; autoplay; camera; microphone; geolocation; accelerometer; gyroscope"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads"
          referrerPolicy="no-referrer"
          onLoad={() => { clearTimeout(timer.current); setState('ready') }}
        />
      )}

      {state === 'loading' && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white">
          <div className="relative h-10 w-10">
            <span className="absolute inset-0 animate-ring rounded-full bg-brand-400/40" />
            <svg viewBox="0 0 32 32" className="relative h-10 w-10"><path d="M18.5 7 9 16.5l3 3L24.5 7z" fill="#3379FF" /><path d="M18.5 15 13.5 20l5 5h6l-5-5 5-5z" fill="#173CB6" /></svg>
          </div>
          <p className="text-sm text-zinc-400">Starting Flutter app…</p>
        </div>
      )}

      {state === 'error' && (
        <FrameMessage
          icon
          title="Demo didn't respond"
          body="The hosted build took too long to load."
          action={<button className="btn btn-secondary btn-sm mt-4" onClick={() => setAttempt((a) => a + 1)}><RotateCw className="h-3.5 w-3.5" /> Try again</button>}
        />
      )}
    </div>
  )
}

function FrameMessage({ icon, title, body, action }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 px-10 text-center">
      {icon && <AlertTriangle className="mb-3 h-6 w-6 text-amber-500" />}
      <p className="text-[15px] font-semibold text-zinc-900">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{body}</p>
      {action}
    </div>
  )
}
