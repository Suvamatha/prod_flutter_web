import { getTheme } from '../lib/themes'

/**
 * Static thumbnail artwork, designed on a 240×520 canvas.
 * Used ONLY for card thumbnails and the screen picker — never as the demo.
 * In production these are replaced by build-time screenshots.
 */
export const ART_W = 240
export const ART_H = 520

const img = ([a, b], extra = {}) => ({
  background: `radial-gradient(120% 90% at 20% 15%, rgba(255,255,255,.55), transparent 55%), linear-gradient(135deg, ${a}, ${b})`,
  ...extra,
})
const Line = ({ w, h = 6, c = '#E4E4E7', className = '' }) => (
  <div className={`rounded-full ${className}`} style={{ width: w, height: h, background: c }} />
)

function Home({ t, name }) {
  return (
    <div className="flex h-full flex-col px-4 pt-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] text-zinc-500">{t.greeting}</p>
          <p className="text-[15px] font-semibold leading-tight tracking-tight text-zinc-900">{t.headline}</p>
        </div>
        <div className="h-7 w-7 rounded-full" style={img(t.images[3])} />
      </div>
      <div className="mt-3 flex h-8 items-center gap-2 rounded-xl bg-white px-3 shadow-sm ring-1 ring-black/5">
        <div className="h-2.5 w-2.5 rounded-full border-[1.5px] border-zinc-400" />
        <Line w={90} h={5} />
      </div>
      <div className="relative mt-3 h-[150px] overflow-hidden rounded-2xl" style={img(t.images[0])}>
        <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[8px] font-semibold" style={{ color: t.accent }}>{t.hero.tag}</div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 pt-8">
          <p className="text-[11px] font-semibold text-white">{t.hero.title}</p>
          <p className="text-[8px] text-white/80">{t.hero.meta}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[11px] font-semibold text-zinc-900">Recommended</p>
        <p className="text-[8px] font-medium" style={{ color: t.accent }}>See all</p>
      </div>
      <div className="mt-2 space-y-2">
        {t.items.slice(0, 3).map((it, i) => (
          <div key={it.title} className="flex items-center gap-2.5 rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5">
            <div className="h-9 w-9 shrink-0 rounded-lg" style={img(t.images[(i + 1) % 4])} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9.5px] font-semibold text-zinc-900">{it.title}</p>
              <p className="truncate text-[8px] text-zinc-500">{it.meta}</p>
            </div>
            <p className="text-[8.5px] font-semibold" style={{ color: t.accent }}>{it.tag}</p>
          </div>
        ))}
      </div>
      <Nav t={t} active={0} />
    </div>
  )
}

function Explore({ t }) {
  return (
    <div className="flex h-full flex-col px-4 pt-3">
      <p className="text-[15px] font-semibold tracking-tight text-zinc-900">Explore</p>
      <div className="mt-2 flex gap-1.5">
        {t.chips.map((c, i) => (
          <span key={c} className="rounded-full px-2 py-1 text-[8px] font-medium"
            style={i === 0 ? { background: t.accent, color: '#fff' } : { background: '#fff', color: '#52525B', boxShadow: '0 0 0 1px rgba(0,0,0,.06)' }}>{c}</span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {t.items.map((it, i) => (
          <div key={it.title} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="h-[92px]" style={img(t.images[i % 4])} />
            <div className="p-2">
              <p className="truncate text-[9px] font-semibold text-zinc-900">{it.title}</p>
              <p className="truncate text-[7.5px] text-zinc-500">{it.meta}</p>
              <p className="mt-1 text-[8.5px] font-semibold" style={{ color: t.accent }}>{it.tag}</p>
            </div>
          </div>
        ))}
      </div>
      <Nav t={t} active={1} />
    </div>
  )
}

function Details({ t }) {
  return (
    <div className="flex h-full flex-col">
      <div className="relative h-[210px]" style={img(t.images[0])}>
        <div className="absolute left-3 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px]">‹</div>
        <div className="absolute right-3 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[9px]" style={{ color: t.accent }}>♥</div>
      </div>
      <div className="-mt-4 flex-1 rounded-t-2xl bg-white px-4 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-zinc-900">{t.hero.title}</p>
            <p className="text-[8.5px] text-zinc-500">{t.hero.meta}</p>
          </div>
          <p className="text-[11px] font-semibold" style={{ color: t.accent }}>{t.hero.tag}</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg p-2" style={{ background: t.soft }}>
              <Line w={18} h={5} c={t.accent} />
              <Line w={34} h={4} c="#A1A1AA" className="mt-1.5" />
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] font-semibold text-zinc-900">Overview</p>
        <div className="mt-1.5 space-y-1.5">
          <Line w="100%" h={4} /><Line w="92%" h={4} /><Line w="96%" h={4} /><Line w="60%" h={4} />
        </div>
        <div className="mt-3 flex gap-1.5">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 flex-1 rounded-lg" style={img(t.images[i])} />)}
        </div>
        <div className="mt-4 flex h-9 items-center justify-center rounded-xl text-[10px] font-semibold text-white" style={{ background: t.accent }}>{t.cta}</div>
      </div>
    </div>
  )
}

function Profile({ t }) {
  return (
    <div className="flex h-full flex-col px-4 pt-5">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 rounded-full ring-4 ring-white" style={img(t.images[3])} />
        <p className="mt-2 text-[12px] font-semibold text-zinc-900">{t.greeting.replace(/^(Hi|Good morning|Welcome back|Hungry),?\s*/i, '').replace('?', '') || 'Alex Morgan'}</p>
        <p className="text-[8px] text-zinc-500">Member since 2024</p>
      </div>
      <div className="mt-4 grid grid-cols-3 rounded-xl bg-white py-2.5 text-center shadow-sm ring-1 ring-black/5">
        {['24', '8', '3'].map((n, i) => (
          <div key={i} className={i ? 'border-l border-zinc-100' : ''}>
            <p className="text-[11px] font-semibold text-zinc-900">{n}</p>
            <p className="text-[7.5px] text-zinc-500">{['Saved', 'Visits', 'Plans'][i]}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 divide-y divide-zinc-100 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        {['Notifications', 'Preferences', 'Privacy', 'Help & support'].map((r, i) => (
          <div key={r} className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-md" style={{ background: t.soft }} />
              <p className="text-[9px] text-zinc-800">{r}</p>
            </div>
            {i === 0
              ? <div className="h-3 w-5 rounded-full p-[2px]" style={{ background: t.accent }}><div className="ml-auto h-2 w-2 rounded-full bg-white" /></div>
              : <p className="text-[9px] text-zinc-400">›</p>}
          </div>
        ))}
      </div>
      <Nav t={t} active={3} />
    </div>
  )
}

function Nav({ t, active }) {
  return (
    <div className="-mx-4 mt-auto flex justify-around border-t border-black/5 bg-white/95 px-4 pb-3 pt-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="h-3.5 w-3.5 rounded-[5px]" style={{ background: i === active ? t.accent : '#D4D4D8' }} />
          <div className="h-1 w-5 rounded-full" style={{ background: i === active ? t.accent : '#E4E4E7', opacity: i === active ? 0.6 : 1 }} />
        </div>
      ))}
    </div>
  )
}

const LAYOUTS = { '/': Home, '/explore': Explore, '/details': Details, '/profile': Profile }

export default function PreviewArt({ theme, route = '/', name }) {
  const t = getTheme(theme)
  const Layout = LAYOUTS[route] || Home
  return (
    <div className="h-full w-full font-sans" style={{ width: ART_W, height: ART_H, background: t.surface }}>
      <Layout t={t} name={name} />
    </div>
  )
}
