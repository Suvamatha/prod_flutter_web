import { admin, handleError, mapProject, requireUser, send } from '../_lib/server.js'

export default async function handler(req, res) {
  try {
    const user = await requireUser(req)
    const buildId = String(req.query?.id || '')
    const { data: build, error } = await admin.from('builds').select('*').eq('id', buildId).eq('user_id', user.id).maybeSingle()
    if (error) throw error
    if (!build) return send(res, 404, { code: 'NOT_FOUND', message: 'Build not found.' })
    const active = build.status === 'queued' || build.status === 'running'
    const expired = Date.now() - new Date(build.created_at).getTime() > 40 * 60 * 1000
    if (active && expired) {
      const message = 'Build worker timed out before publishing the demo.'
      await admin.from('builds').update({
        status: 'failed',
        error_message: message,
        completed_at: new Date().toISOString(),
      }).eq('id', build.id)
      const { data: previous } = await admin.from('projects').select('demo_url').eq('id', build.project_id).maybeSingle()
      await admin.from('projects').update({
        status: previous?.demo_url ? 'live' : 'failed',
        updated_at: new Date().toISOString(),
      }).eq('id', build.project_id)
      build.status = 'failed'
      build.error_message = message
    }
    let project = null
    if (build.status === 'succeeded') {
      const result = await admin.from('projects').select('*').eq('id', build.project_id).single()
      if (result.error) throw result.error
      project = mapProject(result.data)
    }
    return send(res, 200, {
      id: build.id,
      status: build.status,
      step: build.step,
      log: build.logs || [],
      error: build.error_message,
      project,
    })
  } catch (error) {
    handleError(res, error)
  }
}