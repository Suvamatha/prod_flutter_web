import { Check, Copy, Link2 } from 'lucide-react'
import { useCopy } from '../hooks/useCopy'
import { stripProtocol } from '../lib/format'

export default function ShareUrl({ url, size = 'md', className = '' }) {
  const { copy, copied } = useCopy()
  const lg = size === 'lg'
  return (
    <div className={`flex items-center gap-2 rounded-xl border border-zinc-200 bg-white ${lg ? 'p-1.5 pl-4' : 'p-1 pl-3'} shadow-card ${className}`}>
      <Link2 className="h-4 w-4 shrink-0 text-zinc-400" />
      <a href={url} target="_blank" rel="noreferrer" className={`min-w-0 flex-1 truncate font-mono ${lg ? 'text-[15px]' : 'text-[13px]'} text-zinc-800 hover:text-brand-700`}>
        {stripProtocol(url)}
      </a>
      <button
        onClick={() => copy(url)}
        className={`btn ${lg ? 'h-10 px-4' : 'h-8 px-3 text-[13px]'} ${copied ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
        aria-label="Copy share link"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
