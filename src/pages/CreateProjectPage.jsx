import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, Check, ChevronDown, Copy, ExternalLink, GitBranch, Github, Layers, RotateCw } from 'lucide-react'
import RepositoryInput from '../components/RepositoryInput'
import BuildProgress from '../components/BuildProgress'
import ScreenSelector from '../components/ScreenSelector'
import ShareUrl from '../components/ShareUrl'
import { api, ANALYSIS_STEPS, BUILD_STEPS } from '../lib/api'
import { useProjects } from '../hooks/useProjects'
import { useCopy } from '../hooks/useCopy'

const STAGES = ['Repository', 'Demo', 'Publish']
const stageOf = { repo: 0, analyzing: 0, analyzed: 0, choose: 1, building: 2, success: 2 }

export default function CreateProjectPage() {
  const [params] = useSearchParams()
  const { addProject } = useProjects()
  const [phase, setPhase] = useState('repo')
  const [repoUrl, setRepoUrl] = useState(params.get('repo') || '')
  const [inputError, setInputError] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState(0)
  const [error, setError] = useState(null)
  const [project, setProject] = useState(null)
  const run = useRef(0)
  const autoStarted = useRef(false)

  const mounted = useRef(true)
  const stepRef = useRef(0)
  const track = (i) => { stepRef.current = i; setStep(i) }
  // Track mount state without invalidating the in-flight run: React StrictMode
  // mounts → unmounts → remounts in development, which must not orphan a run.
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  const guard = (id, fn) => (...a) => { if (run.current === id && mounted.current) fn(...a) }
  const withTimeout = (promise, ms, message) => Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error(message), { code: 'TIMEOUT', hint: 'GitHub may be slow or unreachable. Check your connection and retry.' })), ms)),
  ])

  const analyze = async (url) => {
    const id = ++run.current
    setRepoUrl(url); setError(null); setInputError(null); setStep(0); setPhase('analyzing')
    try {
      const a = await withTimeout(api.analyzeRepository(url, { onStep: guard(id, track) }), 30000, 'Analysis is taking longer than expected.')
      guard(id, () => { setAnalysis(a); setSelected(a.screens[0]); setStep(ANALYSIS_STEPS.length); setPhase('analyzed') })()
    } catch (e) {
      guard(id, () => {
        if (e.code === 'INVALID_REPO') { setInputError(e.message); setPhase('repo') } else setError({ ...e, message: e.message, step: e.step ?? stepRef.current })
      })()
    }
  }

  const build = async () => {
    const id = ++run.current
    setError(null); setStep(0); setPhase('building')
    try {
      const p = await api.createProject({ analysis, selectedDemo: selected }, { onStep: guard(id, setStep) })
      guard(id, () => { addProject(p); setProject(p); setStep(BUILD_STEPS.length); setTimeout(guard(id, () => setPhase('success')), 650) })()
    } catch (e) {
      guard(id, () => setError(e))()
    }
  }

  useEffect(() => {
    if (autoStarted.current || !params.get('repo')) return
    autoStarted.current = true
    analyze(params.get('repo'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => { run.current++; setPhase('repo'); setError(null) }
  const wide = phase === 'choose'

  return (
    <div className="container-page pb-24 pt-8 sm:pt-10">
      <div className="mb-10 flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-900"><ArrowLeft className="h-4 w-4" /> My Projects</Link>
        {phase !== 'success' && <Stepper current={stageOf[phase]} />}
      </div>

      <div className={`mx-auto transition-[max-width] duration-300 ${wide ? 'max-w-4xl' : 'max-w-[560px]'}`}>
        <div key={phase} className="animate-fade-up">
          {phase === 'repo' && (
            <>
              <Heading title="Create your Flutter demo" description="Connect a Flutter GitHub repository to create an interactive demo." />
              <div className="card p-6 sm:p-8">
                <RepositoryInput defaultValue={repoUrl} error={inputError} onSubmit={analyze} />
              </div>
            </>
          )}

          {phase === 'analyzing' && (
            <>
              <Heading title={error ? 'Analysis stopped' : 'Analyzing repository…'} description={<span className="font-mono text-[13.5px]">{repoUrl.replace(/^https?:\/\//, '')}</span>} />
              <div className="card p-6 sm:p-8">
                <BuildProgress steps={ANALYSIS_STEPS} current={error ? error.step ?? step : step} errorStep={error ? error.step ?? step : null} />
                {error && (
                  <ErrorPanel title={error.message} body={error.hint || (error.code === 'NOT_FLUTTER' ? 'FlutterShow needs a pubspec.yaml that depends on the Flutter SDK, at the repository root.' : 'Check the URL, and make sure the repository is public.')}>
                    <button className="btn btn-primary btn-md" onClick={reset}>Try another repository</button>
                    <button className="btn btn-ghost btn-md" onClick={() => analyze(repoUrl)}><RotateCw className="h-4 w-4" /> Retry</button>
                  </ErrorPanel>
                )}
              </div>
            </>
          )}

          {phase === 'analyzed' && analysis && (
            <>
              <Heading title="Repository ready" description="We found a Flutter project. Next, choose what visitors see first." />
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/60 px-6 py-3 text-[13px] text-emerald-700">
                  <Check className="h-4 w-4" strokeWidth={2.6} /> Analysis complete
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white"><Github className="h-6 w-6" /></div>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold tracking-tight">{analysis.name}</p>
                      <a href={analysis.repositoryUrl} target="_blank" rel="noreferrer" className="block truncate font-mono text-[13px] text-zinc-500 hover:text-zinc-900">{analysis.display}</a>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Chip><FlutterGlyph /> Flutter project</Chip>
                    <Chip><GitBranch className="h-3.5 w-3.5" /> {analysis.branch} branch</Chip>
                    <Chip><Layers className="h-3.5 w-3.5" /> {analysis.screens.length} {analysis.screens.length === 1 ? 'screen' : 'screens'} detected</Chip>
                    {analysis.appPath && <Chip><Layers className="h-3.5 w-3.5" /> App in /{analysis.appPath}</Chip>}
                    {analysis.buildServer?.flutter && (
                      <Chip><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {analysis.buildServer.mode === 'github' ? 'Builds on GitHub Actions' : `Build machine: Flutter ${analysis.buildServer.flutter}`}</Chip>
                    )}
                  </div>
                  {analysis.buildServer?.mode === 'github' && analysis.buildServer.configured && (
                    <p className="mt-5 text-[13px] leading-relaxed text-zinc-500">
                      Hosted build: GitHub Actions runs <span className="font-mono">flutter build web</span>, then the site redeploys. Expect about 4–8 minutes.
                    </p>
                  )}
                  {!analysis.buildServer?.flutter && (
                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-[13px] leading-relaxed text-amber-800">
                      <p className="font-medium">
                        {analysis.buildServer?.mode === 'github'
                          ? 'Hosted builds aren\'t set up yet.'
                          : !analysis.buildServer ? 'No build backend found.' : !analysis.buildServer.git ? 'Git isn\'t installed on this machine.' : 'Flutter SDK not found on this machine.'}
                      </p>
                      <p className="mt-1 text-amber-800/80">
                        FlutterShow builds your real app with <span className="font-mono">flutter build web</span>.{' '}
                        {analysis.buildServer?.mode === 'github'
                          ? <>Add a <span className="font-mono">GITHUB_TOKEN</span> environment variable in Vercel (see README → Hosting on Vercel), then redeploy.</>
                          : !analysis.buildServer
                            ? <>Run it locally with <span className="font-mono">npm run dev</span>, or deploy to Vercel with the <span className="font-mono">api/</span> folder (README → Hosting on Vercel).</>
                            : <>Install Flutter, check that <span className="font-mono">flutter --version</span> works in a terminal, then restart <span className="font-mono">npm run dev</span>.</>}
                      </p>
                    </div>
                  )}
                  <button className="btn btn-primary btn-lg mt-8 w-full" onClick={() => setPhase('choose')}>Continue <ArrowRight className="h-4 w-4" /></button>
                  <button className="mt-3 w-full text-center text-[13px] text-zinc-500 hover:text-zinc-900" onClick={reset}>Use a different repository</button>
                </div>
              </div>
            </>
          )}

          {phase === 'choose' && analysis && (
            <>
              <Heading title="Choose your demo" description="Select the experience you want visitors to see first." />
              <ScreenSelector chrome={analysis.chrome} theme={analysis.theme} screens={analysis.screens} value={selected} onChange={setSelected} />
              <div className="sticky bottom-4 z-10 mt-8 flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/90 p-3 pl-5 shadow-pop backdrop-blur">
                <p className="truncate text-sm text-zinc-500">Starts on <span className="font-medium text-zinc-900">{selected?.name}</span></p>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-md hidden sm:inline-flex" onClick={() => setPhase('analyzed')}>Back</button>
                  <button className="btn btn-primary btn-md" onClick={build} disabled={!selected}>Create Demo <ArrowRight className="h-4 w-4" /></button>
                </div>
              </div>
            </>
          )}

          {phase === 'building' && (
            <>
              <Heading title={error ? "Your demo couldn't be built." : 'Creating your Flutter demo'} description={error ? 'Nothing was published.' : analysis?.buildServer?.mode === 'github' ? 'GitHub Actions is building your real app, then your site redeploys. This takes about 4–8 minutes — you can leave this tab open.' : 'This runs flutter build web on your repository. First builds can take a few minutes.'} />
              <div className="card p-6 sm:p-8">
                <BuildProgress steps={BUILD_STEPS} current={error ? error.step ?? step : Math.min(step, BUILD_STEPS.length - 1)} done={step >= BUILD_STEPS.length} errorStep={error ? error.step ?? step : null} />
                {error && <BuildFailure error={error} onRetry={build} onBack={() => setPhase('choose')} />}
              </div>
            </>
          )}

          {phase === 'success' && project && <Success project={project} />}
        </div>
      </div>
    </div>
  )
}

function Heading({ title, description }) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-balance text-[28px] font-semibold leading-tight tracking-[-0.025em] sm:text-[34px]">{title}</h1>
      {description && <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-zinc-500">{description}</p>}
    </div>
  )
}

function Stepper({ current }) {
  return (
    <ol className="flex items-center gap-2 text-[13px]" aria-label="Progress">
      {STAGES.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 ${i === current ? 'font-medium text-zinc-900' : i < current ? 'text-zinc-500' : 'text-zinc-400'}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] transition ${i < current ? 'bg-zinc-900 text-white' : i === current ? 'bg-brand-600 text-white' : 'border border-zinc-300'}`}>
              {i < current ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
            </span>
            <span className="hidden sm:inline">{s}</span>
          </span>
          {i < STAGES.length - 1 && <span className="h-px w-4 bg-zinc-300 sm:w-8" />}
        </li>
      ))}
    </ol>
  )
}

const Chip = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[12.5px] text-zinc-700">{children}</span>
)

const FlutterGlyph = () => (
  <svg viewBox="0 0 32 32" className="h-3.5 w-3.5" aria-hidden="true"><path d="M18.5 3 5 16.5l4 4L26.5 3z" fill="#47C5FB" /><path d="M18.5 15 11.5 22l7 7h8l-7-7 7-7z" fill="#00569E" /></svg>
)

function ErrorPanel({ title, body, children }) {
  return (
    <div className="mt-6 animate-fade-up rounded-xl border border-red-200 bg-red-50/60 p-5">
      <p className="flex items-start gap-2 text-[14px] font-medium text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{title}</p>
      {body && <p className="ml-6 mt-1 text-[13px] leading-relaxed text-red-700/80">{body}</p>}
      <div className="ml-6 mt-4 flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function BuildFailure({ error, onRetry, onBack }) {
  const [open, setOpen] = useState(false)
  return (
    <ErrorPanel title={error.message} body={error.hint || 'Fix the error in your repository, push a commit, then try again.'}>
      <button className="btn btn-primary btn-md" onClick={onRetry}><RotateCw className="h-4 w-4" /> Try again</button>
      <button className="btn btn-secondary btn-md" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        View build details <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <button className="btn btn-ghost btn-md" onClick={onBack}>Back</button>
      {open && error.log && (
        <pre className="mt-2 w-full animate-fade-in overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-[11.5px] leading-relaxed text-zinc-300">
          {error.log.slice(-40).map((l, i) => <div key={i} className={/error|✗/i.test(l) ? 'text-red-400' : l.startsWith('$') ? 'text-zinc-500' : ''}>{l}</div>)}
        </pre>
      )}
    </ErrorPanel>
  )
}

function Success({ project }) {
  const navigate = useNavigate()
  const { copy } = useCopy()
  return (
    <div className="text-center">
      <div className="relative mx-auto mb-8 h-20 w-20">
        <span className="absolute inset-0 animate-[ring_1.4s_ease-out_1] rounded-full bg-emerald-400/40" />
        <svg viewBox="0 0 80 80" className="relative h-20 w-20 animate-scale-in">
          <circle cx="40" cy="40" r="40" fill="#10B981" />
          <path d="M26 41.5 35.5 51 55 31" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="48" className="animate-draw" />
        </svg>
      </div>
      <h1 className="text-[30px] font-semibold tracking-[-0.025em] sm:text-[36px]">Your demo is ready</h1>
      <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-zinc-500">Your Flutter application is now available as an interactive web demo.</p>

      <ShareUrl url={project.shareUrl} size="lg" className="mt-9 text-left" />

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button className="btn btn-primary btn-lg" onClick={() => navigate(`/projects/${project.slug}`)}><ExternalLink className="h-4 w-4" /> Open Demo</button>
        <button className="btn btn-secondary btn-lg" onClick={() => copy(project.shareUrl)}><Copy className="h-4 w-4" /> Copy Link</button>
        <Link to="/" className="btn btn-ghost btn-lg">Back to Projects</Link>
      </div>
      <p className="mt-8 inline-flex items-center gap-1.5 text-[13px] text-zinc-400"><Check className="h-3.5 w-3.5 text-emerald-500" /> Saved to My Projects as <span className="font-medium text-zinc-600">{project.name}</span></p>
    </div>
  )
}
