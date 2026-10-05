import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, description, children, footer, size = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-zinc-950/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full ${size} animate-scale-in rounded-t-2xl bg-white shadow-pop sm:rounded-2xl`}>
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-sm leading-relaxed text-zinc-500">{description}</p>}
          </div>
          <button className="icon-btn -mr-2 -mt-1" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        {children && <div className="px-6 pt-5">{children}</div>}
        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-zinc-100 px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>
      </div>
    </div>,
    document.body,
  )
}
