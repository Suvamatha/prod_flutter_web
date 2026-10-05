import { useState } from 'react'
import { AlertCircle, ArrowRight, Github } from 'lucide-react'
import { parseRepoUrl } from '../lib/github'

const EXAMPLES = ['github.com/flutter/gallery', 'github.com/username/uzina']

export default function RepositoryInput({ defaultValue = '', error: externalError, onSubmit }) {
  const [value, setValue] = useState(defaultValue)
  const [error, setError] = useState(null)
  const shown = error || externalError

  const submit = (e) => {
    e.preventDefault()
    if (!value.trim()) return setError('Paste a GitHub repository URL to continue.')
    if (!parseRepoUrl(value)) return setError("That doesn't look like a valid GitHub repository.")
    setError(null)
    onSubmit(value.trim())
  }

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="repo" className="label">Repository URL</label>
      <div className="relative">
        <Github className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
        <input
          id="repo"
          className={`input pl-11 font-mono text-[14px] ${shown ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10' : ''}`}
          placeholder="https://github.com/username/flutter-app"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null) }}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus
          aria-invalid={!!shown}
          aria-describedby="repo-help"
        />
      </div>
      <div id="repo-help" className="mt-2 min-h-[20px] text-[13px]">
        {shown ? (
          <p className="flex animate-fade-in items-center gap-1.5 text-red-600"><AlertCircle className="h-3.5 w-3.5" />{shown}</p>
        ) : (
          <p className="flex items-center gap-1.5 text-zinc-500"><Github className="h-3.5 w-3.5" /> Public GitHub repositories</p>
        )}
      </div>

      <button type="submit" className="btn btn-primary btn-lg mt-5 w-full">
        Continue <ArrowRight className="h-4 w-4" />
      </button>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-[13px] text-zinc-400">
        <span>Try</span>
        {EXAMPLES.map((ex) => (
          <button key={ex} type="button" className="kbd-chip" onClick={() => { setValue(`https://${ex}`); setError(null) }}>{ex}</button>
        ))}
      </div>
    </form>
  )
}
