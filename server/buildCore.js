/**
 * FlutterShow build core — shared by the local dev build server
 * (server/flutterBuildServer.js) and the CI script (scripts/build-demo.mjs,
 * used by .github/workflows/build-demo.yml for hosted deployments).
 *
 *   git clone → find the Flutter app → flutter pub get → flutter build web
 *   → copy to demos/<owner>-<repo>/ → register in demos/index.json
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const isWin = process.platform === 'win32'
export const FLUTTER = process.env.FLUTTER_BIN || 'flutter'
export const REPO_RE = /^https:\/\/github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?\/?$/i

const env = { ...process.env, CI: 'true', FLUTTER_SUPPRESS_ANALYTICS: 'true', PUB_ENVIRONMENT: 'fluttershow', GIT_TERMINAL_PROMPT: '0' }

export function parseRepo(url) {
  const m = String(url || '').trim().match(REPO_RE)
  if (!m) return null
  return {
    owner: m[1],
    repo: m[2],
    repositoryUrl: `https://github.com/${m[1]}/${m[2]}`,
    slug: `${m[1]}-${m[2]}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
  }
}

export const titleCase = (s) =>
  s.replace(/[-_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase()).trim()

export function run(cmd, args, cwd, log) {
  return new Promise((resolve, reject) => {
    let out = ''
    const child = spawn(cmd, args, { cwd, env, shell: isWin })
    const onData = (d) => {
      const text = d.toString()
      out += text
      if (log) for (const line of text.split(/\r?\n/)) if (line.trim()) log(line.trimEnd())
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    child.on('error', (e) => reject(Object.assign(e, { missing: cmd })))
    child.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(`\`${cmd} ${args.join(' ')}\` exited with code ${code}`))))
  })
}

let flutterVersion
export async function detectFlutter(cwd = process.cwd()) {
  if (flutterVersion) return flutterVersion
  try {
    const out = await run(FLUTTER, ['--version', '--machine'], cwd)
    flutterVersion = JSON.parse(out.slice(out.indexOf('{'))).frameworkVersion
  } catch {
    flutterVersion = null
  }
  return flutterVersion
}
export async function hasGit(cwd = process.cwd()) {
  try {
    await run('git', ['--version'], cwd)
    return true
  } catch {
    return false
  }
}

const isFlutterApp = (dir) => {
  const pub = path.join(dir, 'pubspec.yaml')
  if (!fs.existsSync(pub)) return false
  return /^\s+sdk:\s*flutter\s*$/m.test(fs.readFileSync(pub, 'utf8')) && fs.existsSync(path.join(dir, 'lib', 'main.dart'))
}

/** Finds the Flutter app: repo root, or a sub-folder up to 3 levels deep (monorepos). */
export function findAppDir(root, hint) {
  if (hint) {
    const d = path.join(root, hint)
    if (isFlutterApp(d)) return d
  }
  if (isFlutterApp(root)) return root
  const skip = new Set(['.git', '.dart_tool', 'build', 'node_modules', 'android', 'ios', 'linux', 'macos', 'windows', 'web', 'test', 'example'])
  let level = [root]
  for (let depth = 0; depth < 3; depth++) {
    const next = []
    for (const dir of level) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (!e.isDirectory() || skip.has(e.name) || e.name.startsWith('.')) continue
        const d = path.join(dir, e.name)
        if (isFlutterApp(d)) return d
        next.push(d)
      }
    }
    level = next
  }
  return null
}

export const indexPath = (demosDir) => path.join(demosDir, 'index.json')
export function readIndex(demosDir) {
  try {
    return JSON.parse(fs.readFileSync(indexPath(demosDir), 'utf8'))
  } catch {
    return { builds: [] }
  }
}
export function register(demosDir, entry) {
  const db = readIndex(demosDir)
  const old = db.builds.find((b) => b.repositoryUrl.toLowerCase() === entry.repositoryUrl.toLowerCase())
  db.builds = db.builds.filter((b) => b !== old)
  // Keep hand-edited fields (name, description, chrome, previewImageUrl…) across rebuilds.
  db.builds.push({ ...old, ...Object.fromEntries(Object.entries(entry).filter(([, v]) => v !== undefined && v !== '')) })
  fs.mkdirSync(demosDir, { recursive: true })
  fs.writeFileSync(indexPath(demosDir), JSON.stringify(db, null, 2) + '\n')
  return db.builds.at(-1)
}

