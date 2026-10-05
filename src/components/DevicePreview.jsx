import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Maximize2, Minimize2, Minus, Plus, RotateCw } from 'lucide-react'
import PhoneFrame from './PhoneFrame'
import FlutterDemoFrame from './FlutterDemoFrame'
import { DEVICES, DEFAULT_DEVICE, getDevice } from '../lib/devices'
import { useElementSize } from '../hooks/useElementSize'

const MIN_ZOOM = 0.3
const MAX_ZOOM = 2

/**
 * Stage = toolbar + scaled phone + hosted Flutter app.
 * Scaling uses a CSS transform on the frame; browsers map pointer events
 * through transforms, so the app stays fully interactive at any zoom.
 */
export default function DevicePreview({ src, title, chrome, controls = 'full', className = '', stageClassName = 'h-[min(78vh,880px)] min-h-[520px]' }) {
  const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE.id)
  const [zoom, setZoom] = useState(null) // null = fit to stage
  const [reloadKey, setReloadKey] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const root = useRef(null)
  const stage = useRef(null)
  const size = useElementSize(stage)
  const device = getDevice(deviceId)

  const frameW = device.width + device.bezel * 2
  const frameH = device.height + device.bezel * 2
  const pad = size.width < 480 ? 24 : 56
  const fit = size.width ? Math.min((size.width - pad) / frameW, (size.height - pad) / frameH, 1) : 0
  const scale = zoom ?? Math.max(fit, MIN_ZOOM)
  const pct = Math.round(scale * 100)

  const stepZoom = (dir) => setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round((scale + dir * 0.1) * 10) / 10)))

  const nativeFs = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen
  const toggleFullscreen = useCallback(async () => {
    if (nativeFs) {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await root.current.requestFullscreen().catch(() => setFullscreen(true))
    } else setFullscreen((f) => !f) // iOS Safari: CSS fallback
  }, [nativeFs])

  useEffect(() => {
    const onChange = () => { setFullscreen(document.fullscreenElement === root.current); setZoom(null) }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    if (!fullscreen || nativeFs) return
    const onKey = (e) => e.key === 'Escape' && setFullscreen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fullscreen, nativeFs])

  const cssFs = fullscreen && !nativeFs
  return (
    <div
      ref={root}
      className={`flex flex-col ${fullscreen ? 'bg-zinc-100' : ''} ${cssFs ? 'fixed inset-0 z-[80]' : ''} ${className}`}
    >
      <div className={`flex items-center gap-1 ${controls === 'full' ? 'justify-between' : 'justify-end'} ${fullscreen ? 'p-4' : 'pb-3'}`}>
        {controls === 'full' && (
          <label className="relative flex items-center">
            <span className="sr-only">Device</span>
            <select
              value={deviceId}
              onChange={(e) => { setDeviceId(e.target.value); setZoom(null) }}
              className="h-8 cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 text-[13px] font-medium text-zinc-800 shadow-card outline-none transition hover:border-zinc-300 focus-visible:ring-2 focus-visible:ring-brand-500/50"
            >
              {DEVICES.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-zinc-400" />
          </label>
        )}
        <div className="flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-0.5 shadow-card">
          {controls === 'full' && (
            <>
              <button className="icon-btn h-7 w-7" onClick={() => stepZoom(-1)} disabled={scale <= MIN_ZOOM} aria-label="Zoom out"><Minus className="h-3.5 w-3.5" /></button>
              <button
                className="h-7 min-w-[52px] rounded-md px-1.5 font-mono text-xs tabular-nums text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                onClick={() => setZoom(zoom === null ? 1 : null)}
                title={zoom === null ? 'Fitted to window — click for 100%' : 'Click to fit'}
              >
                {pct}%
              </button>
              <button className="icon-btn h-7 w-7" onClick={() => stepZoom(1)} disabled={scale >= MAX_ZOOM} aria-label="Zoom in"><Plus className="h-3.5 w-3.5" /></button>
              <span className="mx-0.5 h-4 w-px bg-zinc-200" />
            </>
          )}
          <button className="icon-btn h-7 w-7" onClick={() => setReloadKey((k) => k + 1)} aria-label="Restart demo" title="Restart demo"><RotateCw className="h-3.5 w-3.5" /></button>
          <button className="icon-btn h-7 w-7" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} title="Fullscreen">
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div ref={stage} className={`relative flex overflow-auto ${fullscreen ? 'flex-1' : stageClassName}`}>
        <div className="m-auto shrink-0 animate-phone-in" style={{ width: frameW * scale, height: frameH * scale, transition: 'width .25s ease, height .25s ease' }}>
          {size.width > 0 && (
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', transition: 'transform .25s cubic-bezier(.2,.7,.2,1)' }}>
              <PhoneFrame device={device} chrome={chrome}>
                <FlutterDemoFrame src={src} title={title} reloadKey={reloadKey} />
              </PhoneFrame>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
