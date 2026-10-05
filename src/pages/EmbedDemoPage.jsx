import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import DevicePreview from '../components/DevicePreview'
import { api } from '../lib/api'
import { resolveDemoSrc } from '../lib/demo'
import { getTheme } from '../lib/themes'

export default function EmbedDemoPage() {
  const { demoId } = useParams()
  const [project, setProject] = useState(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    api.getProjectByDemoId(demoId).then(setProject).catch(() => setMissing(true))
  }, [demoId])

  if (missing) return <div className="grid min-h-svh place-items-center bg-zinc-950 p-6 text-center text-sm text-zinc-400">Demo unavailable</div>
  if (!project) return <div className="min-h-svh animate-pulse bg-zinc-100" />

  return (
    <div className="grid min-h-svh place-items-center overflow-hidden bg-transparent p-2">
      <DevicePreview
        src={resolveDemoSrc(project)}
        title={project.name}
        chrome={project.chrome || { background: getTheme(project.theme).surface }}
        controls="minimal"
        className="h-full w-full"
        stageClassName="h-[calc(100svh-16px)] min-h-[520px]"
      />
    </div>
  )
}