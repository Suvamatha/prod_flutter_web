import PreviewArt, { ART_W, ART_H } from './PreviewArt'

const LIVE_W = 393

/**
 * Small decorative device used for thumbnails (non-interactive).
 * Content priority: screenshot → live (scaled, non-interactive) real build → wireframe → sample artwork.
 */
export default function MiniPhone({ theme, route, width = 190, imageUrl, liveSrc, wireframe, label, chrome, className = '' }) {
  const dark = chrome?.foreground === 'light'
  const bezel = Math.round(width * 0.035)
  const screenW = width - bezel * 2
  const scale = screenW / ART_W
  const statusH = Math.round(screenW * 0.085)
  const screenH = Math.round(ART_H * scale + statusH)
  const radius = Math.round(width * 0.15)
  const liveScale = screenW / LIVE_W
  const bodyH = screenH - statusH

  let body
  if (imageUrl) body = <img src={imageUrl} alt="" className="w-full object-cover object-top" style={{ height: bodyH }} draggable={false} />
  else if (liveSrc)
    body = (
      <div className="relative overflow-hidden" style={{ height: bodyH }}>
        <iframe
          src={liveSrc}
          title=""
          tabIndex={-1}
          loading="lazy"
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 border-0 bg-white"
          style={{ width: LIVE_W, height: bodyH / liveScale, transform: `scale(${liveScale})`, transformOrigin: 'top left' }}
        />
      </div>
    )
  else if (wireframe) body = <Wireframe label={label} height={bodyH} />
  else
    body = (
      <div style={{ width: ART_W, height: ART_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <PreviewArt theme={theme} route={route} />
      </div>
    )

  return (
    <div
      className={`relative shrink-0 bg-zinc-950 ${className}`}
      style={{ width, height: screenH + bezel * 2, padding: bezel, borderRadius: radius,
        boxShadow: '0 0 0 1px rgba(255,255,255,.08) inset, 0 0 0 1.5px #3f3f46, 0 24px 40px -18px rgba(16,24,40,.45)' }}
      aria-hidden="true"
    >
      <div className="relative h-full w-full overflow-hidden bg-white" style={{ borderRadius: radius - bezel, background: chrome?.background }}>
        <div className={`relative flex items-center justify-between px-[9%] ${dark ? 'text-white' : 'text-zinc-900'}`} style={{ height: statusH, fontSize: statusH * 0.42 }}>
          <span className="font-semibold">9:41</span>
          <span className="absolute left-1/2 top-[22%] -translate-x-1/2 rounded-full bg-zinc-950" style={{ width: screenW * 0.3, height: statusH * 0.56 }} />
          <span className={`block rounded-[1px] ${dark ? 'bg-white' : 'bg-zinc-900'}`} style={{ width: statusH * 0.5, height: statusH * 0.26 }} />
        </div>
        {body}
        <div className={`absolute bottom-[1.2%] left-1/2 h-[3px] w-[34%] -translate-x-1/2 rounded-full ${dark ? 'bg-white/80' : 'bg-zinc-900/80'}`} />
      </div>
    </div>
  )
}

/** Neutral placeholder — used before a real build/screenshot exists. Never pretends to be the app. */
function Wireframe({ label, height }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 bg-zinc-50 px-3 text-center" style={{ height }}>
      <div className="w-full space-y-1.5 px-2 opacity-70">
        <div className="mx-auto h-2 w-1/2 rounded-full bg-zinc-200" />
        <div className="h-10 rounded-lg border border-dashed border-zinc-300" />
        <div className="h-1.5 w-4/5 rounded-full bg-zinc-200" />
        <div className="h-1.5 w-3/5 rounded-full bg-zinc-200" />
      </div>
      {label && <p className="mt-1 truncate font-mono text-[9px] text-zinc-400">{label}</p>}
    </div>
  )
}
