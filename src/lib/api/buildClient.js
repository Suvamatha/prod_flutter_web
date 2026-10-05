/**
 * Client for FlutterShow's build backend. Same API in both setups:
 *  - local:  server/flutterBuildServer.js inside `npm run dev` (Flutter on your machine)
 *  - hosted: api/*.js on Vercel → builds run on GitHub Actions (.github/workflows/build-demo.yml)
 */
import { ApiError } from './errors'

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const STALL_MS = 25 * 60_000

export async function buildServerHealth() {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 20000)
    const res = await fetch(`${BASE}/api/health`, { signal: ctrl.signal, cache: 'no-store' })
    clearTimeout(t)
    if (!res.ok || !res.headers.get('content-type')?.includes('json')) return null
    return await res.json()
  } catch {
    return null
  }
}

const SETUP_HINT = {
  server: ['No FlutterShow build backend was found.', 'Locally: start the app with `npm run dev`. On Vercel: deploy the whole repo including the api/ folder and .github/workflows/build-demo.yml, then add GITHUB_TOKEN (README → Hosting on Vercel).'],
  flutter: ['The Flutter SDK was not found on this machine.', 'Install Flutter (https://docs.flutter.dev/get-started/install), make sure `flutter --version` works in a terminal, then restart `npm run dev`. Or set FLUTTER_BIN=/path/to/flutter.'],
  git: ['Git is not installed on this machine.', 'Install Git, then restart `npm run dev`.'],
  github: ['Hosted builds are not set up yet.', 'In Vercel → Settings → Environment Variables add GITHUB_TOKEN (a fine-grained token for your FlutterShow repo with "Actions: Read and write"), then redeploy. See README → "Hosting on Vercel".'],
}

export function setupError(kind) {
  const [title, hint] = SETUP_HINT[kind]
  return new ApiError('BUILD_FAILED', title, { step: 0, hint, log: [title, hint] })
}

export async function ensureBuildServer() {
  const health = await buildServerHealth()
  if (!health) throw setupError('server')
  if (health.mode === 'github') {
    if (!health.configured) throw setupError('github')
    return health
  }
  if (!health.git) throw setupError('git')
  if (!health.flutter) throw setupError('flutter')
  return health
}

/** Starts a real build and resolves with the build entry once deployed. */
export async function runBuild({ repositoryUrl, screens, name, description, appPath }, { onStep, hosted = false } = {}) {
  const res = await fetch(`${BASE}/api/builds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repositoryUrl, screens, name, description, appPath }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 404 || !res.headers.get('content-type')?.includes('json')) throw setupError('server')
    throw new ApiError('BUILD_FAILED', "Your demo couldn't be built.", { step: 0, hint: body.message, log: body.message ? [body.message] : [] })
  }

  let lastChange = Date.now()
  let lastKey = ''
  for (;;) {
    await sleep(hosted ? 5000 : 1200) // hosted polls GitHub's API — be gentle
    let job
    try {
      job = await (await fetch(`${BASE}/api/builds/${body.id}`, { cache: 'no-store' })).json()
    } catch {
      throw setupError('server')
    }
    onStep?.(job.step)
    const key = `${job.step}:${job.log?.length}:${job.log?.at(-1)}`
    if (key !== lastKey) { lastKey = key; lastChange = Date.now() }
    if (job.status === 'succeeded') return job.result
    if (job.status === 'failed')
      throw new ApiError('BUILD_FAILED', "Your demo couldn't be built.", { step: job.step, hint: job.error, log: job.log })
    if (Date.now() - lastChange > STALL_MS)
      throw new ApiError('BUILD_FAILED', 'The build stopped responding.', { step: job.step, log: job.log })
  }
}
