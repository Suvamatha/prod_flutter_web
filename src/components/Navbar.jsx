import { NavLink, Link } from 'react-router-dom'
import { Github, LogOut, Plus } from 'lucide-react'
import Logo from './Logo'
import { PRODUCT_GITHUB_URL } from '../lib/config'
import { useAuth } from '../hooks/useAuth'

const linkCls = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm transition-colors ${isActive ? 'text-zinc-900 font-medium' : 'text-zinc-500 hover:text-zinc-900'}`

export default function Navbar() {
  const { user, signOut } = useAuth()
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-[#FAFAFA]/80 backdrop-blur-xl">
      <nav className="container-page flex h-16 items-center gap-6">
        <Logo />
        <div className="hidden items-center gap-1 sm:flex">
          <NavLink to="/" end className={linkCls}>My Projects</NavLink>
          <NavLink to="/how-it-works" className={linkCls}>How It Works</NavLink>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <a href={PRODUCT_GITHUB_URL} target="_blank" rel="noreferrer" className="icon-btn h-9 w-9" aria-label="GitHub">
            <Github className="h-[18px] w-[18px]" />
          </a>
          {user && (
            <button onClick={signOut} className="icon-btn h-9 w-9" aria-label="Sign out" title="Sign out">
              <LogOut className="h-[17px] w-[17px]" />
            </button>
          )}
          <span className="mx-1 hidden h-5 w-px bg-zinc-200 sm:block" />
          <Link to="/new" className="btn btn-primary h-9 px-3.5">
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </nav>
      <div className="container-page -mt-1 flex gap-1 pb-2 sm:hidden">
        <NavLink to="/" end className={linkCls}>My Projects</NavLink>
        <NavLink to="/how-it-works" className={linkCls}>How It Works</NavLink>
      </div>
    </header>
  )
}
