import { admin, assertBuildAllowance, dispatchBuild, handleError, id, requireUser, send } from '../../_lib/server.js'

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return send(res, 405, { code: 'METHOD', message: 'POST only.' })
    const user = await requireUser(req)
    await assertBuildAllowance(user.id)
    const projectId = String(req.query?.id || '')
    const { data: project, error } = await admin.from('projects').select('*').eq('id', projectId).eq('user_id', user.id).maybeSingle()
    if (error) throw error
    if (!project) return send(res, 404, { code: 'NOT_FOUND', message: "This project doesn't exist." })
    const buildId = id()
    await admin.from('builds').insert({ id: buildId, project_id: project.id, user_id: user.id, status: 'queued', step: 0, logs: ['Rebuild queued…'] })
    await admin.from('projects').update({ status: 'building', updated_at: new Date().toISOString() }).eq('id', project.id)
    await dispatchBuild({ buildId, project })
    return send(res, 202, { jobId: buildId })
  } catch (error) {
    handleError(res, error)
  }
}