async function githubMeta(owner, repo, token) {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      signal: AbortSignal.timeout(8000),
    })
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}

/**
 * Builds one repository into demosDir. Throws an Error with a friendly
 * `.friendly` message on failure. `onStep(0..4)` reports progress.
 * `token` (optional) lets CI clone private repositories.
 */
export async function buildDemo({ demosDir, repositoryUrl, screens, name, description, appPath, token, log = () => {}, onStep = () => {} }) {
  const repo = parseRepo(repositoryUrl)
  if (!repo) throw Object.assign(new Error('Invalid repository URL'), { friendly: "That doesn't look like a valid GitHub repository." })
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'fluttershow-'))
  const src = path.join(work, 'src')
  let step = 0
  try {
    const version = await detectFlutter()
    if (!version) throw Object.assign(new Error('Flutter SDK not found'), { missing: FLUTTER })

    onStep((step = 0))
    log(`$ git clone --depth 1 ${repo.repositoryUrl}`)
    const cloneUrl = token ? `https://x-access-token:${token}@github.com/${repo.owner}/${repo.repo}.git` : `${repo.repositoryUrl}.git`
    await run('git', ['clone', '--depth', '1', '--recurse-submodules', '--shallow-submodules', cloneUrl, src], work, (l) => log(token ? l.replaceAll(token, '***') : l))
    const commit = (await run('git', ['rev-parse', '--short', 'HEAD'], src)).trim()
    const appDir = findAppDir(src, appPath)
    if (!appDir)
      throw Object.assign(new Error('No Flutter app found'), {
        friendly: 'No Flutter app found in this repository (looked for pubspec.yaml + lib/main.dart, up to 3 folders deep). Make sure the app source code is pushed.',
      })
    const rel = path.relative(src, appDir)
    if (rel) log(`→ Flutter app found in /${rel.replaceAll('\\', '/')}`)

    onStep((step = 1))
    log('$ flutter pub get')
    await run(FLUTTER, ['pub', 'get'], appDir, log)

    onStep((step = 2))
    log(`$ flutter build web --release --base-href /demos/${repo.slug}/`)
    await run(FLUTTER, ['build', 'web', '--release', '--base-href', `/demos/${repo.slug}/`], appDir, log)

    onStep((step = 3))
    const out = path.join(demosDir, repo.slug)
    fs.rmSync(out, { recursive: true, force: true })
    fs.mkdirSync(demosDir, { recursive: true })
    fs.cpSync(path.join(appDir, 'build', 'web'), out, { recursive: true })

    onStep((step = 4))
    const meta = await githubMeta(repo.owner, repo.repo, token)
    const existing = readIndex(demosDir).builds.find((b) => b.repositoryUrl.toLowerCase() === repo.repositoryUrl.toLowerCase())
    const entry = register(demosDir, {
      slug: repo.slug,
      repositoryUrl: repo.repositoryUrl,
      demoUrl: `/demos/${repo.slug}/`,
      name: name || existing?.name || titleCase(repo.repo),
      description: description || existing?.description || meta?.description || undefined,
      private: meta ? !!meta.private : undefined,
      appPath: rel ? rel.replaceAll('\\', '/') : undefined,
      commit,
      flutterVersion: version,
      builtAt: new Date().toISOString(),
      screens: screens?.length ? screens : existing?.screens || [{ id: 'home', route: '/', name: 'App start' }],
    })
    log(`✓ Published /demos/${repo.slug}/`)
    return entry
  } catch (e) {
    e.step = step
    e.friendly ||=
      e.missing === 'git'
        ? 'Git is not installed on the build machine.'
        : e.missing
          ? 'The Flutter SDK was not found on the build machine.'
          : step === 0
            ? "Couldn't clone the repository. Is it public (or is REPO_TOKEN set for private repos)?"
            : step === 2
              ? 'flutter build web failed — see the log.'
              : e.message
    log(`✗ ${e.message}`)
    throw e
  } finally {
    fs.rm(work, { recursive: true, force: true }, () => {})
  }
}
