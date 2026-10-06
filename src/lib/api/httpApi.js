/**
 * Real backend client (not wired yet). Same contract as mockApi so the UI
 * doesn't change when the backend lands. Expected server flow:
 *
 *   POST /repositories/analyze        { repositoryUrl }         → Analysis
 *   POST /projects                    { analysis, selectedDemo } → { jobId }
 *   GET  /builds/:jobId               (poll or SSE)             → { step, status, project? , log? }
 *   POST /projects/:id/rebuild                                 → { jobId }
 *
 * The build worker clones the repo, runs `flutter pub get` and
 * `flutter build web --release`, uploads build/web to storage, and returns a
 * stable demoUrl such as https://demos.fluttershow.dev/<demoId>/.
 */
import { API_URL } from '../config'
import { ApiError } from './errors'
import { shareUrlFor } from '../demo'
import { supabase } from '../supabase'

async function request(path, init = {}) {
  let res
  try {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    res = await fetch(`${API_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      ...init,
    })
  } catch {
    throw new ApiError('NETWORK', "We couldn't reach FlutterShow. Check your connection and try again.")
  }
  const body = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(body?.code || 'NETWORK', body?.message || 'Something went wrong.', body || {})
  return body
}

const hydrate = (p) => ({ ...p, shareUrl: shareUrlFor(p.demoId) })

async function followJob(jobId, onStep) {
  const started = Date.now()
  const timeout = 40 * 60 * 1000
  for (;;) {
    const job = await request(`/builds/${jobId}`)
    onStep?.(job.step)
    if (job.status === 'succeeded') return hydrate(job.project)
    if (job.status === 'failed') throw new ApiError('BUILD_FAILED', "Your demo couldn't be built.", job)
    if (Date.now() - started > timeout) {
      throw new ApiError('BUILD_TIMEOUT', 'The build worker did not finish in time.', {
        step: job.step,
        log: job.log,
        hint: 'Check the FlutterShow build-worker Actions run and verify its Supabase secrets.',
      })
    }
    await new Promise((r) => setTimeout(r, 1500))
  }
}

export const httpApi = {
  listProjects: async () => (await request('/projects')).map(hydrate),
  getProject: async (slug) => hydrate(await request(`/projects/${slug}`)),
  getProjectByDemoId: async (demoId) => hydrate(await request(`/demos/${demoId}`)),
  analyzeRepository: (repositoryUrl) =>
    request('/repositories/analyze', { method: 'POST', body: JSON.stringify({ repositoryUrl }) }),
  async createProject(input, { onStep } = {}) {
    const { jobId } = await request('/projects', { method: 'POST', body: JSON.stringify(input) })
    return followJob(jobId, onStep)
  },
  updateProject: async (id, patch) =>
    hydrate(await request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })),
  async rebuildProject(id, { onStep } = {}) {
    const { jobId } = await request(`/projects/${id}/rebuild`, { method: 'POST' })
    return followJob(jobId, onStep)
  },
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
}

export { request }
