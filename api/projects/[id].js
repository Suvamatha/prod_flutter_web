import { admin, body, handleError, mapProject, requireUser, send } from '../_lib/server.js'

export default async function handler(req, res) {
  try {
    const user = await requireUser(req)
    const key = String(req.query?.id || '').trim()
    let query = admin.from('projects').select('*').eq('user_id', user.id)
    query = /^[0-9a-f-]{36}$/i.test(key) ? query.eq('id', key) : query.eq('slug', key)
    const { data: project, error } = await query.maybeSingle()
    if (error) throw error
    if (!project) return send(res, 404, { code: 'NOT_FOUND', message: "This project doesn't exist." })

    if (req.method === 'GET') return send(res, 200, mapProject(project))
    if (req.method === 'PATCH') {
      const input = await body(req)
      const patch = {}
      if (typeof input.name === 'string') patch.name = input.name.slice(0, 100)
      if (typeof input.description === 'string') patch.description = input.description.slice(0, 500)
      if (input.selectedDemo) patch.selected_demo = input.selectedDemo
      patch.updated_at = new Date().toISOString()
      const { data, error: updateError } = await admin.from('projects').update(patch).eq('id', project.id).eq('user_id', user.id).select().single()
      if (updateError) throw updateError
      return send(res, 200, mapProject(data))
    }
    if (req.method === 'DELETE') {
      const { error: deleteError } = await admin.from('projects').delete().eq('id', project.id).eq('user_id', user.id)
      if (deleteError) throw deleteError
      return send(res, 204, null)
    }
    return send(res, 405, { code: 'METHOD', message: 'Method not allowed.' })
  } catch (error) {
    handleError(res, error)
  }
}