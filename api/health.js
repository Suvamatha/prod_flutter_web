export default function handler(_req, res) {
  const repo = process.env.PLATFORM_GITHUB_REPO || ''
  const workflow = process.env.PLATFORM_BUILD_WORKFLOW || 'build-demo.yml'
  const configured = Boolean(
    repo &&
    process.env.PLATFORM_GITHUB_TOKEN &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify({
    ok: true,
    mode: 'github',
    configured,
    git: true,
    flutter: configured ? 'stable (FlutterShow build worker)' : null,
    actionsUrl: repo ? `https://github.com/${repo}/actions/workflows/${workflow}` : null,
  }))
}
