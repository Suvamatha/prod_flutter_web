import { admin, handleError, mapProject, requireUser, send } from '../_lib/server.js'

export default async function handler(req, res) {
  try {
    const user = await requireUser(req)
    const buildId = String(req.query?.id || '')
    const { data: build, error } = await admin.from('builds').select('*').eq('id', buildId).eq('user_id', user.id).maybeSingle()
    if (error) throw error
    if (!build) return send(res, 404, { code: 'NOT_FOUND', message: 'Build not found.' })
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