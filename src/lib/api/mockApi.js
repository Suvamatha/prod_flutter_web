/**
 * Local FlutterShow API.
 *
 * - Projects persist in localStorage.
 * - Repository analysis is real (public GitHub API + pubspec.yaml + lib/main.dart routes).
 * - Builds are REAL: they run `flutter build web` through the local build server
 *   (server/flutterBuildServer.js, part of `npm run dev`). If Flutter isn't
 *   available, the build fails with setup instructions — it never shows fake UI.
 * - Published builds (demos/index.json) are listed for every visitor, so a hosted
 *   FlutterShow shows the same projects to everyone. Sample projects with the
 *   placeholder app only appear when VITE_SHOW_SAMPLES=true.
 */
import { MOCK_PROJECTS } from '../../data/mockProjects'
import { parseRepoUrl } from '../github'
import { randomId, slugify, titleize } from '../format'
import { shareUrlFor } from '../demo'
import { ApiError } from './errors'
import { describeStack, fetchLatestCommit, fetchNamedRoutes, fetchRepo, fetchRootFile, findFlutterApp, isFlutterPubspec, pubspecField } from './githubInspect'
import { buildServerHealth, ensureBuildServer, runBuild } from './buildClient'

const KEY = 'fluttershow.projects.v1'
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
const SAMPLE_IDS = new Set(MOCK_PROJECTS.map((p) => p.id))
const SHOW_SAMPLES = import.meta.env.VITE_SHOW_SAMPLES === 'true'
const HIDDEN_KEY = 'fluttershow.hidden.v1'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function read() {
  let list = null
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) list = JSON.parse(raw)
  } catch { /* ignore corrupt storage */ }
  if (!list) list = SHOW_SAMPLES ? structuredClone(MOCK_PROJECTS) : []
  // Placeholder samples are opt-in — FlutterShow only shows real apps by default.
  return SHOW_SAMPLES ? list : list.filter((p) => !SAMPLE_IDS.has(p.id))
}
const hidden = () => { try { return new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]')) } catch { return new Set() } }
const hide = (slug) => localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden(), slug]))
const unhide = (slug) => localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden()].filter((s) => s !== slug)))
function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

// ---- Real builds registry (demos/index.json, served by the build server) ----
let buildsPromise
function realBuilds() {
  buildsPromise ??= fetch(`${BASE}/demos/index.json`, { cache: 'no-store' })
    .then((r) => (r.ok && r.headers.get('content-type')?.includes('json') ? r.json() : { builds: [] }))
    .then((d) => d.builds || [])
    .catch(() => [])
  return buildsPromise
}
const invalidateBuilds = () => { buildsPromise = undefined }
const norm = (u = '') => u.replace(/\.git$/, '').replace(/\/$/, '').toLowerCase()
const findBuild = async (repositoryUrl) => (await realBuilds()).find((b) => norm(b.repositoryUrl) === norm(repositoryUrl)) || null

