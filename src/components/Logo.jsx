import { Link } from 'react-router-dom'

export function LogoMark({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0A0A0B" />
      <path d="M18.5 7 9 16.5l3 3L24.5 7z" fill="#599DFF" />
      <path d="M18.5 15 13.5 20l5 5h6l-5-5 5-5z" fill="#fff" />
    </svg>
  )
}

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5 rounded-lg" aria-label="FlutterShow home">
      <LogoMark className="h-7 w-7 transition-transform duration-300 group-hover:rotate-[-6deg]" />
      <span className="text-[15px] font-semibold tracking-[-0.01em] text-zinc-900">FlutterShow</span>
    </Link>
  )
}
