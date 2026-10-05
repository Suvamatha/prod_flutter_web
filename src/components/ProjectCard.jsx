import { Link } from 'react-router-dom'
import { ArrowRight, Copy, ExternalLink, Github, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import MiniPhone from './MiniPhone'
import Menu from './Menu'
import StatusBadge from './StatusBadge'
import { getTheme } from '../lib/themes'
import { stripProtocol, timeAgo } from '../lib/format'

export default function ProjectCard({ project, actions }) {
  const t = getTheme(project.theme)
  const rebuilding = actions.isRebuilding(project)
  const href = `/projects/${project.slug}`

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-300/80 hover:shadow-card-hover">
      <Link to={href} className="relative block h-[272px] overflow-hidden" style={{ background: t.tint }} draggable={false} tabIndex={-1} aria-hidden="true">
        <div className="dot-grid absolute inset-0 opacity-60" />
        <div className="absolute left-1/2 top-8 -translate-x-1/2 transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
          <MiniPhone theme={project.theme} route={project.selectedDemo?.route} imageUrl={project.previewImageUrl} liveSrc={project.realBuild ? project.demoUrl : undefined} wireframe={!project.sample && !project.realBuild} label={project.status === 'not_built' ? 'not built yet' : undefined} chrome={project.chrome} width={176} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/70 to-transparent" />
      </Link>

      <div className="flex flex-1 flex-col border-t border-zinc-100 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900">
            <Link to={href} draggable={false} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">{project.name}</Link>
          </h3>
          <div className="relative z-10 -mr-1.5 -mt-1">
            <Menu
              items={[
                { label: 'Open Demo', icon: ExternalLink, onClick: () => actions.open(project) },
                { label: 'Copy Share Link', icon: Copy, onClick: () => actions.copyLink(project) },
                { label: 'Edit Project', icon: Pencil, onClick: () => actions.edit(project) },
                { label: rebuilding ? 'Building…' : project.status === 'not_built' ? 'Build now' : 'Rebuild / Update', icon: RefreshCw, onClick: () => actions.rebuild(project), disabled: rebuilding },
                'divider',
                { label: 'Delete Project', icon: Trash2, danger: true, onClick: () => actions.remove(project) },
              ]}
            />
          </div>
        </div>
        <p className="mt-1 line-clamp-2 min-h-[2.6rem] text-[13px] leading-5 text-zinc-500">{project.description}</p>
        <p className="mt-3 flex items-center gap-1.5 truncate font-mono text-[11.5px] text-zinc-500">
          <Github className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          <span className="truncate">{stripProtocol(project.repositoryUrl)}</span>
        </p>

        <div className="mt-4 flex items-center justify-between text-xs">
          <StatusBadge status={project.status} />
          <span className="text-zinc-400">Updated {timeAgo(project.updatedAt)}</span>
        </div>

        <Link
          to={href}
          draggable={false}
          className="btn btn-secondary btn-md relative z-10 mt-4 w-full justify-between group-hover:border-zinc-300"
        >
          Open Demo
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-card">
      <div className="relative h-[272px] overflow-hidden bg-zinc-100">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      <div className="space-y-3 p-5">
        <div className="h-4 w-1/3 rounded bg-zinc-100" />
        <div className="h-3 w-5/6 rounded bg-zinc-100" />
        <div className="h-3 w-2/3 rounded bg-zinc-100" />
        <div className="mt-6 h-10 rounded-xl bg-zinc-100" />
      </div>
    </div>
  )
}
