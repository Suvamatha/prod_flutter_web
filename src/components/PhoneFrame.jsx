import { Signal, Wifi } from 'lucide-react'

/**
 * Realistic device chrome at native CSS-pixel size. The status bar and home
 * indicator are drawn in their own safe-area strips, so `children` (the hosted
 * Flutter app) gets an unobstructed rectangle and receives every tap directly.
 */
export default function PhoneFrame({ device, chrome = {}, children }) {
  const { width, height, radius, bezel, statusBar, homeIndicator, cutout, os } = device
  const bg = chrome.background || '#FFFFFF'
  const fg = chrome.foreground === 'light' ? '#FFFFFF' : '#0A0A0B'
  const outerR = radius + bezel

  return (
    <div className="relative" style={{ width: width + bezel * 2, height: height + bezel * 2 }}>
      {/* Hardware buttons */}
      {os === 'ios' ? (
        <>
          <Btn side="left" top={170} h={30} />
          <Btn side="left" top={225} h={58} />
          <Btn side="left" top={295} h={58} />
          <Btn side="right" top={250} h={92} />
        </>
      ) : (
        <>
          <Btn side="right" top={190} h={56} />
          <Btn side="right" top={275} h={96} />
        </>
      )}

      {/* Body */}
      <div
        className="absolute inset-0 shadow-phone"
        style={{
          borderRadius: outerR,
          background: 'linear-gradient(145deg,#3a3a3f 0%,#1b1b1e 30%,#0c0c0e 70%,#2a2a2e 100%)',
          padding: bezel,
          boxShadow: '0 0 0 1px rgba(255,255,255,.06) inset, 0 0 0 2px #0b0b0c, 0 50px 100px -30px rgba(16,24,40,.45), 0 30px 60px -40px rgba(16,24,40,.5)',
        }}
      >
        <div className="absolute inset-[3px]" style={{ borderRadius: outerR - 3, boxShadow: '0 0 0 1px rgba(255,255,255,.08) inset' }} />

        {/* Screen */}
        <div className="relative flex h-full w-full flex-col overflow-hidden" style={{ borderRadius: radius, background: bg }}>
          <div
            className="pointer-events-none relative z-10 flex shrink-0 select-none items-center justify-between font-semibold"
            style={{ height: statusBar, color: fg, padding: os === 'ios' ? '0 34px 0 44px' : '0 22px', fontSize: os === 'ios' ? 16 : 13 }}
            aria-hidden="true"
          >
            <span style={{ letterSpacing: '-0.01em', paddingTop: os === 'ios' ? 4 : 0 }}>9:41</span>
            {cutout === 'island'
              ? <span className="absolute left-1/2 top-[11px] h-[35px] w-[124px] -translate-x-1/2 rounded-full bg-black" />
              : <span className="absolute left-1/2 top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black ring-2 ring-zinc-800/40" />}
            <span className="flex items-center gap-[5px]" style={{ paddingTop: os === 'ios' ? 4 : 0 }}>
              <Signal className="h-[15px] w-[15px]" strokeWidth={2.6} />
              <Wifi className="h-[15px] w-[15px]" strokeWidth={2.6} />
              <Battery color={fg} />
            </span>
          </div>

          <div className="relative min-h-0 flex-1">{children}</div>

          <div className="pointer-events-none relative z-10 flex shrink-0 items-center justify-center" style={{ height: homeIndicator }} aria-hidden="true">
            <span className="h-[5px] rounded-full" style={{ width: os === 'ios' ? 134 : 108, background: fg, opacity: 0.85 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Btn({ side, top, h }) {
  return (
    <span
      className="absolute w-[4px] bg-gradient-to-b from-zinc-600 via-zinc-800 to-zinc-600"
      style={{ top, height: h, [side]: -3, borderRadius: side === 'left' ? '3px 0 0 3px' : '0 3px 3px 0' }}
    />
  )
}

function Battery({ color }) {
  return (
    <svg width="26" height="13" viewBox="0 0 26 13" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke={color} strokeOpacity=".4" />
      <rect x="2" y="2" width="17" height="9" rx="2" fill={color} />
      <path d="M24 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill={color} fillOpacity=".45" />
    </svg>
  )
}
