#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { findAppDir, run, detectFlutter, parseRepo } from '../server/buildCore.js'

const buildId = process.env.BUILD_ID
const projectId = process.env.PROJECT_ID
const repositoryUrl = process.env.REPOSITORY_URL
const appPath = process.env.APP_PATH || ''
const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const publicOrigin = String(process.env.PUBLIC_APP_ORIGIN || '').replace(/\/$/, '')

if (!buildId || !projectId || !repositoryUrl || !supabaseUrl || !serviceKey || !publicOrigin) throw new Error('Worker environment is incomplete.')

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
const logs = []
const addLog = (line) => {
  if (!line) return
  logs.push(String(line).replace(serviceKey, '***'))
  if (logs.length > 160) logs.shift()
  console.log(line)
}
const updateBuild = async (patch) => {
  const { error } = await supabase.from('builds').update({ ...patch, logs }).eq('id', buildId)
  if (error) throw error
}
const updateProject = async (patch) => {
  const { error } = await supabase.from('projects').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', projectId)
  if (error) throw error
}
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.wasm': 'application/wasm', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
}
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(dir, entry.name)
  return entry.isDirectory() ? walk(target) : [target]
})
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'fluttershow-worker-'))
const source = path.join(work, 'source')

try {
  await updateBuild({ status: 'running', step: 0, started_at: new Date().toISOString() })
  const parsed = parseRepo(repositoryUrl)
  if (!parsed) throw new Error('Invalid GitHub repository URL.')
  addLog(`Cloning ${parsed.owner}/${parsed.repo}`)
  await run('git', ['clone', '--depth', '1', '--recurse-submodules', '--shallow-submodules', `${parsed.repositoryUrl}.git`, source], work, addLog)
  const commit = (await run('git', ['rev-parse', '--short', 'HEAD'], source)).trim()
  const appDir = findAppDir(source, appPath)
  if (!appDir) throw new Error('No Flutter app found. Expected pubspec.yaml and lib/main.dart.')

  await updateBuild({ step: 1, commit_sha: commit })
  addLog('Preparing Flutter web platform')
  await run('flutter', ['config', '--enable-web'], appDir, addLog)
  if (!fs.existsSync(path.join(appDir, 'web'))) await run('flutter', ['create', '--platforms=web', '.'], appDir, addLog)
  await run('flutter', ['pub', 'get'], appDir, addLog)

  const prefix = `${projectId}/${buildId}/`
  const storageBase = `${supabaseUrl}/storage/v1/object/public/demos/${prefix}`
  const baseHref = new URL(storageBase).pathname
  await updateBuild({ step: 2 })
  addLog(`Building Flutter web with base path ${baseHref}`)
  await run('flutter', ['build', 'web', '--release', '--base-href', baseHref], appDir, addLog)

  await updateBuild({ step: 3 })
  const output = path.join(appDir, 'build', 'web')
  const files = walk(output)
  addLog(`Uploading ${files.length} build files`)
  for (let i = 0; i < files.length; i += 10) {
    await Promise.all(files.slice(i, i + 10).map(async (file) => {
      const relative = path.relative(output, file).split(path.sep).join('/')
      const extension = path.extname(file).toLowerCase()
      const { error } = await supabase.storage.from('demos').upload(`${prefix}${relative}`, fs.readFileSync(file), {
        upsert: true,
        contentType: MIME[extension] || 'application/octet-stream',
        cacheControl: extension === '.html' ? '60' : '31536000',
      })
      if (error) throw error
    }))
  }

  const demoUrl = `${publicOrigin}/api/demo-index/${projectId}/${buildId}`
  const flutterVersion = await detectFlutter(appDir)
  await updateProject({ status: 'live', demo_url: demoUrl, commit_sha: commit, flutter_version: flutterVersion })
  await updateBuild({ status: 'succeeded', step: 4, demo_url: demoUrl, completed_at: new Date().toISOString() })
  addLog(`Live demo: ${demoUrl}`)
} catch (error) {
  addLog(`Build failed: ${error.message}`)
  await supabase.from('builds').update({ status: 'failed', error_message: error.message, logs, completed_at: new Date().toISOString() }).eq('id', buildId)
  const { data: previous } = await supabase.from('projects').select('demo_url').eq('id', projectId).maybeSingle()
  await supabase.from('projects').update({ status: previous?.demo_url ? 'live' : 'failed', updated_at: new Date().toISOString() }).eq('id', projectId)
  process.exitCode = 1
} finally {
  fs.rmSync(work, { recursive: true, force: true })
}
