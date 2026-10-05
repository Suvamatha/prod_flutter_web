import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Copy, Github, Share } from 'lucide-react'
import Logo from '../components/Logo'
import DevicePreview from '../components/DevicePreview'
import { api } from '../lib/api'
import { resolveDemoSrc } from '../lib/demo'
import { getTheme } from '../lib/themes'
import { useCopy, useShare } from '../hooks/useCopy'

/**
 * Standalone page for visitors. Loads by demoId only — no dashboard state,
 * no account needed. Prioritizes the running app over everything else.
 */
export default function PublicDemoPage() {
  const { demoId } = useParams()
  const [state, setState] = useState({ status: 'loading', project: null })
  const { copy, copied } = useCopy()
  const { share } = useShare()

  useEffect(() => {
    let alive = true
    setState({ status: 'loading', project: null })
    api.getProjectByDemoId(demoId)
      .then((project) => alive && setState({ status: 'ready', project }))
      .catch(() => alive && setState({ status: 'missing', project: null }))
    return () => { alive = false }
  }, [demoId])

  useEffect(() => {
    if (state.project) document.title = `${state.project.name} — Interactive Flutter demo`
    return () => { document.title = 'FlutterShow — Interactive Flutter demos' }
  }, [state.project])

  const p = state.project

  return (
    <div className="flex min-h-svh flex-col bg-[#FAFAFA]">
      <header className="border-b border-zinc-200/70 bg-[#FAFAFA]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Logo />
          {p && (
            <div className="ml-auto flex items-center gap-1.5">
              <a href={p.repositoryUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm h-9" aria-label="GitHub repository">
                <Github className="h-4 w-4" /> <span className="hidden sm:inline">Source</span>
              </a>
              <button className="btn btn-dark btn-sm h-9" onClick={() => share({ url: p.shareUrl, title: p.name })}>
                <Share className="h-3.5 w-3.5" /> Share
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-3 pb-10 pt-6 sm:px-6 sm:pt-10">
        {state.status === 'loading' && (
          <div className="flex w-full flex-col items-center" aria-busy="true">
            <div className="h-7 w-40 rounded-lg bg-zinc-200/70" />
            <div className="mt-3 h-4 w-64 max-w-full rounded bg-zinc-200/60" />
            <div className="mt-8 h-[70svh] w-[min(92vw,360px)] rounded-[52px] bg-zinc-200/50" />
          </div>
        )}

        {state.status === 'missing' && (
          <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
            <p className="font-mono text-sm text-zinc-400">/d/{demoId}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">This demo isn't available</h1>
            <p className="mt-2 max-w-xs text-zinc-500">It may have been removed by its owner, or the link is incorrect.</p>
            <Link to="/" className="btn btn-secondary btn-md mt-8">Go to FlutterShow</Link>
          </div>
        )}

        {p && (
          <>
            <div className="animate-fade-up px-2 text-center">
              <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.025em] sm:text-[34px]">{p.name}</h1>
              <p className="mx-auto mt-1.5 max-w-md text-[14.5px] leading-relaxed text-zinc-500 sm:text-[15px]">{p.description}</p>
              <div className="mt-3 flex items-center justify-center gap-2 text-[12px] text-zinc-500">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1">
                  <svg viewBox="0 0 32 32" className="h-3 w-3" aria-hidden="true"><path d="M18.5 3 5 16.5l4 4L26.5 3z" fill="#47C5FB" /><path d="M18.5 15 11.5 22l7 7h8l-7-7 7-7z" fill="#00569E" /></svg>
                  Built with Flutter
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Interactive demo
                </span>
              </div>
            </div>

            <DevicePreview
              src={resolveDemoSrc(p)}
              title={p.name}
              chrome={p.chrome || { background: getTheme(p.theme).surface }}
              controls="minimal"
              className="mt-4 w-full"
              stageClassName="h-[calc(100svh-290px)] min-h-[460px] sm:h-[min(80vh,900px)] sm:min-h-[620px]"
            />

            <p className="mt-2 text-[13px] tracking-wide text-zinc-400">Tap • Scroll • Navigate • Type</p>
            <button className="btn btn-secondary btn-md mt-5" onClick={() => copy(p.shareUrl)}>
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy Link'}
            </button>
          </>
        )}
      </main>

      <footer className="pb-6 text-center text-[12px] text-zinc-400">
        Shared with <Link to="/" className="font-medium text-zinc-500 hover:text-zinc-900">FlutterShow</Link>
      </footer>
    </div>
  )
}
