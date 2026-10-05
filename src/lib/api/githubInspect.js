/**
 * Real, read-only checks against public GitHub (CORS-enabled endpoints).
 * Every request has a timeout so analysis can never hang.
 */
const TIMEOUT_MS = 8000

async function get(url, init = {}) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal })
  } finally {
    clearTimeout(t)
  }
}

/** → { status: 'ok', meta } | { status: 'not_found' } | { status: 'unavailable' } */
export async function fetchRepo(owner, repo) {
  try {
    const res = await get(`https://api.github.com/repos/${owner}/${repo}`, { headers: { Accept: 'application/vnd.github+json' } })
    if (res.status === 404) return { status: 'not_found' }
    if (!res.ok) return { status: 'unavailable' } // e.g. rate-limited
    const meta = await res.json()
    return meta.private ? { status: 'not_found' } : { status: 'ok', meta }
  } catch {
    return { status: 'unavailable' }
  }
}

/** Raw file at the repo root. → string | null (missing) | undefined (couldn't check) */
export async function fetchRootFile(owner, repo, branch, file) {
  try {
    const res = await get(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file}`)
    if (res.ok) return await res.text()
    return res.status === 404 ? null : undefined
  } catch {
    return undefined
  }
}

export async function fetchLatestCommit(owner, repo, branch) {
  try {
    const res = await get(`https://api.github.com/repos/${owner}/${repo}/commits/${branch}`, { headers: { Accept: 'application/vnd.github+json' } })
    if (!res.ok) return null
    return (await res.json()).sha?.slice(0, 7) || null
  } catch {
    return null
  }
}

export const isFlutterPubspec = (text = '') => /sdk:\s*flutter\b/.test(text) || /^\s*flutter:\s*$/m.test(text)

export function pubspecField(text = '', field) {
  const m = text.match(new RegExp(`^${field}:\\s*["']?(.+?)["']?\\s*$`, 'm'))
  return m?.[1]
}

/** Best-effort description of a non-Flutter project, used in the error hint. */
export function describeStack(packageJson) {
  try {
    const pkg = JSON.parse(packageJson)
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    const known = [['next', 'Next.js'], ['react-native', 'React Native'], ['react', 'React'], ['vue', 'Vue'], ['@angular/core', 'Angular'], ['svelte', 'Svelte']]
    const hit = known.find(([k]) => deps?.[k])
    return hit ? `${hit[1]} app` : 'JavaScript project'
  } catch {
    return 'JavaScript project'
  }
}

/**
 * Real screens from lib/main.dart: the app start ('/') plus any named routes
 * declared in a `routes: { '/x': ... }` map.
 */
export async function fetchNamedRoutes(owner, repo, branch) {
  const main = await fetchRootFile(owner, repo, branch, 'lib/main.dart')
  if (!main) return []
  const block = main.match(/routes\s*:\s*(?:<[^>]*>\s*)?\{([\s\S]*?)\}\s*,?/)
  if (!block) return []
  const routes = [...block[1].matchAll(/['"](\/[\w\-/]*)['"]\s*:/g)].map((m) => m[1]).filter((r) => r !== '/')
  return [...new Set(routes)].slice(0, 7)
}

/**
 * Looks for a Flutter app below the repo root (monorepos / nested folders).
 * → { path: 'apps/mobile' } | { submodule: 'name' } | null | undefined (couldn't check)
 */
export async function findFlutterApp(owner, repo, branch) {
  try {
    const res = await get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers: { Accept: 'application/vnd.github+json' } })
    if (!res.ok) return undefined
    const tree = (await res.json()).tree || []
    const paths = new Set(tree.map((t) => t.path))
    const skip = /(^|\/)(\.dart_tool|build|ephemeral|\.symlinks|example|node_modules)(\/|$)/
    const candidates = tree
      .filter((t) => t.path.endsWith('/pubspec.yaml') && !skip.test(t.path) && t.path.split('/').length <= 4)
      .map((t) => t.path.slice(0, -'/pubspec.yaml'.length))
      .filter((dir) => paths.has(`${dir}/lib/main.dart`))
      .sort((a, b) => a.split('/').length - b.split('/').length)
    if (candidates[0]) return { path: candidates[0] }
    const sub = tree.find((t) => t.mode === '160000')
    return sub ? { submodule: sub.path } : null
  } catch {
    return undefined
  }
}
