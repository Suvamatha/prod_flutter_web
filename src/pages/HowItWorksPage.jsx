import { Link } from 'react-router-dom'
import { ArrowRight, Github, Hammer, Link2 } from 'lucide-react'

const STEPS = [
  { icon: Github, title: 'Paste your repo', body: 'Any public Flutter repository on GitHub. We detect pubspec.yaml and your screens.' },
  { icon: Hammer, title: 'We build it for the web', body: 'Your real app is compiled with flutter build web and hosted on an isolated domain.' },
  { icon: Link2, title: 'Share one link', body: 'Visitors tap, scroll and type in your actual app. Rebuild anytime — the link never changes.' },
]

const PIPELINE = ['GitHub repository', 'flutter pub get', 'flutter build web --release', 'Deploy to edge', 'fluttershow.dev/d/7xk29p']

export default function HowItWorksPage() {
  return (
    <div className="container-page pb-24 pt-16 sm:pt-20">
      <div className="mx-auto max-w-2xl animate-fade-up text-center">
        <p className="eyebrow">How it works</p>
        <h1 className="mt-3 text-balance text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[46px]">
          Paste your Flutter repo. Share a real, running app.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-zinc-500">
          No screenshots, no screen recordings. FlutterShow hosts your actual Flutter Web build inside an interactive phone.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="card animate-fade-up p-6" style={{ animationDelay: `${80 + i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white"><s.icon className="h-[18px] w-[18px]" /></span>
              <span className="font-mono text-xs text-zinc-300">0{i + 1}</span>
            </div>
            <h2 className="mt-5 text-[15px] font-semibold tracking-tight">{s.title}</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-zinc-500">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-6 max-w-4xl overflow-x-auto rounded-2xl border border-zinc-200/80 bg-zinc-950 p-5 sm:p-6">
        <ol className="flex min-w-max items-center gap-3 font-mono text-[12.5px]">
          {PIPELINE.map((p, i) => (
            <li key={p} className="flex items-center gap-3">
              <span className={i === PIPELINE.length - 1 ? 'text-brand-300' : 'text-zinc-300'}>{p}</span>
              {i < PIPELINE.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-zinc-600" />}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-14 text-center">
        <Link to="/new" className="btn btn-primary btn-lg">Create your first demo <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  )
}
