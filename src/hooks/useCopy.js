import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from './useToast'

export function useCopy() {
  const [copied, setCopied] = useState(false)
  const toast = useToast()
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(async (text, message = 'Link copied') => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text })
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove()
    }
    setCopied(true)
    toast(message)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
  }, [toast])

  return { copy, copied }
}

/** Native share sheet on mobile, copy fallback elsewhere. */
export function useShare() {
  const { copy, copied } = useCopy()
  const share = useCallback(async ({ url, title }) => {
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try { await navigator.share({ url, title }); return } catch (e) { if (e?.name === 'AbortError') return }
    }
    copy(url)
  }, [copy])
  return { share, copied }
}
