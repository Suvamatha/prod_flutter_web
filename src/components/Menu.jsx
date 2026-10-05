import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal } from 'lucide-react'

/**
 * Dropdown rendered in a portal so it isn't clipped by scroll containers
 * (e.g. the carousel track).
 */
export default function Menu({ items, label = 'Project actions', buttonClassName = 'icon-btn' }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const btn = useRef(null)
  const panel = useRef(null)

  useLayoutEffect(() => {
    if (!open) return
    const r = btn.current.getBoundingClientRect()
    const h = panel.current?.offsetHeight || 220
    const below = r.bottom + 6 + h < window.innerHeight
    setPos({ top: below ? r.bottom + 6 : r.top - h - 6, right: Math.max(8, window.innerWidth - r.right) })
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (e.type === 'keydown' && e.key !== 'Escape') return
      if (e.type === 'pointerdown' && (panel.current?.contains(e.target) || btn.current?.contains(e.target))) return
      setOpen(false)
    }
    const onScroll = () => setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    window.addEventListener('resize', onScroll)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  return (
    <>
      <button
        ref={btn}
        type="button"
        className={buttonClassName}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o) }}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && createPortal(
        <div
          ref={panel}
          role="menu"
          style={{ top: pos?.top ?? -9999, right: pos?.right ?? 0 }}
          className="fixed z-[55] min-w-[200px] animate-scale-in rounded-xl border border-zinc-200/80 bg-white p-1 shadow-pop"
        >
          {items.filter(Boolean).map((item, i) =>
            item === 'divider' ? <div key={i} className="my-1 h-px bg-zinc-100" /> : (
              <button
                key={item.label}
                role="menuitem"
                disabled={item.disabled}
                onClick={(e) => { e.stopPropagation(); setOpen(false); item.onClick() }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors disabled:opacity-40 ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'}`}
              >
                {item.icon && <item.icon className="h-4 w-4 opacity-70" />}
                {item.label}
              </button>
            ),
          )}
        </div>,
        document.body,
      )}
    </>
  )
}
