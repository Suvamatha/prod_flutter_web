import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertCircle } from 'lucide-react'

const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)
  const toast = useCallback((title, { description, tone = 'success', duration = 2600 } = {}) => {
    const id = ++idRef.current
    setToasts((t) => [...t.slice(-2), { id, title, description, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex flex-col items-center gap-2 px-4" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto flex max-w-sm animate-fade-up items-start gap-2.5 rounded-xl bg-zinc-900 px-4 py-3 text-sm text-white shadow-pop">
              {t.tone === 'error'
                ? <AlertCircle className="mt-px h-4 w-4 shrink-0 text-red-400" />
                : <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-emerald-400" />}
              <div>
                <p className="font-medium">{t.title}</p>
                {t.description && <p className="mt-0.5 text-[13px] text-zinc-400">{t.description}</p>}
              </div>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
