import { createClient } from '@supabase/supabase-js'

const { BUILD_ID, PROJECT_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!BUILD_ID || !PROJECT_ID || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) process.exit(0)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const { data: build } = await supabase.from('builds').select('status,logs').eq('id', BUILD_ID).maybeSingle()
if (build?.status === 'succeeded' || build?.status === 'failed') process.exit(0)

const message = 'The build worker stopped before it could publish the demo. Check the GitHub Actions run for the failed step.'
await supabase.from('builds').update({
  status: 'failed',
  error_message: message,
  logs: [...(build?.logs || []), message],
  completed_at: new Date().toISOString(),
}).eq('id', BUILD_ID)

const { data: project } = await supabase.from('projects').select('demo_url').eq('id', PROJECT_ID).maybeSingle()
await supabase.from('projects').update({
  status: project?.demo_url ? 'live' : 'failed',
  updated_at: new Date().toISOString(),
}).eq('id', PROJECT_ID)