function withBuild(p, b) {
  const sample = SAMPLE_IDS.has(p.id)
  if (!b) {
    // Samples keep the placeholder app. Your own projects never show fake UI.
    return sample ? { ...p, sample: true } : { ...p, demoUrl: null, previewImageUrl: null, realBuild: false, status: p.status === 'building' ? 'building' : 'not_built' }
  }
  const img = b.previewImageUrl ? BASE + b.previewImageUrl : null
  const screens = (b.screens || [{ id: 'home', route: '/', name: 'Home' }]).map((s) => ({ ...s, previewImageUrl: img || undefined }))
  return {
    ...p,
    realBuild: true,
    demoUrl: BASE + b.demoUrl,
    previewImageUrl: img,
    chrome: b.chrome || p.chrome,
    commit: b.commit || p.commit,
    flutterVersion: b.flutterVersion || p.flutterVersion,
    screens,
    selectedDemo: screens.find((s) => s.id === p.selectedDemo?.id) || screens[0],
    status: p.status === 'building' ? 'building' : 'live',
  }
}
const slugOf = (b) => b.slug || (b.demoUrl || '').split('/').filter(Boolean).pop()
const titleCase = (s) => s.replace(/[-_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase()).trim()
const fromBuild = (b) => {
  const demoId = slugOf(b)
  const repo = b.repositoryUrl.replace(/\.git$/, '').split('/').pop()
  return {
    id: `pub_${demoId}`, slug: demoId, demoId, published: true, name: b.name || titleCase(repo),
    description: b.description || 'Interactive Flutter Web build.', framework: 'Flutter', appPath: b.appPath,
    repositoryUrl: b.repositoryUrl, theme: 'default', status: 'live', createdAt: b.builtAt, updatedAt: b.builtAt,
  }
}
/** Published builds that aren't already one of this browser's projects. */
async function publishedProjects(local) {
  const mine = new Set(local.map((p) => norm(p.repositoryUrl)))
  const hid = hidden()
  return (await realBuilds()).filter((b) => !mine.has(norm(b.repositoryUrl)) && !hid.has(slugOf(b))).map(fromBuild)
}
async function publishedProject(demoId) {
  const b = (await realBuilds()).find((x) => slugOf(x) === demoId)
  return b ? fromBuild(b) : null
}
const attachBuild = async (p) => (p ? withBuild(p, await findBuild(p.repositoryUrl)) : p)
const hydrate = (p) => (p ? { ...p, shareUrl: shareUrlFor(p.demoId) } : null)

export const mockApi = {
  async listProjects() {
    await sleep(200)
    const local = read()
    const all = [...local, ...(await publishedProjects(local))]
    const list = await Promise.all(all.map((p) => attachBuild({ ...p, status: p.status === 'building' ? 'live' : p.status })))
    return list.map(hydrate).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  },

  async getProject(slug) {
    const p = read().find((x) => x.slug === slug || x.id === slug) || (await publishedProject(String(slug).replace(/^pub_/, '')))
    if (!p) throw new ApiError('NOT_FOUND', "This project doesn't exist.")
    return hydrate(await attachBuild(p))
  },

  async getProjectByDemoId(demoId) {
    let p = read().find((x) => x.demoId === demoId)
    // Published builds are public: /d/<slug> works for every visitor (e.g. links
    // from a portfolio), not just the browser that created the project.
    if (!p) p = await publishedProject(demoId)
    if (!p) throw new ApiError('NOT_FOUND', "This demo doesn't exist or has been removed.")
    const full = await attachBuild(p)
    const { id, name, description, repositoryUrl, demoUrl, selectedDemo, theme, chrome, updatedAt, status } = full
    return hydrate({ id, name, description, repositoryUrl, demoUrl, selectedDemo, theme, chrome, updatedAt, status, demoId })
  },

  async analyzeRepository(input, { onStep } = {}) {
    const repo = parseRepoUrl(input)
    if (!repo) throw new ApiError('INVALID_REPO', "That doesn't look like a valid GitHub repository.")

    // 1 — Repository exists and is public
    onStep?.(0)
    const [found] = await Promise.all([fetchRepo(repo.owner, repo.repo), sleep(400)])
    if (found.status === 'not_found')
      throw new ApiError('REPO_NOT_FOUND', "We couldn't find that repository.", { step: 0, hint: 'Check the URL, and make sure the repository is public.' })
    const online = found.status === 'ok'
    const meta = found.meta || {}
    const branch = meta.default_branch || 'main'
    const owner = meta.owner?.login || repo.owner
    const name = meta.name || repo.repo

    // 2 — Flutter project detected
    onStep?.(1)
    let appPath = ''
    let pubspec = await fetchRootFile(owner, name, branch, 'pubspec.yaml')
    if (pubspec === null || (pubspec && !isFlutterPubspec(pubspec))) {
      // Not at the root — look inside sub-folders (monorepos, nested app folders).
      const nested = await findFlutterApp(owner, name, branch)
      if (nested?.path) {
        appPath = nested.path
        pubspec = await fetchRootFile(owner, name, branch, `${appPath}/pubspec.yaml`)
      } else if (nested?.submodule) {
        throw new ApiError('NOT_FLUTTER', "This repository's app code isn't on GitHub.", {
          step: 1,
          hint: `"${nested.submodule}" is a Git submodule without its source pushed, so there's nothing to build. Push the Flutter project's files (pubspec.yaml, lib/…) into the repository, then try again.`,
        })
      }
    }
    if (pubspec === null || (pubspec && !isFlutterPubspec(pubspec))) {
      const pkg = pubspec === null ? await fetchRootFile(owner, name, branch, 'package.json') : null
      const what = pubspec ? 'a Dart package without the Flutter SDK' : pkg ? `a ${describeStack(pkg)}` : 'a project with no pubspec.yaml at its root'
      throw new ApiError('NOT_FLUTTER', "We couldn't find a Flutter project in this repository.", {
        step: 1,
        hint: `This repository looks like ${what}. FlutterShow needs a pubspec.yaml that depends on the Flutter SDK, plus lib/main.dart (at the root or in a sub-folder).`,
      })
    }
    if (pubspec === undefined && !online)
      throw new ApiError('NETWORK', "We couldn't reach GitHub.", { step: 0, hint: 'Check your internet connection (GitHub may also be rate-limiting requests). Then retry.' })

    // 3 — pubspec.yaml + real routes
    onStep?.(2)
    const [commit, routes] = await Promise.all([fetchLatestCommit(owner, name, branch), appPath ? [] : fetchNamedRoutes(owner, name, branch)])

    // 4 — Preparing demo: check the build machine
    onStep?.(3)
    const [health, existing] = await Promise.all([buildServerHealth(), findBuild(`https://github.com/${owner}/${name}`)])

    const appName = pubspecField(pubspec, 'name')
    const screens = [
      { id: 'home', route: '/', name: 'App start' },
      ...routes.map((r) => ({ id: r.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'route', route: r, name: titleize(r.split('/').filter(Boolean).pop()) })),
    ].map((s) => ({ ...s, previewImageUrl: existing?.previewImageUrl ? BASE + existing.previewImageUrl : undefined }))

    return {
      ...repo,
      owner,
      repo: name,
      display: `github.com/${owner}/${name}`,
      name: titleize(appName || name),
      description: meta.description || pubspecField(pubspec, 'description')?.replace(/^A new Flutter project\.?$/i, '') || '',
      repositoryUrl: `https://github.com/${owner}/${name}`,
      appPath,
      branch,
      commit: commit || null,
      framework: 'Flutter',
      theme: 'default',
      screens,
      chrome: existing?.chrome,
      buildServer: health ? { mode: health.mode || 'local', configured: health.configured, flutter: health.flutter, git: health.git, actionsUrl: health.actionsUrl } : null,
    }
  },

  async createProject({ analysis, selectedDemo, name, description }, { onStep } = {}) {
    onStep?.(0)
    const health = await ensureBuildServer()
    const build = await runBuild({
      repositoryUrl: analysis.repositoryUrl,
      screens: analysis.screens.map(({ id, route, name: n }) => ({ id, route, name: n })),
      name: name?.trim() || analysis.name,
      description: description?.trim() || analysis.description,
      appPath: analysis.appPath,
    }, { onStep, hosted: health.mode === 'github' })
    invalidateBuilds()

    const list = read()
    const finalName = name?.trim() || analysis.name
    let slug = slugify(finalName)
    if (list.some((p) => p.slug === slug)) slug = `${slug}-${randomId(3)}`
    const now = new Date().toISOString()
    const project = {
      id: `prj_${randomId(10)}`,
      slug,
      name: finalName,
      description: description?.trim() || analysis.description || `Interactive Flutter demo of ${analysis.display}.`,
      repositoryUrl: analysis.repositoryUrl,
      branch: analysis.branch,
      commit: build.commit,
      framework: 'Flutter',
      flutterVersion: build.flutterVersion,
      theme: 'default',
      screens: analysis.screens,
      selectedDemo,
      // The share URL is /d/<owner>-<repo>: it works for every visitor and
      // survives rebuilds, because it points at the published build.
      demoId: build.slug || slugOf(build),
      appPath: analysis.appPath || undefined,
      status: 'live',
      createdAt: now,
      updatedAt: now,
    }
    unhide(project.demoId)
    write([project, ...list.filter((p) => norm(p.repositoryUrl) !== norm(project.repositoryUrl))])
    return hydrate(await attachBuild(project))
  },

  async updateProject(id, patch) {
    const list = read()
    if (String(id).startsWith('pub_') && !list.some((p) => p.id === id)) {
      const pub = await publishedProject(id.slice(4))
      if (pub) list.unshift(pub)
    }
    const i = list.findIndex((p) => p.id === id)
    if (i < 0) throw new ApiError('NOT_FOUND', "This project doesn't exist.")
    const allowed = ['name', 'description', 'selectedDemo']
    const clean = Object.fromEntries(Object.entries(patch).filter(([k]) => allowed.includes(k)))
    list[i] = { ...list[i], ...clean, updatedAt: new Date().toISOString() }
    write(list)
    return hydrate(await attachBuild(list[i]))
  },

  /** Rebuilds from the latest commit. demoId — and therefore the share URL — never changes. */
  async rebuildProject(id, { onStep } = {}) {
    const list = read()
    if (String(id).startsWith('pub_') && !list.some((p) => p.id === id)) {
      const pub = await publishedProject(id.slice(4))
      if (pub) list.unshift(pub)
    }
    const i = list.findIndex((p) => p.id === id)
    if (i < 0) throw new ApiError('NOT_FOUND', "This project doesn't exist.")
    if (SAMPLE_IDS.has(id)) {
      for (let s = 0; s < 4; s++) { onStep?.(s); await sleep(700) }
    } else {
      const health = await ensureBuildServer()
      const steps = [0, 1, 2, 3, 3] // build steps → rebuild steps
      const build = await runBuild(
        { repositoryUrl: list[i].repositoryUrl, screens: list[i].screens, name: list[i].name, description: list[i].description, appPath: list[i].appPath },
        { onStep: (s) => onStep?.(steps[s] ?? 3), hosted: health.mode === 'github' },
      )
      invalidateBuilds()
      list[i].commit = build.commit
    }
    list[i] = { ...list[i], status: 'live', updatedAt: new Date().toISOString() }
    write(list)
    return hydrate(await attachBuild(list[i]))
  },

  async deleteProject(id) {
    const list = read()
    const p = list.find((x) => x.id === id)
    // Published demos stay online for others; this just hides it from your list.
    if (String(id).startsWith('pub_')) hide(id.slice(4))
    else if (p?.demoId && (await realBuilds()).some((b) => slugOf(b) === p.demoId)) hide(p.demoId)
    write(list.filter((x) => x.id !== id))
  },

  async restoreSamples() {
    localStorage.removeItem(HIDDEN_KEY)
    if (SHOW_SAMPLES) write(MOCK_PROJECTS)
    return this.listProjects()
  },
}
