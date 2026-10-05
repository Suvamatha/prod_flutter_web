import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, ExternalLink, GitBranch, GitCommitHorizontal, Github, Pencil, RefreshCw, Share, Trash2 } from 'lucide-react'
import DevicePreview from '../components/DevicePreview'
import ShareUrl from '../components/ShareUrl'
import StatusBadge from '../components/StatusBadge'
import BuildProgress from '../components/BuildProgress'
import Menu from '../components/Menu'
import { useProjects } from '../hooks/useProjects'
import { useProjectActions } from '../hooks/useProjectActions'
import { useCopy, useShare } from '../hooks/useCopy'
import { REBUILD_STEPS } from '../lib/api'
import { resolveDemoSrc, sharePath } from '../lib/demo'
import { getTheme } from '../lib/themes'
import { formatDate, stripProtocol, timeAgo } from '../lib/format'

/**
 * Opens a saved project. This page only READS the project — the hosted build
 * already exists, so nothing is rebuilt unless the user explicitly asks.
 */
export default function ProjectDetailPage() {
  const { slug } = useParams()
  const { projects, status, rebuilds } = useProjects()
  const { actions, modals } = useProjectActions()
  const { share } = useShare()
  const { copy, copied } = useCopy()
  const project = projects.find((p) => p.slug === slug)

  if (status === 'loading') return <DetailSkeleton />
  if (!project) return <Missing />

  const t = getTheme(project.theme)
  const rebuildStep = rebuilds[project.id]
  const rebuilding = rebuildStep !== undefined
  const embedUrl = `${window.location.origin}/embed/${project.demoId}`
  const embedCode = `<iframe src="${embedUrl}" width="420" height="860" loading="lazy" allow="fullscreen" style="border:0;border-radius:24px;overflow:hidden"></iframe>`

  return (
    <div className="container-page pb-20 pt-6 sm:pt-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900"><ArrowLeft className="h-4 w-4" /> My Projects</Link>

      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 animate-fade-up">
          <div className="flex items-center gap-3">
            <h1 className="truncate text-[30px] font-semibold leading-tight tracking-[-0.025em] sm:text-[36px]">{project.name}</h1>
            <StatusBadge status={project.status} className="mt-1.5 rounded-full border border-zinc-200 bg-white px-2 py-0.5" />
          </div>
          <p className="mt-1.5 max-w-xl text-[15px] text-zinc-500">{project.description}</p>
          <a href={project.repositoryUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 font-mono text-[12.5px] text-zinc-500 transition hover:text-zinc-900">
            <Github className="h-3.5 w-3.5" /> {stripProtocol(project.repositoryUrl)}
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Menu
            buttonClassName="icon-btn h-10 w-10 border border-zinc-200 bg-white shadow-card"
            items={[
              { label: 'Edit Project', icon: Pencil, onClick: () => actions.edit(project) },
              { label: rebuilding ? 'Building…' : project.status === 'not_built' ? 'Build now' : 'Rebuild / Update', icon: RefreshCw, onClick: () => actions.rebuild(project), disabled: rebuilding },
              { label: 'Copy Share Link', icon: Copy, onClick: () => actions.copyLink(project) },
              { label: 'Open public page', icon: ExternalLink, onClick: () => window.open(sharePath(project.demoId), '_blank') },
              'divider',
              { label: 'Delete Project', icon: Trash2, danger: true, onClick: () => actions.remove(project) },
            ]}
          />
          <button className="btn btn-primary btn-md flex-1 sm:flex-none" onClick={() => share({ url: project.shareUrl, title: project.name })}>
            Share <Share className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <section className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-3 shadow-card sm:p-5" aria-label="Interactive demo">
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative">
            <DevicePreview
              src={resolveDemoSrc(project)}
              title={project.name}
              chrome={project.chrome || { background: t.surface }}
              stageClassName="h-[calc(100svh-170px)] min-h-[520px] lg:h-[min(80vh,900px)] lg:min-h-[640px]"
            />
            <p className="pb-1 pt-2 text-center text-[12.5px] text-zinc-400">
              {rebuilding ? (project.realBuild ? 'Updating in the background — the current version stays live.' : 'Building with Flutter… first builds can take a few minutes.') : project.sample ? 'Sample project · placeholder app' : 'Tap • Scroll • Navigate • Type'}
            </p>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Panel title="Share link">
            <ShareUrl url={project.shareUrl} />
            <div className="mt-3 flex items-center justify-between text-[12.5px]">
              <span className="text-zinc-400">Permanent · survives updates</span>
              <a href={sharePath(project.demoId)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-800">
                Public page <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </Panel>

          <Panel title="Portfolio embed">
            <p className="mb-3 text-[13px] leading-relaxed text-zinc-500">
              Paste this iframe into a portfolio, personal site, or case study.
            </p>
            <pre className="max-h-28 overflow-auto rounded-lg bg-zinc-950 p-3 font-mono text-[10.5px] leading-relaxed text-zinc-300 whitespace-pre-wrap break-all">{embedCode}</pre>
            <button className="btn btn-secondary btn-md mt-3 w-full" onClick={() => copy(embedCode)}>
              <Copy className="h-4 w-4" /> {copied ? 'Embed copied' : 'Copy embed code'}
            </button>
          </Panel>

          <Panel title="Rebuild / Update">
            {rebuilding ? (
              <BuildProgress steps={REBUILD_STEPS} current={rebuildStep} compact />
            ) : (
              <>
                <p className="text-[13px] leading-relaxed text-zinc-500">
                  {project.status === 'not_built'
                    ? <>This project has no real build yet. Build it from <span className="font-mono text-zinc-700">{project.branch}</span> with <span className="font-mono text-zinc-700">flutter build web</span>.</>
                    : <>Pushed new commits? Rebuild from <span className="font-mono text-zinc-700">{project.branch}</span>. Your share link stays the same.</>}
                </p>
                <button className={`btn btn-md mt-4 w-full ${project.status === 'not_built' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => actions.rebuild(project)}>
                  <RefreshCw className="h-4 w-4" /> {project.status === 'not_built' ? 'Build now' : 'Rebuild / Update'}
                </button>
              </>
            )}
          </Panel>

          <Panel title="Details">
            <dl className="divide-y divide-zinc-100 text-[13px]">
              <Row label="Starting screen">{project.selectedDemo?.name} <span className="font-mono text-zinc-400">{project.selectedDemo?.route}</span></Row>
              <Row label="Branch"><GitBranch className="h-3.5 w-3.5 text-zinc-400" /> {project.branch}</Row>
              <Row label="Commit"><GitCommitHorizontal className="h-3.5 w-3.5 text-zinc-400" /><span className="font-mono">{project.commit || '—'}</span></Row>
              <Row label="Flutter">{project.flutterVersion || '—'}</Row>
              <Row label="Last updated">{timeAgo(project.updatedAt)}</Row>
              <Row label="Created">{formatDate(project.createdAt)}</Row>
            </dl>
          </Panel>
        </aside>
      </div>
      {modals}
    </div>
  )
}

const Panel = ({ title, children }) => (
  <div className="card p-5">
    <h2 className="mb-3 text-[13px] font-medium text-zinc-900">{title}</h2>
    {children}
  </div>
)

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
    <dt className="text-zinc-500">{label}</dt>
    <dd className="flex items-center gap-1.5 truncate text-zinc-800">{children}</dd>
  </div>
)

function DetailSkeleton() {
  return (
    <div className="container-page pt-8">
      <div className="h-4 w-24 rounded bg-zinc-200/70" />
      <div className="mt-8 h-9 w-56 rounded-lg bg-zinc-200/70" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-zinc-200/60" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="h-[640px] rounded-3xl bg-zinc-200/50" />
        <div className="hidden space-y-4 lg:block"><div className="h-32 rounded-2xl bg-zinc-200/50" /><div className="h-40 rounded-2xl bg-zinc-200/50" /></div>
      </div>
    </div>
  )
}

function Missing() {
  return (
    <div className="container-page flex flex-col items-center py-32 text-center">
      <p className="font-mono text-sm text-zinc-400">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Project not found</h1>
      <p className="mt-2 text-zinc-500">It may have been deleted or the link is wrong.</p>
      <Link to="/" className="btn btn-secondary btn-md mt-8"><ArrowLeft className="h-4 w-4" /> My Projects</Link>
    </div>
  )
}
