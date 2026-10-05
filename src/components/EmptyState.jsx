import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

export default function EmptyState({ onRestore }) {
  return (
    <div className="card flex animate-fade-up flex-col items-center px-6 py-16 text-center sm:py-20">
      <div className="relative mb-8">
        <div className="relative h-[164px] w-[84px] rounded-[22px] bg-zinc-900 p-[5px] shadow-card-hover">
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-[17px] bg-zinc-50">
            <span className="absolute left-1/2 top-[11px] h-[8px] w-[26px] -translate-x-1/2 rounded-full bg-zinc-900" />
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-zinc-300 text-zinc-400"><Plus className="h-4 w-4" /></span>
          </div>
        </div>
        <div className="absolute -left-14 top-6 -z-10 h-[132px] w-[68px] -rotate-12 rounded-[18px] border border-zinc-200 bg-white" />
        <div className="absolute -right-14 top-6 -z-10 h-[132px] w-[68px] rotate-12 rounded-[18px] border border-zinc-200 bg-white" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">You haven't created a demo yet.</h2>
      <p className="mt-1.5 max-w-xs text-[15px] leading-relaxed text-zinc-500">Turn your Flutter app into an interactive demo.</p>
      <Link to="/new" className="btn btn-primary btn-md mt-7"><Plus className="h-4 w-4" strokeWidth={2.4} /> New Project</Link>
      {onRestore && <button onClick={onRestore} className="mt-4 text-[13px] text-zinc-400 underline-offset-4 hover:text-zinc-600 hover:underline">Restore sample projects</button>}
    </div>
  )
}
