import { admin, assertBuildAllowance, body, dispatchBuild, handleError, id, mapProject, requireUser, send, slugify } from '../_lib/server.js'

export default async function handler(req, res) {
  try {
    const user = await requireUser(req)
    if (req.method === 'GET') {
      const { data, error } = await admin.from('projects').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
      if (error) throw error
      return send(res, 200, data.map(mapProject))
    }
    if (req.method !== 'POST') return send(res, 405, { code: 'METHOD', message: 'Method not allowed.' })

    await assertBuildAllowance(user.id)
    const input = await body(req)
    const analysis = input.analysis
    if (!analysis?.repositoryUrl || !analysis.owner || !analysis.repo) {
      return send(res, 400, { code: 'INVALID_REPO', message: 'Repository analysis is missing.' })
    }
    const appPath = String(analysis.appPath || '').replaceAll('\\', '/').replace(/^\/+|\/+$/g, '')
    if (appPath.split('/').some((part) => part === '..' || part === '.') || !/^[a-zA-Z0-9_./-]*$/.test(appPath)) {
      return send(res, 400, { code: 'INVALID_PATH', message: 'The Flutter app path is invalid.' })
    }

    const { data: existing, error: existingError } = await admin
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('repository_url', analysis.repositoryUrl)
      .maybeSingle()
    if (existingError) throw existingError

    const projectId = existing?.id || id()
    const demoId = existing?.demo_id || id()
    const now = new Date().toISOString()
    const row = {
      id: projectId,
      user_id: user.id,
      slug: existing?.slug || `${slugify(input.name || analysis.name)}-${projectId.slice(0, 6)}`,
      demo_id: demoId,
      name: String(input.name || analysis.name || analysis.repo).slice(0, 100),
      description: String(input.description || analysis.description || '').slice(0, 500),
      repository_url: analysis.repositoryUrl,
      github_owner: analysis.owner,
      github_repo: analysis.repo,
      branch: analysis.branch || 'main',
      commit_sha: analysis.commit || null,
      app_path: appPath || null,
      screens: analysis.screens || [],
      selected_demo: input.selectedDemo || analysis.screens?.[0] || null,
      theme: analysis.theme || 'default',
      chrome: analysis.chrome || null,
      status: 'building',
      created_at: existing?.created_at || now,
      updated_at: now,
    }
    const projectWrite = existing
      ? admin.from('projects').update(row).eq('id', projectId).eq('user_id', user.id)
      : admin.from('projects').insert(row)
    const { error: projectError } = await projectWrite
    if (projectError) throw projectError

    const buildId = id()
    const { error: buildError } = await admin.from('builds').insert({
      id: buildId,
      project_id: projectId,
      user_id: user.id,
      status: 'queued',
      step: 0,
      logs: ['Build queued…'],
    })
    if (buildError) throw buildError

    try {
      await dispatchBuild({ buildId, project: row })
    } catch (error) {
      await admin.from('builds').update({ status: 'failed', error_message: error.message }).eq('id', buildId)
      await admin.from('projects').update({ status: existing?.demo_url ? 'live' : 'failed' }).eq('id', projectId)
      throw error
    }
    return send(res, 202, { jobId: buildId })
  } catch (error) {
    handleError(res, error)
  }
}