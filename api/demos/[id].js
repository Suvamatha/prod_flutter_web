import { admin, handleError, mapProject, send } from '../_lib/server.js'

export default async function handler(req, res) {
  try {
    const demoId = String(req.query?.id || '')
    const { data, error } = await admin
      .from('projects')
      .select('*')
      .eq('demo_id', demoId)
      .not('demo_url', 'is', null)
      .maybeSingle()
    if (error) throw error
    if (!data) return send(res, 404, { code: 'NOT_FOUND', message: "This demo doesn't exist or is not live yet." })
    return send(res, 200, mapProject(data))
  } catch (error) {
    handleError(res, error)
  }
}