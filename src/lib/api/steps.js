/** Progress steps shared by the UI and every API implementation. */
export const ANALYSIS_STEPS = [
  { label: 'Repository found', detail: 'GET github.com/:owner/:repo' },
  { label: 'Flutter project detected', detail: 'dart · flutter sdk' },
  { label: 'pubspec.yaml found', detail: 'dependencies resolved' },
  { label: 'Preparing demo', detail: 'scanning routes' },
]

export const BUILD_STEPS = [
  { label: 'Repository connected', detail: 'git clone --depth 1' },
  { label: 'Dependencies installed', detail: 'flutter pub get' },
  { label: 'Flutter application built', detail: 'flutter build web --release' },
  { label: 'Deploying demo', detail: 'uploading to edge' },
  { label: 'Generating share URL', detail: 'permanent link' },
]

export const REBUILD_STEPS = [
  { label: 'Latest commit fetched', detail: 'git fetch origin' },
  { label: 'Dependencies installed', detail: 'flutter pub get' },
  { label: 'Flutter application rebuilt', detail: 'flutter build web --release' },
  { label: 'Demo updated', detail: 'same share URL' },
]
