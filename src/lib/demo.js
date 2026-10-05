import { SHARE_ORIGIN } from './config'
import { stripProtocol } from './format'

/** Permanent public share URL for a project. Never changes across rebuilds. */
export const shareUrlFor = (demoId) => `${SHARE_ORIGIN}/d/${demoId}`
export const shareDisplay = (demoId) => stripProtocol(shareUrlFor(demoId))
export const sharePath = (demoId) => `/d/${demoId}`

/**
 * The iframe src for a project's hosted Flutter Web build.
 * `demoUrl` points at the deployed `flutter build web` output; the selected
 * starting screen is passed as a hash route (Flutter's default URL strategy),
 * so changing it never requires a rebuild.
 */
export function resolveDemoSrc(project) {
  if (!project?.demoUrl) return null
  const route = project.selectedDemo?.route || '/'
  const base = project.demoUrl.split('#')[0]
  return `${base}#${route}`
}
