/**
 * Runtime configuration. Everything environment-specific lives here so the
 * mock layer can be swapped for a real backend without touching UI code.
 */
export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.VITE_SUPABASE_URL ? '/api' : '')
export const SHARE_ORIGIN = (import.meta.env.VITE_SHARE_ORIGIN || window.location.origin).replace(/\/$/, '')
export const BASE_PATH = import.meta.env.BASE_URL || '/'
export const PRODUCT_GITHUB_URL = 'https://github.com'
