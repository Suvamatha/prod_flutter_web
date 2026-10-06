import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

export const admin = createClient(SUPABASE_URL || 'https://placeholder.supabase.co', SERVICE_KEY || 'placeholder', {
  auth: { persistSession: false, autoRefreshToken: false },
})

export function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => { data += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')) } catch { resolve({}) }
    })
  })
}

export async function requireUser(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token || !ANON_KEY) throw Object.assign(new Error('Sign in required.'), { status: 401 })
  const auth = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data, error } = await auth.auth.getUser(token)
  if (error || !data.user) throw Object.assign(new Error('Your session expired. Sign in again.'), { status: 401 })
  return data.user
}

export const id = () => crypto.randomUUID()
export const slugify = (value) =>
  String(value || 'flutter-app').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 55)

export function mapProject(row) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    repositoryUrl: row.repository_url,
    branch: row.branch,
    commit: row.commit_sha,
    framework: 'Flutter',
    flutterVersion: row.flutter_version,
    theme: row.theme || 'default',
    chrome: row.chrome || undefined,
    screens: row.screens || [{ id: 'home', route: '/', name: 'App start' }],
    selectedDemo: row.selected_demo || { id: 'home', route: '/', name: 'App start' },
    demoId: row.demo_id,
    demoUrl: row.demo_url,
    previewImageUrl: row.preview_image_url,
    appPath: row.app_path || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function assertBuildAllowance(userId) {
  const since = new Date()
  since.setUTCHours(0, 0, 0, 0)
  const max = Number(process.env.MAX_BUILDS_PER_USER_PER_DAY || 5)
  const { count, error } = await admin
    .from('builds')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
  if (error) throw error
  if ((count || 0) >= max) {
    throw Object.assign(new Error(`Daily build limit reached (${max}). Try again tomorrow.`), { status: 429 })
  }
  const concurrentMax = Number(process.env.MAX_CONCURRENT_BUILDS_PER_USER || 1)
  const { count: active, error: activeError } = await admin
    .from('builds')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['queued', 'running'])
  if (activeError) throw activeError
  if ((active || 0) >= concurrentMax) {
    throw Object.assign(new Error('You already have a build running. Wait for it to finish.'), { status: 429 })
  }
}

export async function dispatchBuild({ buildId, project }) {
  const token = process.env.PLATFORM_GITHUB_TOKEN
  const repo = process.env.PLATFORM_GITHUB_REPO
  const workflow = process.env.PLATFORM_BUILD_WORKFLOW || 'build-demo.yml'
  const publicOrigin = (
    process.env.PUBLIC_APP_ORIGIN ||
    process.env.VITE_SHARE_ORIGIN ||
    ''
  ).replace(/\/$/, '')
  if (!token || !repo) throw new Error('Production build worker is not configured.')
  if (!/^https?:\/\//.test(publicOrigin)) throw new Error('PUBLIC_APP_ORIGIN is not configured.')

  const repoInfo = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!repoInfo.ok) throw new Error('FlutterShow could not access its build repository.')
  const { default_branch: ref } = await repoInfo.json()

  const response = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      ref,
      inputs: {
        build_id: buildId,
        project_id: project.id,
        repository: project.repository_url,
        path: project.app_path || '',
        public_origin: publicOrigin,
      },
    }),
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message || 'Could not queue the Flutter build.')
  }
}

export function handleError(res, error) {
  console.error(error)
  send(res, error.status || 500, {
    code: error.status === 401 ? 'UNAUTHORIZED' : error.status === 429 ? 'RATE_LIMIT' : 'SERVER_ERROR',
    message: error.message || 'Something went wrong.',
  })
}