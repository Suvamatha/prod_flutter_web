export default async function handler(req, res) {
  const projectId = String(req.query?.projectId || '')
  const buildId = String(req.query?.buildId || '')
  const uuid = /^[a-f0-9-]{36}$/i
  if (!uuid.test(projectId) || !uuid.test(buildId)) {
    res.statusCode = 400
    return res.end('Invalid demo')
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  if (!supabaseUrl) {
    res.statusCode = 500
    return res.end('Storage is not configured')
  }

  const upstream = await fetch(
    `${supabaseUrl}/storage/v1/object/public/demos/${projectId}/${buildId}/index.html`,
  )
  if (!upstream.ok) {
    res.statusCode = upstream.status
    return res.end(upstream.status === 404 ? 'Demo not found' : 'Storage error')
  }

  // Supabase intentionally serves HTML objects as text/plain. This small
  // same-origin endpoint corrects only index.html; large JS/WASM/assets still
  // come directly from Storage/CDN and never pass through a serverless function.
  const storageBase =
    `${supabaseUrl}/storage/v1/object/public/demos/${projectId}/${buildId}/`
  let html = await upstream.text()
  html = html.replace(
    /<base\s+href=["'][^"']*["']\s*\/?>/i,
    `<base href="${storageBase}">`,
  )

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, must-revalidate')
  res.end(html)
}