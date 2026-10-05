import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Github, RotateCw } from 'lucide-react'
import ProjectCarousel from '../components/ProjectCarousel'
import ProjectCard, { ProjectCardSkeleton } from '../components/ProjectCard'
import EmptyState from '../components/EmptyState'
import { useProjects } from '../hooks/useProjects'
import { useProjectActions } from '../hooks/useProjectActions'
import { isMockApi } from '../lib/api'

export default function ProjectsPage() {
  const { projects, status, refresh, restoreSamples } = useProjects()
  const { actions, modals } = useProjectActions()

  return (
    <div className="container-page pb-24 pt-12 sm:pt-16">
      <header className="mb-10 flex items-end justify-between gap-6">
        <div className="animate-fade-up">
          <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.025em] sm:text-[40px]">My Projects</h1>
          <p className="mt-2 text-[15px] text-zinc-500 sm:text-base">Your Flutter demos, all in one place.</p>
        </div>
        {status === 'ready' && projects.length > 0 && (
          <p className="hidden pb-1 text-sm tabular-nums text-zinc-400 sm:block">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
        )}
      </header>

      {status === 'loading' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading projects">
          {[0, 1, 2].map((i) => <div key={i} className={i > 0 ? (i > 1 ? 'hidden lg:block' : 'hidden sm:block') : ''}><ProjectCardSkeleton /></div>)}
        </div>
      )}

      {status === 'error' && (
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <p className="font-semibold">We couldn't load your projects.</p>
          <p className="mt-1 text-sm text-zinc-500">Check your connection and try again.</p>
          <button className="btn btn-secondary btn-md mt-6" onClick={refresh}><RotateCw className="h-4 w-4" /> Try again</button>
        </div>
      )}

      {status === 'ready' && projects.length === 0 && <EmptyState onRestore={isMockApi ? restoreSamples : undefined} />}

      {status === 'ready' && projects.length > 0 && (
        <div className="animate-fade-up [animation-delay:60ms]">
          <ProjectCarousel label="My Projects">
            {projects.map((p) => <ProjectCard key={p.id} project={p} actions={actions} />)}
          </ProjectCarousel>
          <QuickStart />
        </div>
      )}
      {modals}
    </div>
  )
}

function QuickStart() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); navigate(value.trim() ? `/new?repo=${encodeURIComponent(value.trim())}` : '/new') }}
      className="mx-auto mt-16 flex max-w-2xl flex-col gap-3 rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-3 sm:flex-row sm:items-center sm:p-2 sm:pl-4"
    >
      <Github className="hidden h-[18px] w-[18px] shrink-0 text-zinc-400 sm:block" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste another Flutter repo to create a demo…"
        className="h-10 min-w-0 flex-1 bg-transparent px-1 font-mono text-[13.5px] outline-none placeholder:font-sans placeholder:text-zinc-400"
        aria-label="GitHub repository URL"
        spellCheck={false}
      />
      <button className="btn btn-dark btn-md">Create demo <ArrowRight className="h-4 w-4" /></button>
    </form>
  )
}
