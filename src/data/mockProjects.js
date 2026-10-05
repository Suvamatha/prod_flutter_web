import { screensFor } from '../lib/themes'

const ago = (mins) => new Date(Date.now() - mins * 60_000).toISOString()

/** Base URL of the placeholder hosted build. Replace with the real build host. */
export const mockBuildUrl = ({ theme, name, commit }) =>
  `${import.meta.env.BASE_URL}mock-demo/index.html?app=${theme}&name=${encodeURIComponent(name)}&build=${commit}`

function project(p) {
  const screens = screensFor(p.theme)
  return {
    branch: 'main',
    status: 'live',
    framework: 'Flutter',
    flutterVersion: '3.24.3',
    screens,
    selectedDemo: screens[p.selected ?? 0],
    demoUrl: mockBuildUrl(p),
    ...p,
  }
}

/**
 * Seed data. Shape mirrors the backend Project record:
 * { id, slug, name, description, repositoryUrl, branch, commit, selectedDemo,
 *   screens, demoId, demoUrl, shareUrl*, status, createdAt, updatedAt }
 * (*shareUrl is derived from demoId so it stays stable across environments.)
 */
export const MOCK_PROJECTS = [
  project({
    id: 'prj_uzina', slug: 'uzina', name: 'Uzina', theme: 'uzina',
    description: 'Flutter real estate app for browsing, saving and booking property viewings.',
    repositoryUrl: 'https://github.com/username/uzina', commit: 'a91f3c2', demoId: '7xk29p',
    createdAt: ago(60 * 24 * 21), updatedAt: ago(60 * 2),
  }),
  project({
    id: 'prj_wellness', slug: 'wellness', name: 'Wellness', theme: 'wellness',
    description: "Women's wellness tracker for cycles, mood, sleep and daily habits.",
    repositoryUrl: 'https://github.com/username/wellness-tracker', commit: '3be07d1', demoId: 'w3lnz8',
    createdAt: ago(60 * 24 * 14), updatedAt: ago(60 * 26),
  }),
  project({
    id: 'prj_medical', slug: 'medical-reports', name: 'Medical Reports', theme: 'medical',
    description: 'Digital medical reporting app for clinicians to review and share lab results.',
    repositoryUrl: 'https://github.com/username/medical-reports', commit: 'c4d82e9', demoId: 'mdr4q1',
    createdAt: ago(60 * 24 * 30), updatedAt: ago(60 * 24 * 3), selected: 1,
  }),
  project({
    id: 'prj_finance', slug: 'finance', name: 'Finance', theme: 'finance',
    description: 'Personal finance app with balances, budgets and spending insights.',
    repositoryUrl: 'https://github.com/username/finance-flutter', commit: '7f1a0b4', demoId: 'fn82kd',
    createdAt: ago(60 * 24 * 45), updatedAt: ago(60 * 24 * 6),
  }),
  project({
    id: 'prj_foodie', slug: 'foodie', name: 'Foodie', theme: 'foodie',
    description: 'Restaurant discovery app with nearby spots, menus and table reservations.',
    repositoryUrl: 'https://github.com/username/foodie', commit: 'e28c6d5', demoId: 'fd5t0e',
    createdAt: ago(60 * 24 * 60), updatedAt: ago(60 * 24 * 12),
  }),
]
