export function timeAgo(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 45) return 'just now'
  const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800],
    ['day', 86400], ['hour', 3600], ['minute', 60],
  ]
  for (const [unit, secs] of units) {
    const v = Math.floor(diff / secs)
    if (v >= 1) return `${v} ${unit}${v > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function titleize(slug = '') {
  return slug
    .replace(/[_-]+/g, ' ')
    .replace(/\bflutter\b/gi, '')
    .replace(/\bapp\b/gi, (m) => m)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Flutter App'
}

export function slugify(s = '') {
  return s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-') || 'project'
}

export function randomId(len = 6) {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
  let out = ''
  const buf = crypto.getRandomValues(new Uint8Array(len))
  for (const b of buf) out += chars[b % chars.length]
  return out
}

export function randomSha() {
  return Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(16).padStart(2, '0')).join('').slice(0, 7)
}

export const stripProtocol = (url = '') => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
