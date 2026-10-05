import { Children, useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Horizontal carousel built on native scroll-snap (touch/trackpad swipe for
 * free) plus mouse-drag, arrow buttons, keyboard and pagination dots.
 * Desktop 3 (4 on very wide screens), tablet 2, mobile 1 card.
 */
export default function ProjectCarousel({ children, label = 'Projects' }) {
  const track = useRef(null)
  const drag = useRef(null)
  const snapTimer = useRef()
  const [state, setState] = useState({ page: 0, pages: 1, canPrev: false, canNext: false })
  const [dragging, setDragging] = useState(false)
  const count = Children.count(children)

  const metrics = useCallback(() => {
    const el = track.current
    const first = el?.children[0]
    if (!first) return null
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    const step = first.getBoundingClientRect().width + gap
    const perView = Math.max(1, Math.round((el.clientWidth + gap) / step))
    const max = el.scrollWidth - el.clientWidth
    return { el, step, perView, max, pages: Math.max(1, Math.ceil(el.children.length / perView)) }
  }, [])

  const update = useCallback(() => {
    const m = metrics()
    if (!m) return
    const { el, step, perView, max, pages } = m
    const page = el.scrollLeft >= max - 4 ? pages - 1 : Math.round(el.scrollLeft / (step * perView))
    setState((s) => {
      const next = { page: Math.min(page, pages - 1), pages, canPrev: el.scrollLeft > 4, canNext: el.scrollLeft < max - 4 }
      return s.page === next.page && s.pages === next.pages && s.canPrev === next.canPrev && s.canNext === next.canNext ? s : next
    })
  }, [metrics])

  useEffect(() => {
    update()
    const el = track.current
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [update, count])

  const goToPage = (p) => {
    const m = metrics()
    if (!m) return
    m.el.scrollTo({ left: Math.min(p * m.perView * m.step, m.max), behavior: 'smooth' })
  }
  const nudge = (dir) => {
    const m = metrics()
    if (!m) return
    m.el.scrollBy({ left: dir * m.step * m.perView, behavior: 'smooth' })
  }

  // ---- Mouse drag (touch & pen use native scrolling) ----
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const el = track.current
    drag.current = { x: e.clientX, left: el.scrollLeft, moved: false, id: e.pointerId }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true
      setDragging(true)
      clearTimeout(snapTimer.current)
      track.current.style.scrollSnapType = 'none'
      track.current.setPointerCapture(d.id)
    }
    if (d.moved) track.current.scrollLeft = d.left - dx
  }
  const endDrag = (e) => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    const m = metrics()
    const dx = e.clientX - d.x
    const raw = m.el.scrollLeft / m.step
    const index = dx < -40 ? Math.ceil(raw) : dx > 40 ? Math.floor(raw) : Math.round(raw)
    m.el.scrollTo({ left: Math.min(Math.max(index * m.step, 0), m.max), behavior: 'smooth' })
    snapTimer.current = setTimeout(() => { if (track.current) track.current.style.scrollSnapType = '' }, 450)
    // Swallow the click that follows a drag so cards don't open.
    requestAnimationFrame(() => setDragging(false))
  }
  const onClickCapture = (e) => { if (dragging) { e.preventDefault(); e.stopPropagation() } }

  const onKeyDown = (e) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1) }
  }

  const arrow = 'absolute top-[136px] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-zinc-700 shadow-pop backdrop-blur transition-all duration-200 hover:scale-105 hover:text-zinc-950 md:flex'

  return (
    <section aria-roledescription="carousel" aria-label={label} className="relative">
      <button className={`${arrow} -left-5 ${state.canPrev ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => nudge(-1)} aria-label="Previous projects">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button className={`${arrow} -right-5 ${state.canNext ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => nudge(1)} aria-label="Next projects">
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={track}
        tabIndex={0}
        onScroll={update}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className={`no-scrollbar -mx-2 -my-6 flex snap-x snap-mandatory scroll-px-2 gap-6 overflow-x-auto overscroll-x-contain px-2 py-6 focus-visible:ring-0 ${dragging ? 'cursor-grabbing select-none' : 'md:cursor-grab'}`}
      >
        {Children.map(children, (child, i) => (
          <div
            className="shrink-0 snap-start basis-[86%] sm:basis-[calc((100%_-_1.5rem)/2)] lg:basis-[calc((100%_-_3rem)/3)] 2xl:basis-[calc((100%_-_4.5rem)/4)]"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            {child}
          </div>
        ))}
      </div>

      {state.pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2" role="tablist" aria-label="Carousel pages">
          {Array.from({ length: state.pages }, (_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === state.page}
              aria-label={`Page ${i + 1}`}
              onClick={() => goToPage(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === state.page ? 'w-6 bg-zinc-900' : 'w-1.5 bg-zinc-300 hover:bg-zinc-400'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
